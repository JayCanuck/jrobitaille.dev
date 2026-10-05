// Home page structure and accessibility: axe clean is a CI gate (spec §6).
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { siteCopy } from '../src/content/site';

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
});

test('home renders every section in order with its content', async ({ page }) => {
  await page.goto('/');

  // Section order (D13): hero, About, Selected work, Experience, Skills; wording from site copy (D14).
  await expect(page.getByRole('heading', { level: 2 })).toHaveText([
    siteCopy.headings.about,
    siteCopy.headings.work,
    siteCopy.headings.experience,
    siteCopy.headings.skills
  ]);
  await expect(
    page.getByRole('heading', { level: 3, name: 'LG Electronics, 2015 to 2026' })
  ).toBeVisible();
  // Three employer blocks, five cards, five skill groups at h3; seven era nodes at h4 (D14).
  await expect(page.getByRole('heading', { level: 3 })).toHaveCount(3 + 5 + 5);
  await expect(page.getByRole('heading', { level: 4 })).toHaveCount(7);
  // The title ladder is a labelled non-heading element.
  await expect(page.getByRole('heading', { name: 'Senior Software Engineer' })).toHaveCount(0);
  await expect(page.getByText('Senior Software Engineer')).toBeVisible();
  await expect(page.getByRole('heading', { level: 3, name: 'Canuck Coding' })).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 3, name: 'gamelist-utils and muos.js' })
  ).toBeVisible();
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(2);
});

test('home footer is one line with the build year, email and source link', async ({ page }) => {
  await page.goto('/');
  const footer = page.getByRole('contentinfo');

  // First line is fixed; the optional playful slot line follows it when it has copy (D14).
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

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'])
    .analyze();
  expect(results.violations).toEqual([]);
});
