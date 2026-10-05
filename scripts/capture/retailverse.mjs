// Capture the live RetailVerse Web viewer at 1200x750 once the 3D model has loaded, into
// assets/images/retailverse-web.png (then run scripts/images.mjs). Jason's own shipped work.
import { chromium } from '@playwright/test';

const URL = 'https://web.retailverse3d.com/?model=WM4000HBA&region=US&language=en&analytics=false';

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 750 },
  deviceScaleFactor: 1
});
await page.goto(URL, { waitUntil: 'networkidle', timeout: 90_000 });
// model-viewer sets `loaded` once the glTF is ready; fall back to a fixed wait if the element differs.
await page
  .waitForFunction(
    () => {
      const viewer = document.querySelector('model-viewer');
      return viewer !== null && viewer.loaded === true;
    },
    undefined,
    { timeout: 60_000 }
  )
  .catch(() => page.waitForTimeout(10_000));
await page.waitForTimeout(2_000);
await page.screenshot({ path: 'assets/images/retailverse-web.png' });
await browser.close();
console.log('assets/images/retailverse-web.png');
