// Playwright config: e2e and axe checks against the built export, served by wrangler dev, at 390,
// 768, 1280 and 2560 px (spec §5, D14).
import { defineConfig, devices } from '@playwright/test';

const isCI = process.env.CI !== undefined;
const baseURL = 'http://127.0.0.1:8787';

const viewport = (width: number, height: number, name: string) => ({
  name,
  use: { ...devices['Desktop Chrome'], viewport: { width, height } }
});

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL, trace: 'retain-on-failure' },
  webServer: {
    // Same routing and 404 rules as production; also validates wrangler.jsonc on every run.
    command: 'npx wrangler dev --port 8787',
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 120_000
  },
  projects: [
    viewport(390, 844, 'mobile-390'),
    viewport(768, 1024, 'tablet-768'),
    viewport(1280, 800, 'desktop-1280'),
    viewport(2560, 1440, 'wide-2560'),
    // Native WebMCP (D17): Chromium exposes document.modelContext behind this feature switch, so
    // the WebMCP and budget specs run once more against the native branch of the feature detection;
    // the four projects above cover the polyfill branch.
    {
      name: 'desktop-1280-webmcp',
      testMatch: /(webmcp|budgets)\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
        launchOptions: { args: ['--enable-features=WebMCP'] }
      }
    }
  ]
});
