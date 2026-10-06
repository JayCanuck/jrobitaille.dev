// The skills cloud (D18): the chips are the view at first paint in every case; once the cloud has
// mounted the canvas overlays them inside the same reserved box, the chips fade but stay in the DOM
// and the accessibility tree, and the List/Cloud control appears. Reduced motion, reduced data,
// saveData, no WebGL and no interaction each leave the chips with no cloud chunk requested.
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type APIRequestContext, type Browser, type Page } from '@playwright/test';

import { skills } from '../src/content/resume';
import { siteCopy } from '../src/content/site';

const TERM_COUNT = skills.flatMap(group => group.terms).length;
const THREE_MARKER = 'WebGLRenderer';

const chips = (page: Page) => page.locator('#skills').getByRole('listitem');
const chipBlock = (page: Page) => page.locator('[data-island="cloud"] > div').first();
const box = (page: Page) => page.locator('[data-island="cloud"]');
const canvas = (page: Page) => page.locator('[data-island="cloud"] canvas');
const island = (page: Page) => page.locator('[data-island="cloud"] [data-cloud-state]');

// Scripts fetched after the load event whose body is the three.js bundle.
const cloudChunks = async (page: Page, request: APIRequestContext) => {
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
    if ((await (await request.get(url)).text()).includes(THREE_MARKER)) found.push(url);
  }
  return found;
};

const mountCloud = async (page: Page) => {
  await page.goto('/', { waitUntil: 'load' });
  // A real scroll gesture is the interaction; the box comes within 200 px of the viewport.
  await box(page).scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 1);
  await expect(canvas(page)).toBeAttached({ timeout: 20_000 });
  await expect(island(page)).toHaveAttribute('data-cloud-view', 'cloud', { timeout: 20_000 });
};

const settle = (page: Page) => page.waitForTimeout(2500);

test('chips are the view before the cloud mounts, and stay in the tree after', async ({ page }) => {
  await page.goto('/', { waitUntil: 'load' });
  await expect(chips(page)).toHaveCount(TERM_COUNT);
  await expect(chips(page).first()).toBeVisible();
  await expect(canvas(page)).toHaveCount(0);
  await expect(page.getByRole('button', { name: siteCopy.skillsView.list })).toHaveCount(0);
  const before = await box(page).boundingBox();

  await mountCloud(page);
  // The canvas sits inside the aria-hidden overlay, so it is out of the accessibility tree.
  await expect(page.locator('[aria-hidden="true"] canvas')).toHaveCount(1);
  await expect(chips(page)).toHaveCount(TERM_COUNT);
  await expect(chipBlock(page)).toHaveCSS('opacity', '0');
  await expect(chipBlock(page)).toHaveCSS('pointer-events', 'none');
  const after = await box(page).boundingBox();
  expect(after?.width).toBe(before?.width);
  expect(after?.height).toBe(before?.height);
  expect(before?.width).toBeGreaterThan(0);
  // The box is at least a square of the column width.
  expect(after?.height ?? 0).toBeGreaterThanOrEqual((after?.width ?? 0) - 1);
});

test('the List control fades the chips back and pauses the cloud; Cloud resumes it', async ({
  page
}) => {
  await mountCloud(page);
  const list = page.getByRole('button', { name: siteCopy.skillsView.list });
  const cloud = page.getByRole('button', { name: siteCopy.skillsView.cloud });
  await expect(cloud).toHaveAttribute('aria-pressed', 'true');
  await expect(list).toHaveAttribute('aria-pressed', 'false');
  await expect(island(page)).toHaveAttribute('data-cloud-state', 'running');

  await list.focus();
  await page.keyboard.press('Enter');
  await expect(list).toHaveAttribute('aria-pressed', 'true');
  await expect(island(page)).toHaveAttribute('data-cloud-view', 'list');
  await expect(island(page)).toHaveAttribute('data-cloud-state', 'paused');
  await expect(chipBlock(page)).toHaveCSS('opacity', '1');
  await expect(chips(page).first()).toBeVisible();

  await cloud.click();
  await expect(island(page)).toHaveAttribute('data-cloud-view', 'cloud');
  await expect(island(page)).toHaveAttribute('data-cloud-state', 'running');
});

test('reduced motion leaves the chips and requests no cloud chunk', async ({ page, request }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/', { waitUntil: 'load' });
  await box(page).scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 1);
  await settle(page);
  await expect(canvas(page)).toHaveCount(0);
  await expect(chips(page).first()).toBeVisible();
  expect(await cloudChunks(page, request)).toEqual([]);
});

test('saveData leaves the chips and requests no cloud chunk', async ({ page, request }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'connection', { value: { saveData: true } });
  });
  await page.goto('/', { waitUntil: 'load' });
  await box(page).scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 1);
  await settle(page);
  await expect(canvas(page)).toHaveCount(0);
  await expect(chips(page).first()).toBeVisible();
  expect(await cloudChunks(page, request)).toEqual([]);
});

test('no WebGL leaves the chips and requests no cloud chunk', async ({ page, request }) => {
  await page.addInitScript(() => {
    // A deliberately unbound reference: the override re-applies it with the canvas as `this`.
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      ...args: unknown[]
    ) {
      const [kind] = args;
      if (kind === 'webgl' || kind === 'webgl2') return null;
      return (original as (...a: unknown[]) => unknown).apply(this, args);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.goto('/', { waitUntil: 'load' });
  await box(page).scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 1);
  await settle(page);
  await expect(canvas(page)).toHaveCount(0);
  await expect(chips(page).first()).toBeVisible();
  expect(await cloudChunks(page, request)).toEqual([]);
});

const tallPhonePage = async (browser: Browser, baseURL: string | undefined) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 2400 }, baseURL });
  return { context, page: await context.newPage() };
};

test('on the phone, the slot in view at first paint loads nothing; one real scroll loads the cloud', async ({
  browser,
  baseURL,
  request
}) => {
  test.skip(test.info().project.name !== 'mobile-390', 'the phone project only');
  const { context, page } = await tallPhonePage(browser, baseURL);
  await page.goto('/', { waitUntil: 'load' });
  // The box is inside the 2400 px viewport without any scroll: idle and near, but no interaction.
  const inView = await box(page).evaluate(
    element => element.getBoundingClientRect().top < window.innerHeight
  );
  expect(inView).toBe(true);
  await settle(page);
  expect(await cloudChunks(page, request)).toEqual([]);
  await expect(canvas(page)).toHaveCount(0);

  await page.mouse.move(100, 100);
  await page.mouse.wheel(0, 40);
  await expect(canvas(page)).toBeAttached({ timeout: 20_000 });
  expect((await cloudChunks(page, request)).length).toBeGreaterThan(0);
  await context.close();
});

test('axe is clean before the cloud mounts, with it mounted, and back on the list', async ({
  page
}) => {
  const run = async () => {
    // Let the hero stagger and the 300 ms chip fade finish; axe reads colours mid-animation
    // otherwise. Scroll-driven animations never finish, so they are skipped.
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
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'])
      .analyze();
    expect(results.violations).toEqual([]);
  };
  // Each run happens at the top of the page: scroll-driven reveals below the fold rest at their
  // natural state there, while a section mid-reveal would be sampled at a blended colour.
  const top = async () => {
    await page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
    await page.waitForTimeout(400);
  };
  await page.goto('/', { waitUntil: 'load' });
  await run();
  await mountCloud(page);
  await expect(chipBlock(page)).toHaveCSS('opacity', '0');
  await top();
  await run();
  await page.getByRole('button', { name: siteCopy.skillsView.list }).click();
  await expect(chipBlock(page)).toHaveCSS('opacity', '1');
  await top();
  await run();
});
