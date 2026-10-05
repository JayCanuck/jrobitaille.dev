// Unmatched URLs return the custom 404 (wrangler 404-page handling over out/404.html).
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('an unknown URL serves the custom 404 page', async ({ page }) => {
  const response = await page.goto('/nope');

  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
  await expect(page.getByRole('link', { name: 'Back to the home page' })).toHaveAttribute(
    'href',
    '/'
  );

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'])
    .analyze();
  expect(results.violations).toEqual([]);
});
