// Playwright config: e2e and axe checks against the built export, served by wrangler dev, at 390 and 1280 px (spec §5).
import { defineConfig, devices } from '@playwright/test';

const isCI = process.env.CI !== undefined;
const baseURL = 'http://127.0.0.1:8787';

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
    {
      name: 'mobile-390',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 }
      }
    },
    {
      name: 'desktop-1280',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 }
      }
    }
  ]
});
