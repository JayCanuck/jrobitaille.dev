// visual-check: screenshot the built export at 390, 1280 and 2560 px in both color schemes.
// Usage: node scripts/visual-check.mjs [--path /nope] [--full] [--label name]
// (--accent name sets data-accent on <html> for a token experiment; the stylesheet must define it.)
// Requires `npm run build` first; serves ./out with wrangler dev on port 8788.
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from '@playwright/test';

const args = process.argv.slice(2);
const opt = name => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? (args[i + 1] ?? true) : undefined;
};
const accent = opt('accent');
const path = opt('path') ?? '/';
const full = args.includes('--full');
const label = opt('label') ?? accent ?? 'default';
const port = 8788;
const base = `http://127.0.0.1:${port}`;
const widths = [390, 1280, 2560];
const outDir = join('.visual', String(label));
mkdirSync(outDir, { recursive: true });

const server = spawn('npx', ['wrangler', 'dev', '--port', String(port)], {
  stdio: 'ignore',
  shell: process.platform === 'win32'
});
const stop = () => {
  if (process.platform === 'win32') spawn('taskkill', ['/pid', String(server.pid), '/T', '/F']);
  else server.kill();
};
process.on('exit', stop);

const waitFor = async (url, tries = 60) => {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404) return;
    } catch {
      // not up yet
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error(`server at ${url} did not start`);
};

await waitFor(base);
const browser = await chromium.launch();
for (const scheme of ['light', 'dark']) {
  for (const width of widths) {
    const context = await browser.newContext({
      viewport: { width, height: width < 768 ? 844 : 1200 },
      colorScheme: scheme,
      reducedMotion: 'reduce',
      deviceScaleFactor: 1
    });
    const page = await context.newPage();
    if (accent) {
      // Init scripts run before <html> exists, so apply the switch once the document is parsed.
      await page.addInitScript(value => {
        document.addEventListener('DOMContentLoaded', () => {
          document.documentElement.dataset.accent = value;
        });
      }, String(accent));
    }
    await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
    // Walk the page so lazy images load and fonts settle before a full-page capture.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise(resolve => setTimeout(resolve, 80));
      }
      window.scrollTo(0, 0);
      await Promise.all(
        Array.from(document.images).map(img =>
          img.complete
            ? Promise.resolve()
            : new Promise(resolve => img.addEventListener('load', resolve, { once: true }))
        )
      );
      await document.fonts.ready;
    });
    const file = join(
      outDir,
      `${path === '/' ? 'home' : path.replace(/\W+/g, '-')}-${width}-${scheme}.png`
    );
    await page.screenshot({ path: file, fullPage: full });
    console.log(file);
    await context.close();
  }
}
await browser.close();
stop();
