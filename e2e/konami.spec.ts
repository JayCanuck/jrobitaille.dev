// The Konami egg (D14 amendment): the island loads on the first keydown and never before; the full
// sequence brings the 404's UFO and cow to the bottom-right corner with the 404 line as a toast,
// a fixed, aria-hidden layer that changes no layout; a wrong sequence does nothing; under reduced
// motion the payoff fades in place; the drawing is requested only when the sequence completes.
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

import { siteCopy } from '../src/content/site';

const KONAMI_MARKER = 'ArrowLeft';
const KEYS = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a'
];
const WRONG_KEYS = [...KEYS.slice(0, 8), 'a', 'b'];

const armed = (page: Page) => page.locator('[data-konami="armed"]');
const payoff = (page: Page) => page.locator('[data-konami="showing"]');
const badge = (page: Page) => page.getByRole('button', { name: siteCopy.agentTools.badge });

// Scripts fetched after the load event whose body is the egg's chunk.
const konamiChunks = async (page: Page, request: APIRequestContext) => {
  const urls = await page.evaluate(() => {
    const [navigation] = performance.getEntriesByType('navigation');
    const loadStart = (navigation as PerformanceNavigationTiming).loadEventStart;
    return performance
      .getEntriesByType('resource')
      .filter(entry => entry.startTime > loadStart && /\.js(\?|$)/.test(entry.name))
      .map(entry => entry.name);
  });
  const found: string[] = [];
  for (const url of urls) {
    if ((await (await request.get(url)).text()).includes(KONAMI_MARKER)) found.push(url);
  }
  return found;
};

const drawingRequests = (page: Page) =>
  page.evaluate(
    () =>
      performance.getEntriesByType('resource').filter(entry => entry.name.includes('ufo-and-cow'))
        .length
  );

// Hydration first (the Toolbox control renders then), since the loader's listener is armed from
// a ref callback; then the first key loads the island (and is replayed into it); the rest follow
// once it is armed.
const type = async (page: Page, keys: string[]) => {
  await expect(page.getByRole('button', { name: siteCopy.skillsView.list })).toBeVisible();
  for (const [index, key] of keys.entries()) {
    await page.keyboard.press(key);
    if (index === 0) await expect(armed(page)).toBeAttached({ timeout: 10_000 });
  }
};

test('nothing loads the egg before a keydown: load, idle, a scroll, a wheel, a click', async ({
  page,
  request
}) => {
  await page.goto('/', { waitUntil: 'load' });
  await expect(badge(page)).toBeVisible({ timeout: 10_000 });
  await page.mouse.wheel(0, 600);
  await page.mouse.move(200, 300);
  await page.mouse.click(200, 300);
  await page.waitForTimeout(1500);
  await expect(armed(page)).toHaveCount(0);
  expect(await konamiChunks(page, request)).toEqual([]);
  expect(await drawingRequests(page)).toBe(0);
});

test('the sequence shows the payoff with the 404 line and requests the drawing only then; it leaves on its own', async ({
  page
}) => {
  await page.goto('/', { waitUntil: 'load' });
  await type(page, KEYS.slice(0, 9));
  expect(await drawingRequests(page)).toBe(0);
  await expect(payoff(page)).toHaveCount(0);
  await page.keyboard.press(KEYS[9] ?? '');
  await expect(payoff(page)).toBeAttached();
  await expect(payoff(page)).toHaveAttribute('aria-hidden', 'true');
  await expect(payoff(page)).toContainText(siteCopy.notFound.cow);
  await expect(payoff(page).locator('img')).toHaveAttribute('alt', '');
  await expect(payoff(page).locator('a, button, [tabindex]')).toHaveCount(0);
  await expect.poll(() => drawingRequests(page)).toBe(1);
  await expect(payoff(page)).toHaveCSS('position', 'fixed');
  await expect(payoff(page)).toHaveCSS('pointer-events', 'none');
  // Repeating the sequence while it shows does nothing: still one payoff, one drawing request.
  for (const key of KEYS) await page.keyboard.press(key);
  await expect(payoff(page)).toHaveCount(1);
  expect(await drawingRequests(page)).toBe(1);
  // It leaves within the visit (5.5 s) and the page is as before.
  await expect(payoff(page)).toHaveCount(0, { timeout: 8000 });
  // After it has left, the sequence works again.
  for (const key of KEYS) await page.keyboard.press(key);
  await expect(payoff(page)).toBeAttached();
});

test('a wrong sequence shows nothing', async ({ page }) => {
  await page.goto('/', { waitUntil: 'load' });
  await type(page, WRONG_KEYS);
  await page.waitForTimeout(500);
  await expect(payoff(page)).toHaveCount(0);
  expect(await drawingRequests(page)).toBe(0);
});

test('under reduced motion the payoff fades in place and the drawing does not float', async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/', { waitUntil: 'load' });
  await type(page, KEYS);
  await expect(payoff(page)).toBeAttached();
  await expect(payoff(page)).toHaveCSS('animation-name', 'cow-fade');
  await expect(payoff(page).locator('picture')).toHaveCSS('animation-name', 'none');
  const box = await payoff(page).boundingBox();
  const viewport = page.viewportSize();
  if (!box || !viewport) throw new Error('no payoff box');
  // In place: inside the viewport's bottom-right corner, never off screen.
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
});

test('with motion on the payoff rises from the bottom edge', async ({ page }) => {
  await page.goto('/', { waitUntil: 'load' });
  await type(page, KEYS);
  await expect(payoff(page)).toHaveCSS('animation-name', 'cow-visit');
  await expect(payoff(page).locator('picture')).toHaveCSS('animation-name', 'float');
});

test('axe is clean while the payoff shows', async ({ page }) => {
  await page.goto('/', { waitUntil: 'load' });
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter(
          animation =>
            !(animation.timeline instanceof ScrollTimeline) && animation.playState === 'running'
        )
        .map(animation => animation.finished)
    )
  );
  await type(page, KEYS);
  await expect(payoff(page)).toBeAttached();
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'])
    .analyze();
  expect(results.violations).toEqual([]);
  await expect(payoff(page)).toBeAttached();
});
