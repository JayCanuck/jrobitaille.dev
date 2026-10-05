// Home page smoke and accessibility test: axe clean is a CI gate (spec §6).
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('home renders the placeholder and has no axe violations', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Jason Robitaille');
  await expect(page.getByRole('link', { name: 'Resume (PDF)' })).toHaveAttribute(
    'href',
    '/resume.pdf'
  );
  await expect(page.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
    'href',
    'https://linkedin.com/in/jasonrobitaille'
  );
  await expect(page.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
    'href',
    'https://github.com/JayCanuck'
  );

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'])
    .analyze();
  expect(results.violations).toEqual([]);
});
