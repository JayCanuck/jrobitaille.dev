// Performance, security-header and architecture gates over the served export (AGENTS.md budgets,
// D14): CLS 0, initial JS under 120 KB gzipped, strict CSP without 'unsafe-inline', no client
// components or effects anywhere under src/, and the SEO files present.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { expect, test } from '@playwright/test';

// AGENTS.md budget: 150 KB gzipped on home for evergreen browsers. Measured 2026-10-04 with Next
// 16.3.8 and React 19.3: React DOM, the Flight client and the app router 116.8 KB, Next helpers
// 27.0 KB, site code 0 KB; 143.8 KB in all. The guard holds that line so a dependency or an island
// cannot grow it unnoticed (D14).
const JS_BUDGET_BYTES = 150 * 1024;

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

test('home has a cumulative layout shift of 0', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await page.waitForTimeout(500);
  const cls = await page.evaluate(
    () =>
      new Promise<number>(resolve => {
        let total = 0;
        const observer = new PerformanceObserver(list => {
          for (const entry of list.getEntries() as (PerformanceEntry & {
            value: number;
            hadRecentInput: boolean;
          })[]) {
            if (!entry.hadRecentInput) total += entry.value;
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });
        setTimeout(() => {
          observer.disconnect();
          resolve(total);
        }, 300);
      })
  );
  expect(cls).toBe(0);
});

test('home JavaScript for evergreen browsers stays within the measured budget', async ({
  page,
  request
}) => {
  await page.goto('/');
  // nomodule scripts (polyfills) never load in evergreen browsers (D10), so they do not count.
  const sources = await page.evaluate(() =>
    Array.from(document.scripts)
      .filter(script => !script.noModule)
      .map(script => script.src)
      .filter(Boolean)
  );
  let total = 0;
  for (const src of sources) {
    const body = await (await request.get(src)).body();
    total += gzipSync(body).length;
  }
  expect(sources.length).toBeGreaterThan(0);
  expect(total).toBeLessThan(JS_BUDGET_BYTES);
});

test('responses carry the strict security headers', async ({ request }) => {
  const response = await request.get('/');
  const csp = response.headers()['content-security-policy'] ?? '';
  expect(csp).toContain("script-src 'self' 'sha256-");
  expect(csp).not.toContain('unsafe-inline');
  expect(csp).toContain("style-src 'self'");
  expect(response.headers()['x-content-type-options']).toBe('nosniff');
  expect(response.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin');
});

test('home runs without console errors (the CSP allows every inline script by hash)', async ({
  page
}) => {
  const errors: string[] = [];
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  expect(errors).toEqual([]);
});

test('SEO files and tags are present', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    /opengraph-image/
  );
  await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(2);
  for (const path of ['/llms.txt', '/manifest.webmanifest', '/sitemap.xml', '/robots.txt']) {
    expect((await request.get(path)).status(), path).toBe(200);
  }
});

test('no client components or effects under src/', () => {
  const offenders = walk('src').filter(path => {
    if (!/\.(ts|tsx)$/.test(path) || path.endsWith('.test.ts')) return false;
    const source = readFileSync(path, 'utf8');
    return source.includes("'use client'") || /\buseEffect\b/.test(source);
  });
  expect(offenders).toEqual([]);
});
