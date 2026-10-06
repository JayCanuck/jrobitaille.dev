// Home page structure, composition and accessibility (D13, D15): axe clean is a CI gate (spec §6).
import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

import { projects } from '../src/content/projects';
import { siteCopy } from '../src/content/site';

const viewportWidth = () => test.info().project.use.viewport?.width ?? 0;

test('home renders the hero links', async ({ page }) => {
  await page.goto('/');
  const hero = page.getByRole('region', { name: 'Jason Robitaille' });

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Jason Robitaille');
  await expect(hero.getByRole('link', { name: 'Resume (PDF)' })).toHaveAttribute(
    'href',
    '/resume.pdf'
  );
  await expect(hero.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
    'href',
    'https://linkedin.com/in/jasonrobitaille'
  );
  await expect(hero.getByRole('link', { name: 'GitHub', exact: true })).toHaveAttribute(
    'href',
    'https://github.com/JayCanuck'
  );
  // The availability line is gone from the page (About covers it, D15).
  await expect(
    page.getByText('Open to full-stack, platform or developer tooling roles')
  ).toHaveCount(0);
});

test('the avatar overlaps the cover band and is never clipped or painted over', async ({
  page
}) => {
  await page.goto('/');
  const avatar = page.getByRole('img', { name: 'Jason Robitaille' });
  for (const width of [390, 1024, 1440]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 900 });
    const box = await avatar.boundingBox();
    if (!box) throw new Error('avatar has no box');
    expect(box.x, `${String(width)}: left`).toBeGreaterThanOrEqual(0);
    expect(box.y, `${String(width)}: top`).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width, `${String(width)}: right`).toBeLessThanOrEqual(width);
    expect(box.y + box.height, `${String(width)}: bottom`).toBeLessThanOrEqual(
      width < 768 ? 844 : 900
    );
    // The topmost element at the avatar's centre is the avatar itself, not the band behind it.
    const hit = await page.evaluate(
      point => document.elementFromPoint(point.x, point.y)?.getAttribute('alt') ?? null,
      { x: box.x + box.width / 2, y: box.y + box.height / 2 }
    );
    expect(hit, `${String(width)}: element at centre`).toBe('Jason Robitaille');
  }
});

test('home has a slim header with the name, section links and the resume', async ({ page }) => {
  await page.goto('/');
  const header = page.getByRole('banner');

  await expect(header.getByRole('link', { name: 'Jason Robitaille' })).toHaveAttribute('href', '/');
  await expect(header.getByRole('link', { name: 'Resume (PDF)' })).toHaveAttribute(
    'href',
    '/resume.pdf'
  );
  const sections = header.getByRole('navigation', { name: 'Sections' }).getByRole('link');
  if (viewportWidth() >= 768) {
    await expect(sections).toHaveText([
      siteCopy.headings.about,
      siteCopy.headings.work,
      siteCopy.headings.experience,
      siteCopy.headings.skills
    ]);
    await expect(sections.first()).toHaveAttribute('href', '#about');
  } else {
    await expect(sections).toHaveCount(0);
  }
  // The header fades in as the hero scrolls out (opacity only); it is always in the tab order.
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await expect(header).toHaveCSS('opacity', '1');
  await expect(header).toHaveCSS('position', 'fixed');
});

test('home renders every section in order with its content', async ({ page }) => {
  await page.goto('/');

  // Section order (D15): hero, About beside Toolbox, Selected work, Experience; wording from site copy.
  await expect(page.getByRole('heading', { level: 2 })).toHaveText([
    siteCopy.headings.about,
    siteCopy.headings.skills,
    siteCopy.headings.work,
    siteCopy.headings.experience
  ]);
  await expect(
    page.getByRole('heading', { level: 3, name: 'LG Electronics, 2015 to 2026' })
  ).toBeVisible();
  // Three employer blocks, six cards, five skill groups at h3; seven era nodes at h4 (D14).
  await expect(page.getByRole('heading', { level: 3 })).toHaveCount(3 + 6 + 5);
  await expect(page.getByRole('heading', { level: 4 })).toHaveCount(7);
  // The title ladder is a labelled non-heading element, shown once per title.
  await expect(page.getByRole('heading', { name: 'Senior Software Engineer' })).toHaveCount(0);
  await expect(page.getByText('Senior Software Engineer')).toBeVisible();
  await expect(page.getByRole('heading', { level: 3, name: 'Canuck Coding' })).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 3, name: 'gamelist-utils and muos.js' })
  ).toBeVisible();
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(2);
});

test('project cards are clickable as a whole, secondary links stay separate', async ({ page }) => {
  await page.goto('/');
  const [first] = projects;
  if (!first?.secondaryLink) throw new Error('the first project needs a secondary link');
  const card = page.getByRole('listitem').filter({ hasText: first.blurb }).first();
  const blurb = card.getByText(first.blurb);
  await blurb.scrollIntoViewIfNeeded();
  const box = await blurb.boundingBox();
  if (!box) throw new Error('blurb has no box');

  // A click anywhere on the card (here, the blurb) lands on the stretched primary link.
  const hit = await page.evaluate(
    point =>
      document.elementFromPoint(point.x, point.y)?.closest('a')?.getAttribute('href') ?? null,
    { x: box.x + box.width / 2, y: box.y + box.height / 2 }
  );
  expect(hit).toBe(first.link.href);
  await expect(card.getByRole('link', { name: first.secondaryLink.label })).toHaveAttribute(
    'href',
    first.secondaryLink.href
  );
  // Title, primary chip and secondary chip are three anchors; the first two share a destination.
  await expect(card.getByRole('link')).toHaveCount(3);
});

test('timeline cards alternate and interleave on the centre rail from 1024 px', async ({
  page
}) => {
  await page.goto('/');
  const eras = page.locator('h4');
  const first = await eras.nth(0).locator('xpath=ancestor::li[1]').boundingBox();
  const second = await eras.nth(1).locator('xpath=ancestor::li[1]').boundingBox();
  if (!first || !second) throw new Error('era nodes have no box');

  if (viewportWidth() >= 1024) {
    // Opposite side, starting inside the previous card's height.
    expect(second.x).toBeGreaterThan(first.x + first.width);
    expect(second.y).toBeGreaterThan(first.y);
    expect(second.y).toBeLessThan(first.y + first.height);
  } else {
    // Single rail: stacked in order.
    expect(second.x).toBe(first.x);
    expect(second.y).toBeGreaterThanOrEqual(first.y + first.height);
  }
});

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('hero content and the header are visible and static', async ({ page }) => {
    await page.goto('/');
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
    await expect(h1).toHaveCSS('opacity', '1');
    await expect(h1).toHaveCSS('animation-name', 'none');
    await expect(page.getByRole('banner')).toHaveCSS('opacity', '1');
  });
});

test('hero staggers in on load where motion is allowed', async ({ page }) => {
  await page.goto('/');
  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toHaveCSS('animation-name', 'hero-in');
  await expect(h1).toHaveCSS('opacity', '1');
});

test('with motion on, nothing stays dim: the stagger settles and reveals complete', async ({
  page
}) => {
  await page.goto('/', { waitUntil: 'load' });
  // The stagger is done within 600 ms of load (D15) on an idle machine. Wait on the state, not on
  // a fixed delay: first on the hero children's own animations finishing, then on every child
  // being opaque, with a long bound so a loaded test machine that runs the animation slowly still
  // gets its full run before the check.
  await page.evaluate(() =>
    Promise.all(
      Array.from(document.querySelectorAll('.stagger > *'))
        .flatMap(element => element.getAnimations())
        .map(animation => animation.finished)
    )
  );
  await expect
    .poll(
      () =>
        page.evaluate(() =>
          Array.from(document.querySelectorAll('.stagger > *'))
            .map(element => getComputedStyle(element).opacity)
            .filter(opacity => Number(opacity) < 1)
        ),
      { timeout: 10_000 }
    )
    .toEqual([]);

  // Scroll-driven reveals finish within the first 25 to 30 % of an element's entry, so once a
  // section has arrived nothing fully inside the viewport may still be dim. An element straddling
  // the bottom edge is mid-reveal by design and is not counted.
  for (const id of ['about', 'work', 'experience', 'skills']) {
    const top = await page.evaluate(sectionId => {
      const section = document.getElementById(sectionId);
      if (!section) return 0;
      const margin = parseFloat(getComputedStyle(section).scrollMarginTop);
      return window.scrollY + section.getBoundingClientRect().top - margin;
    }, id);
    await scrollSmoothlyTo(page, top);
    // The header's 200 ms threshold fade may still be playing: poll the asserted state (nothing
    // in view dim) rather than waiting a fixed time for it.
    await expect
      .poll(
        () =>
          page.evaluate(() =>
            Array.from(document.body.querySelectorAll('*'))
              .filter(element => {
                // The Toolbox chips fade by design once the cloud has mounted over them (D18).
                if (
                  element
                    .closest('[data-island="cloud"]')
                    ?.querySelector('[data-cloud-view="cloud"]')
                )
                  return false;
                const box = element.getBoundingClientRect();
                return (
                  box.width > 0 &&
                  box.height > 0 &&
                  box.top >= 0 &&
                  box.left >= 0 &&
                  box.bottom <= window.innerHeight &&
                  box.right <= window.innerWidth &&
                  Number(getComputedStyle(element).opacity) < 1
                );
              })
              .map(
                element => `${element.tagName.toLowerCase()}.${element.getAttribute('class') ?? ''}`
              )
          ),
        { message: id, timeout: 10_000 }
      )
      .toEqual([]);
  }
});

test('home footer is one line with the build year, email and source link', async ({ page }) => {
  await page.goto('/');
  const footer = page.getByRole('contentinfo');

  // The optional playful slot line is empty, so the footer is a single paragraph (D14, D15).
  await expect(footer.locator('p')).toHaveCount(1);
  await expect(footer.locator('p').first()).toHaveText(
    `© ${String(new Date().getFullYear())} Jason Robitaille · jason.aj.robitaille@gmail.com · Source`
  );
  await expect(footer.getByRole('link', { name: 'jason.aj.robitaille@gmail.com' })).toHaveAttribute(
    'href',
    'mailto:jason.aj.robitaille@gmail.com'
  );
  await expect(footer.getByRole('link', { name: 'Source' })).toHaveAttribute(
    'href',
    'https://github.com/JayCanuck/jrobitaille.dev'
  );
});

// Live review 1 (D15 amendment): alignment, header threshold, anchor offsets, chips, connectors.

// Scroll the way a user does (smoothly, over several frames) and wait until the position settles
// plus the 200 ms header fade: an animation trigger only registers a boundary crossed between
// frames, never a single instant jump.
const scrollSmoothlyTo = async (page: Page, y: number) => {
  await page.evaluate(v => {
    window.scrollTo({ top: v, behavior: 'smooth' });
  }, y);
  let previous = -1;
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(100);
    const current = await page.evaluate(() => window.scrollY);
    if (current === previous) break;
    previous = current;
  }
  await page.waitForTimeout(400);
};

test('the resume pill and its neighbours share one vertical centre in the hero and the header', async ({
  page
}) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  // Read every box in one frame; poll briefly so the hero stagger has settled.
  const measure = () =>
    page.evaluate(() => {
      const centre = (el: Element) => {
        const box = el.getBoundingClientRect();
        return box.top + box.height / 2;
      };
      const links = (root: Element | null) =>
        Array.from(root?.querySelectorAll('a') ?? []).map(a => ({
          name: a.textContent.trim(),
          centre: centre(a)
        }));
      return {
        hero: links(document.querySelector('section.hero-timeline ul')),
        header: links(document.querySelector('header'))
      };
    });
  let rows = await measure();
  for (let i = 0; i < 10; i++) {
    const spread = (row: { centre: number }[]) =>
      Math.max(...row.map(l => l.centre)) - Math.min(...row.map(l => l.centre));
    if (spread(rows.hero) <= 1) break;
    await page.waitForTimeout(150);
    rows = await measure();
  }
  const check = (row: { name: string; centre: number }[], label: string) => {
    const pill = row.find(link => link.name === 'Resume (PDF)');
    if (!pill) throw new Error(`${label}: no resume pill`);
    for (const link of row) {
      expect(Math.abs(link.centre - pill.centre), `${label} ${link.name}`).toBeLessThanOrEqual(1);
    }
  };
  expect(rows.hero.map(link => link.name)).toEqual(['Resume (PDF)', 'LinkedIn', 'GitHub']);
  check(rows.hero, 'hero');
  // The pill keeps the lg button size's own height (h-9, 36 px); the links match it, not the reverse.
  const pillHeight = await page.evaluate(
    () => document.querySelector('section.hero-timeline ul a')?.getBoundingClientRect().height
  );
  expect(pillHeight).toBe(36);
  if (viewportWidth() >= 768) {
    expect(rows.header.length).toBe(6);
    check(
      rows.header.filter(link => link.name !== 'Jason Robitaille'),
      'header'
    );
  }
});

test('the hero link icons share one ink centre and sit on the label x-height', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const icons = await page.evaluate(() =>
    Array.from(document.querySelectorAll('section.hero-timeline ul a'))
      .slice(1)
      .map(a => {
        const svg = a.querySelector('svg');
        if (!svg) throw new Error('no icon');
        const strokeHalf =
          ((Number(svg.getAttribute('stroke-width')) / 24) * svg.getBoundingClientRect().height) /
          2;
        let top = Infinity;
        let bottom = -Infinity;
        for (const shape of svg.querySelectorAll('path, rect, circle')) {
          const box = shape.getBoundingClientRect();
          top = Math.min(top, box.top - strokeHalf);
          bottom = Math.max(bottom, box.bottom + strokeHalf);
        }
        const text = Array.from(a.childNodes).find(
          node => node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim() !== ''
        );
        if (!text) throw new Error('no label');
        const range = document.createRange();
        range.selectNodeContents(text);
        const label = range.getBoundingClientRect();
        const style = getComputedStyle(a);
        const context = document.createElement('canvas').getContext('2d');
        if (!context) throw new Error('no canvas');
        context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        const metrics = context.measureText('x');
        const xCentre =
          label.top + metrics.fontBoundingBoxAscent - metrics.actualBoundingBoxAscent / 2;
        return { name: a.textContent.trim(), inkCentre: (top + bottom) / 2, xCentre };
      })
  );
  expect(icons.map(icon => icon.name)).toEqual(['LinkedIn', 'GitHub']);
  const [linkedin, github] = icons;
  if (!linkedin || !github) throw new Error('icons missing');
  expect(Math.abs(linkedin.inkCentre - github.inkCentre)).toBeLessThanOrEqual(1);
  for (const icon of icons) {
    expect(Math.abs(icon.inkCentre - icon.xCentre), icon.name).toBeLessThanOrEqual(1);
  }
});

test('with motion on, the header is hidden over the hero and shown once it has left, never in between', async ({
  page
}) => {
  await page.goto('/');
  const header = page.getByRole('banner');
  const heroHeight = await page.evaluate(
    () => document.querySelector('section.hero-timeline')?.getBoundingClientRect().height ?? 0
  );
  expect(heroHeight).toBeGreaterThan(0);
  // The header's opacity once its own time-based animations have finished; -1 while one still
  // runs, so a poll waits on the fade itself rather than on a fixed delay.
  const settledOpacity = () =>
    header.evaluate(el => {
      const running = el
        .getAnimations()
        .some(
          animation =>
            animation.playState === 'running' && !(animation.timeline instanceof ScrollTimeline)
        );
      return running ? -1 : Number(getComputedStyle(el).opacity);
    });
  const expectOpacityAt = async (y: number, expected: number) => {
    await scrollSmoothlyTo(page, y);
    await expect
      .poll(settledOpacity, { message: `header opacity at ${String(y)}`, timeout: 10_000 })
      .toBe(expected);
  };
  await expectOpacityAt(0, 0);
  await expectOpacityAt(heroHeight + 10, 1);
  // Any part of the hero still in view keeps the header hidden.
  await expectOpacityAt(heroHeight - 40, 0);
  for (const y of [heroHeight * 0.5, heroHeight * 0.9, heroHeight * 2, 0, heroHeight + 40]) {
    await scrollSmoothlyTo(page, y);
    await expect
      .poll(settledOpacity, { message: `header settled at ${String(y)}`, timeout: 10_000 })
      .not.toBe(-1);
    const opacity = await settledOpacity();
    expect(opacity < 0.05 || opacity > 0.95, `opacity ${String(opacity)} at ${String(y)}`).toBe(
      true
    );
  }
});

test('header links land each heading below the header', async ({ page }) => {
  test.skip(viewportWidth() < 768, 'the section links are hidden below 768 px');
  await page.goto('/');
  const header = page.getByRole('banner');
  // The header is hidden (and inert to the pointer) over the hero; scroll past it first.
  await page.evaluate(() => {
    window.scrollTo({ top: document.body.scrollHeight / 2, behavior: 'instant' });
  });
  await page.waitForTimeout(400);
  for (const link of await header.getByRole('navigation').getByRole('link').all()) {
    const id = (await link.getAttribute('href'))?.slice(1) ?? '';
    await link.click();
    let previous = -1;
    for (let i = 0; i < 20; i++) {
      await page.waitForTimeout(150);
      const current = await page.evaluate(() => window.scrollY);
      if (current === previous) break;
      previous = current;
    }
    const headingTop = await page.evaluate(
      sectionId =>
        document.querySelector(`#${sectionId} h2`)?.getBoundingClientRect().top ?? Number.NaN,
      id
    );
    const headerBottom = (await header.boundingBox())?.height ?? Number.NaN;
    expect(headingTop, id).toBeGreaterThanOrEqual(headerBottom);
  }
});

test('chips never clip their text at device scale 1 and 1.25', async ({ browser, baseURL }) => {
  for (const scale of [1, 1.25]) {
    for (const width of [390, 1440, 2048]) {
      const context = await browser.newContext({
        viewport: { width, height: width < 768 ? 844 : 1000 },
        deviceScaleFactor: scale
      });
      const page = await context.newPage();
      await page.goto(baseURL ?? '/');
      await page.evaluate(() =>
        document.getElementById('skills')?.scrollIntoView({ block: 'start', behavior: 'instant' })
      );
      await page.waitForTimeout(300);
      const clipped = await page.evaluate(() => {
        const chips = Array.from(
          document.querySelectorAll<HTMLElement>('#skills li, a[class*="bg-brand-soft"]')
        );
        return chips
          .filter(chip => {
            const box = chip.getBoundingClientRect();
            const range = document.createRange();
            range.selectNodeContents(chip);
            const text = range.getBoundingClientRect();
            return (
              chip.scrollHeight !== chip.clientHeight ||
              text.top < box.top - 0.5 ||
              text.bottom > box.bottom + 0.5 ||
              text.left < box.left - 0.5 ||
              text.right > box.right + 0.5
            );
          })
          .map(
            chip => `${chip.textContent} ${String(chip.scrollHeight)}/${String(chip.clientHeight)}`
          );
      });
      expect(clipped, `${String(width)} at x${String(scale)}`).toEqual([]);
      await context.close();
    }
  }
});

test('every timeline card has a hairline to its badge on the rail side, level with the badge centre', async ({
  page
}) => {
  test.skip(
    ![390, 1280, 2560].includes(viewportWidth()),
    'checked at the phone and desktop widths'
  );
  await page.goto('/');
  const results = await page.evaluate(() => {
    const centre = window.innerWidth >= 1024;
    return Array.from(document.querySelectorAll<HTMLElement>('.timeline-card')).map(card => {
      const style = getComputedStyle(card, '::before');
      const box = card.getBoundingClientRect();
      const badge = card.parentElement?.querySelector('span[aria-hidden]')?.getBoundingClientRect();
      const lineCentre =
        box.top +
        parseFloat(getComputedStyle(card).borderTopWidth) +
        parseFloat(style.top) +
        parseFloat(style.height) / 2;
      const leftSide = centre && card.dataset.side === 'left';
      // Where the line sits: from the card's edge on the rail side, measured in page space.
      const border = parseFloat(getComputedStyle(card).borderLeftWidth);
      const lineLeft = box.left + border + parseFloat(style.left);
      const lineRight = lineLeft + parseFloat(style.width);
      const onRailSide = leftSide
        ? Math.abs(lineLeft - box.right) <= 1
        : Math.abs(lineRight - box.left) <= 1;
      // The hairline ends at the badge's edge and never crosses into the circle.
      const endsAtBadge = badge
        ? leftSide
          ? lineRight <= badge.left + 0.5
          : lineLeft >= badge.right - 0.5
        : false;
      return {
        side: card.dataset.side,
        onRailSide,
        endsAtBadge,
        width: parseFloat(style.width),
        offset: badge ? Math.abs(lineCentre - (badge.top + badge.height / 2)) : Number.NaN
      };
    });
  });
  expect(results).toHaveLength(7);
  for (const result of results) {
    expect(result.onRailSide, JSON.stringify(result)).toBe(true);
    expect(result.endsAtBadge, JSON.stringify(result)).toBe(true);
    expect(result.width).toBeGreaterThan(0);
    expect(result.offset, JSON.stringify(result)).toBeLessThanOrEqual(1);
  }
});

test('home has no axe violations', async ({ page }) => {
  await page.goto('/');
  // Let the 600 ms hero stagger finish; scroll-driven animations never finish, so skip those.
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
});

// Section jobs (D13 and D15 amendments): cards carry proof, the timeline carries chronology.
test('card years sit above the title and chip rows hold chips only, on one line', async ({
  browser,
  baseURL
}) => {
  for (const width of [390, 640, 1024, 1440, 2048]) {
    const context = await browser.newContext({
      viewport: { width, height: width < 768 ? 844 : 1000 }
    });
    const page = await context.newPage();
    await page.goto(baseURL ?? '/');
    await page.evaluate(() =>
      document.getElementById('work')?.scrollIntoView({ block: 'start', behavior: 'instant' })
    );
    await page.waitForTimeout(300);
    const cards = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>('#work [data-slot="card"]')).map(card => {
        const year = card.querySelector('[data-slot="card-header"] > p');
        const title = card.querySelector('h3');
        const chips = Array.from(card.querySelector('[data-slot="card-footer"]')?.children ?? []);
        return {
          title: title?.textContent ?? '',
          yearAboveTitle:
            year !== null &&
            title !== null &&
            year.getBoundingClientRect().bottom <= title.getBoundingClientRect().top + 0.5,
          chipsOnly:
            chips.length > 0 &&
            chips.every(chip => chip.tagName === 'A' && chip.className.includes('bg-brand-soft')),
          rows: new Set(chips.map(chip => Math.round(chip.getBoundingClientRect().top))).size
        };
      })
    );
    expect(cards, String(width)).toHaveLength(projects.length);
    for (const card of cards) {
      const label = `${card.title} at ${String(width)}`;
      expect(card.yearAboveTitle, label).toBe(true);
      expect(card.chipsOnly, label).toBe(true);
      expect(card.rows, label).toBe(1);
    }
    await context.close();
  }
});

test('timeline nodes contain no anchors; the card chips are the only proof links', async ({
  page
}) => {
  await page.goto('/');
  await expect(page.locator('.timeline-card a')).toHaveCount(0);
  const chips = projects.reduce((n, project) => n + 1 + (project.secondaryLink ? 1 : 0), 0);
  await expect(page.locator('a[class*="bg-brand-soft"]')).toHaveCount(chips);
  await expect(page.locator('#work a[class*="bg-brand-soft"]')).toHaveCount(chips);
});
