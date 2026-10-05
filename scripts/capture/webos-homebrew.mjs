// Frame the WebOS Quick Install screenshot from the owner's repository (JayCanuck/webos-quick-install,
// screenshot.png) at 1200x750 into assets/images/webos-homebrew.png (then run scripts/images.mjs).
// The window fills the frame like the other card screenshots do, rather than sitting small on a
// dark field; the committed source is reused when present.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const SOURCE =
  'https://raw.githubusercontent.com/JayCanuck/webos-quick-install/HEAD/screenshot.png';
const LOCAL = 'assets/images/webos-quick-install-source.png';

let png;
if (existsSync(LOCAL)) {
  png = readFileSync(LOCAL);
} else {
  const response = await fetch(SOURCE);
  if (!response.ok) throw new Error(`${SOURCE}: ${String(response.status)}`);
  png = Buffer.from(await response.arrayBuffer());
  writeFileSync(LOCAL, png);
}
const dataUrl = `data:image/png;base64,${png.toString('base64')}`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  html, body { margin: 0; width: 1200px; height: 750px; }
  body { display: flex; align-items: flex-end; justify-content: center; background: #101321;
         background-image: repeating-linear-gradient(135deg, rgba(255,255,255,.04) 0 1px, transparent 1px 14px); }
  img { width: 94%; height: auto; margin-bottom: -2%; border-radius: 10px 10px 0 0; box-shadow: 0 24px 64px rgba(0,0,0,.6);
        outline: 1px solid rgba(255,255,255,.12); image-rendering: auto; }
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
