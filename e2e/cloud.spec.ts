// The skills cloud (D18): the chips are the default view and the cloud is opt-in. The List/Cloud
// control appears once JavaScript runs with WebGL available, and pressing Cloud is the only thing
// that loads the cloud chunk: load, a scroll, a hash arrival and hovering request nothing. Once the
// cloud has mounted the canvas overlays the chips inside the same reserved box; the chips fade but
// stay in the DOM and the accessibility tree. Without WebGL there is no control. Under reduced
// motion the control works and the cloud does not turn on its own.
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type APIRequestContext, type Browser, type Page } from '@playwright/test';

import { skills } from '../src/content/resume';
import { siteCopy } from '../src/content/site';

const TERM_COUNT = skills.flatMap(group => group.terms).length;
const THREE_MARKER = 'WebGLRenderer';
const CLOUD_BUDGET_BYTES = 260 * 1024;

const chips = (page: Page) => page.locator('#skills').getByRole('listitem');
const chipBlock = (page: Page) => page.locator('[data-island="cloud"] > div').first();
const box = (page: Page) => page.locator('[data-island="cloud"]');
const canvas = (page: Page) => page.locator('[data-island="cloud"] canvas');
const island = (page: Page) => page.locator('[data-island="cloud"] [data-cloud-state]');
const listButton = (page: Page) => page.getByRole('button', { name: siteCopy.skillsView.list });
const cloudButton = (page: Page) => page.getByRole('button', { name: siteCopy.skillsView.cloud });

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

const gzippedTotal = async (request: APIRequestContext, urls: string[]) => {
  const { gzipSync } = await import('node:zlib');
  let total = 0;
  for (const url of urls) total += gzipSync(await (await request.get(url)).body()).length;
  return total;
};

// Pressing Cloud is the one way the cloud loads.
const openCloud = async (page: Page) => {
  await page.goto('/', { waitUntil: 'load' });
  await cloudButton(page).click();
  await expect(canvas(page)).toBeAttached({ timeout: 20_000 });
  await expect(island(page)).toHaveAttribute('data-cloud-view', 'cloud', { timeout: 20_000 });
  // The press scrolls the control into view, not the box below it; the gestures need the canvas.
  await canvas(page).scrollIntoViewIfNeeded();
};

// Long enough for hydration, the idle island and any chunk a stray trigger would have requested.
const settle = (page: Page) => page.waitForTimeout(2500);

test('the chips are the default view with the control beside the heading; pressing Cloud overlays them in the same box', async ({
  page
}) => {
  await page.goto('/', { waitUntil: 'load' });
  await expect(chips(page)).toHaveCount(TERM_COUNT);
  await expect(chips(page).first()).toBeVisible();
  await expect(canvas(page)).toHaveCount(0);
  await expect(listButton(page)).toHaveAttribute('aria-pressed', 'true');
  await expect(cloudButton(page)).toHaveAttribute('aria-pressed', 'false');
  const before = await box(page).boundingBox();

  await cloudButton(page).click();
  await expect(canvas(page)).toBeAttached({ timeout: 20_000 });
  await expect(island(page)).toHaveAttribute('data-cloud-view', 'cloud', { timeout: 20_000 });
  await expect(cloudButton(page)).toHaveAttribute('aria-pressed', 'true');
  // The canvas sits inside the aria-hidden overlay, so it is out of the accessibility tree.
  await expect(page.locator('[aria-hidden="true"] canvas')).toHaveCount(1);
  await expect(chips(page)).toHaveCount(TERM_COUNT);
  await expect(chipBlock(page)).toHaveCSS('opacity', '0');
  await expect(chipBlock(page)).toHaveCSS('pointer-events', 'none');
  const after = await box(page).boundingBox();
  expect(after?.width).toBe(before?.width);
  expect(after?.height).toBe(before?.height);
  expect(before?.width).toBeGreaterThan(0);
  // The box is at least a 4:3 slot of the column width.
  expect(after?.height ?? 0).toBeGreaterThanOrEqual((after?.width ?? 0) * 0.75 - 1);
});

test('load, a scroll to the box, a wheel and a hover request no cloud chunk', async ({
  page,
  request
}) => {
  await page.goto('/', { waitUntil: 'load' });
  await expect(listButton(page)).toBeVisible();
  await box(page).scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 1);
  const rect = await box(page).boundingBox();
  if (!rect) throw new Error('no box');
  await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
  await settle(page);
  await expect(canvas(page)).toHaveCount(0);
  await expect(chips(page).first()).toBeVisible();
  expect(await cloudChunks(page, request)).toEqual([]);
});

test('a hash arrival puts the box in view and requests no cloud chunk', async ({
  page,
  request
}) => {
  await page.goto('/#skills', { waitUntil: 'load' });
  await settle(page);
  const inView = await page.evaluate(() => {
    const element = document.querySelector('[data-island="cloud"]');
    return (element?.getBoundingClientRect().top ?? Infinity) < window.innerHeight;
  });
  expect(inView).toBe(true);
  await expect(canvas(page)).toHaveCount(0);
  await expect(listButton(page)).toBeVisible();
  expect(await cloudChunks(page, request)).toEqual([]);
});

test('pressing Cloud loads the cloud within its budget, with the control busy until the canvas shows', async ({
  page,
  request
}) => {
  await page.goto('/', { waitUntil: 'load' });
  await expect(cloudButton(page)).toBeVisible();
  // The busy state is read a task after the press, before any chunk could have arrived.
  const busy = await page.evaluate(async label => {
    const button = Array.from(document.querySelectorAll('button')).find(
      element => element.textContent === label
    );
    button?.click();
    await new Promise(resolve => setTimeout(resolve, 0));
    return button?.getAttribute('aria-busy');
  }, siteCopy.skillsView.cloud);
  expect(busy).toBe('true');
  await expect(canvas(page)).toBeAttached({ timeout: 20_000 });
  await expect(island(page)).toHaveAttribute('data-cloud-view', 'cloud', { timeout: 20_000 });
  await expect(cloudButton(page)).not.toHaveAttribute('aria-busy', 'true');
  const chunks = await cloudChunks(page, request);
  expect(chunks.length).toBeGreaterThan(0);
  expect(await gzippedTotal(request, chunks)).toBeLessThan(CLOUD_BUDGET_BYTES);
});

test('the List control fades the chips back and pauses the cloud; Cloud resumes it', async ({
  page
}) => {
  await openCloud(page);
  const list = listButton(page);
  const cloud = cloudButton(page);
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

// The cloud's rotation, as the scene publishes it on the canvas each frame.
const rotationY = async (page: Page) => {
  await expect(canvas(page)).toHaveAttribute('data-rotation', /./, { timeout: 10_000 });
  const value = (await canvas(page).getAttribute('data-rotation')) ?? '0 0';
  return Number(value.split(' ')[0]);
};

// A mouse drag of 200 px across the cloud's centre, about a radian of rotation.
const dragAcross = async (page: Page) => {
  const rect = await canvas(page).boundingBox();
  if (!rect) throw new Error('no canvas box');
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  // A press alone is not a drag: capture and the grabbing cursor come after the slop.
  await expect(island(page)).toHaveClass(/cursor-grab/);
  await page.mouse.move(cx + 200, cy + 30, { steps: 10 });
  await expect(island(page)).toHaveClass(/cursor-grabbing/);
  await page.waitForTimeout(100);
};

test('a drag rotates the cloud and the idle rotation resumes after release', async ({ page }) => {
  await openCloud(page);
  const before = await rotationY(page);
  await dragAcross(page);
  const during = await rotationY(page);
  // 200 px of drag is about a radian; the idle turn alone would be a few hundredths.
  expect(during - before).toBeGreaterThan(0.6);
  await page.mouse.up();
  await expect(island(page)).toHaveClass(/cursor-grab/);
  await expect(island(page)).not.toHaveClass(/cursor-grabbing/);
  // Inertia settles within about a second; after that the idle rotation is turning again.
  await page.waitForTimeout(1500);
  const settled = await rotationY(page);
  await page.waitForTimeout(500);
  const later = await rotationY(page);
  expect(later - settled).toBeGreaterThan(0.03);
  expect(later - settled).toBeLessThan(0.2);
});

test('hovering without dragging does not stop the rotation', async ({ page }) => {
  await openCloud(page);
  const rect = await canvas(page).boundingBox();
  if (!rect) throw new Error('no canvas box');
  await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
  await page.waitForTimeout(300);
  const first = await rotationY(page);
  await page.waitForTimeout(500);
  const second = await rotationY(page);
  expect(second - first).toBeGreaterThan(0.03);
  await expect(island(page)).toHaveAttribute('data-cloud-state', 'running');
});

test('under reduced motion the control works, the cloud stands still on press, and a drag still turns it', async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openCloud(page);
  await expect(island(page)).toHaveAttribute('data-cloud-state', 'paused');
  const first = await rotationY(page);
  await page.waitForTimeout(600);
  const second = await rotationY(page);
  expect(second).toBe(first);
  await dragAcross(page);
  const during = await rotationY(page);
  expect(during - first).toBeGreaterThan(0.6);
  await page.mouse.up();
  await listButton(page).click();
  await expect(island(page)).toHaveAttribute('data-cloud-view', 'list');
  await expect(chipBlock(page)).toHaveCSS('opacity', '1');
});

test('no WebGL offers no control and requests no cloud chunk', async ({ page, request }) => {
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
  await settle(page);
  await expect(listButton(page)).toHaveCount(0);
  await expect(cloudButton(page)).toHaveCount(0);
  await expect(canvas(page)).toHaveCount(0);
  await expect(chips(page).first()).toBeVisible();
  expect(await cloudChunks(page, request)).toEqual([]);
});

// Touch gestures over the mounted cloud, in a touch context on the phone project. A vertical pan
// belongs to the page (touch-action: pan-y) and never reaches the drag; a horizontal swipe is a drag.
const swipe = async (page: Page, from: { x: number; y: number }, to: { x: number; y: number }) => {
  const client = await page.context().newCDPSession(page);
  const steps = 12;
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: from.x, y: from.y }]
  });
  for (let i = 1; i <= steps; i++) {
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [
        { x: from.x + ((to.x - from.x) * i) / steps, y: from.y + ((to.y - from.y) * i) / steps }
      ]
    });
    await page.waitForTimeout(30);
  }
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await client.detach();
};

const touchPhonePage = async (browser: Browser, baseURL: string | undefined) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    baseURL
  });
  return { context, page: await context.newPage() };
};

test('on the phone, a vertical swipe on the cloud scrolls the page and leaves the rotation alone', async ({
  browser,
  baseURL
}) => {
  test.skip(test.info().project.name !== 'mobile-390', 'the phone project only');
  const { context, page } = await touchPhonePage(browser, baseURL);
  await openCloud(page);
  const rect = await canvas(page).boundingBox();
  if (!rect) throw new Error('no canvas box');
  const scrollBefore = await page.evaluate(() => window.scrollY);
  const before = await rotationY(page);
  const x = rect.x + rect.width / 2;
  const y = rect.y + rect.height / 2;
  await swipe(page, { x, y: y + 80 }, { x: x + 4, y: y - 120 });
  await page.waitForTimeout(600);
  const scrolled = (await page.evaluate(() => window.scrollY)) - scrollBefore;
  // A 200 px pan scrolls about 200 px; the exact figure depends on the browser's touch physics.
  expect(scrolled).toBeGreaterThan(120);
  expect(scrolled).toBeLessThan(600);
  const after = await rotationY(page);
  // Only the idle turn (0.12 rad/s) moved it; a drag would have added a radian.
  expect(Math.abs(after - before)).toBeLessThan(0.3);
  await context.close();
});

test('on the phone, a horizontal swipe on the cloud rotates it and does not scroll the page', async ({
  browser,
  baseURL
}) => {
  test.skip(test.info().project.name !== 'mobile-390', 'the phone project only');
  const { context, page } = await touchPhonePage(browser, baseURL);
  await openCloud(page);
  const rect = await canvas(page).boundingBox();
  if (!rect) throw new Error('no canvas box');
  const scrollBefore = await page.evaluate(() => window.scrollY);
  const before = await rotationY(page);
  const x = rect.x + rect.width / 2;
  const y = rect.y + rect.height / 2;
  await swipe(page, { x: x - 100, y }, { x: x + 100, y: y + 6 });
  await page.waitForTimeout(100);
  const after = await rotationY(page);
  expect(after - before).toBeGreaterThan(0.6);
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollBefore);
  await context.close();
});

test('axe is clean on the list, with the cloud showing, and back on the list', async ({ page }) => {
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
  await expect(listButton(page)).toBeVisible();
  await run();
  await openCloud(page);
  await expect(chipBlock(page)).toHaveCSS('opacity', '0');
  await top();
  await run();
  await listButton(page).click();
  await expect(chipBlock(page)).toHaveCSS('opacity', '1');
  await top();
  await run();
});
