// Render the real `npx gamelist-utils --help` output in a terminal-style frame at 1200x750 into
// assets/images/gamelist-utils-muos.png (then run scripts/images.mjs). Jason's own package.
import { spawnSync } from 'node:child_process';
import { chromium } from '@playwright/test';

const result = spawnSync('npx', ['-y', 'gamelist-utils', '--help'], {
  encoding: 'utf8',
  shell: process.platform === 'win32',
  timeout: 120_000
});
const output = `${result.stdout}${result.stderr}`.trim();
if (!output) throw new Error('no output from gamelist-utils --help');

const escape = text => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  html, body { margin: 0; width: 1200px; height: 750px; }
  body { display: flex; align-items: center; justify-content: center; background: #101321; }
  .window { width: 1040px; height: 620px; border-radius: 12px; background: #0b0d14; color: #e6e8f0;
            box-shadow: 0 30px 80px rgba(0,0,0,.6); outline: 1px solid rgba(255,255,255,.12);
            overflow: hidden; display: flex; flex-direction: column; }
  .bar { display: flex; gap: 8px; align-items: center; padding: 12px 16px; background: #161a27;
         font: 13px ui-monospace, Menlo, Consolas, monospace; color: #8a93ab; }
  .dot { width: 12px; height: 12px; border-radius: 50%; background: #2a3042; }
  pre { margin: 0; padding: 20px 24px; font: 15px/1.5 ui-monospace, Menlo, Consolas, monospace;
        white-space: pre-wrap; overflow: hidden; }
  .prompt { color: #c4b5fd; }
</style></head><body><div class="window">
  <div class="bar"><span class="dot"></span><span class="dot"></span><span class="dot"></span>
    <span style="margin-left:8px">gamelist-utils</span></div>
  <pre><span class="prompt">$</span> npx gamelist-utils --help\n${escape(output)}</pre>
</div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 750 },
  deviceScaleFactor: 1
});
await page.setContent(html, { waitUntil: 'load' });
await page.screenshot({ path: 'assets/images/gamelist-utils-muos.png' });
await browser.close();
console.log('assets/images/gamelist-utils-muos.png');
