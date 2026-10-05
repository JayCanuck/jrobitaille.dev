// Home page structure and accessibility: axe clean is a CI gate (spec §6).
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

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

test('home renders every section with its content', async ({ page }) => {
  await page.goto('/');

  for (const name of ['About', 'Experience', 'Selected work', 'Skills']) {
    await expect(page.getByRole('heading', { level: 2, name })).toBeVisible();
  }
  await expect(page.getByRole('heading', { level: 3 })).toHaveCount(7 + 5 + 5);
  await expect(page.getByRole('heading', { level: 3, name: 'Canuck Coding' })).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 3, name: 'gamelist-utils and muos.js' })
  ).toBeVisible();
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(2);
  await expect(
    page.getByRole('contentinfo').getByText('Jason Robitaille (JayCanuck)')
  ).toBeVisible();
});

test('home has no axe violations', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'])
    .analyze();
  expect(results.violations).toEqual([]);
});
