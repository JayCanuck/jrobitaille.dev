// Frame the WebOS Quick Install screenshot from Jason's own repository (JayCanuck/webos-quick-install,
// screenshot.png) at 1200x750 into assets/images/webos-homebrew.png (then run scripts/images.mjs).
import { writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const SOURCE =
  'https://raw.githubusercontent.com/JayCanuck/webos-quick-install/HEAD/screenshot.png';

const response = await fetch(SOURCE);
if (!response.ok) throw new Error(`${SOURCE}: ${String(response.status)}`);
const png = Buffer.from(await response.arrayBuffer());
writeFileSync('assets/images/webos-quick-install-source.png', png);
const dataUrl = `data:image/png;base64,${png.toString('base64')}`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  html, body { margin: 0; width: 1200px; height: 750px; }
  body { display: flex; align-items: center; justify-content: center; background: #101321;
         background-image: repeating-linear-gradient(135deg, rgba(255,255,255,.04) 0 1px, transparent 1px 14px); }
  img { max-width: 84%; max-height: 82%; border-radius: 10px; box-shadow: 0 30px 80px rgba(0,0,0,.6);
        outline: 1px solid rgba(255,255,255,.12); }
</style></head><body><img src="${dataUrl}" alt=""></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 750 },
  deviceScaleFactor: 1
});
await page.setContent(html, { waitUntil: 'load' });
await page.screenshot({ path: 'assets/images/webos-homebrew.png' });
await browser.close();
console.log('assets/images/webos-homebrew.png');
