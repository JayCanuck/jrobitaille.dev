// Home page structure, composition and accessibility (D13, D15): axe clean is a CI gate (spec §6).
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

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
  // Three employer blocks, five cards, five skill groups at h3; seven era nodes at h4 (D14).
  await expect(page.getByRole('heading', { level: 3 })).toHaveCount(3 + 5 + 5);
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
  await expect(card.getByRole('link')).toHaveCount(2);
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

test('home has no axe violations', async ({ page }) => {
  await page.goto('/');
  // Let the 600 ms hero stagger finish; scroll-driven animations never finish, so skip those.
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter(animation => !(animation.timeline instanceof ScrollTimeline))
        .map(animation => animation.finished)
    )
  );

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'])
    .analyze();
  expect(results.violations).toEqual([]);
});
