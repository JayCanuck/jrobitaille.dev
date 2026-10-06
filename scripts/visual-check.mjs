// visual-check: screenshot the built export at 390, 1280 and 2560 px in both color schemes.
// Usage: node scripts/visual-check.mjs [--path /nope] [--full] [--label name] [--widths 390,1024,1440,2560]
// (--accent name sets data-accent on <html> for a token experiment; the stylesheet must define it.)
// Requires `npm run build` first; serves ./out with wrangler dev on port 8788.
// --file some.html screenshots a local static file (a mockup) instead, with no server.
// --browser firefox uses Firefox (npx playwright install firefox) to check the no-scroll-driven fallback.
// --motion leaves motion on and captures the hero 0, 300 and 700 ms after load, then each section
// 400 ms after an instant scroll to it, so the stagger and the scroll-driven reveals can be reviewed.
// --scheme dark (or light) limits the run to one color scheme.
// --scale 1.25 sets the device scale factor (default 1) and suffixes the label with it.
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium, firefox } from '@playwright/test';

const args = process.argv.slice(2);
const opt = name => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? (args[i + 1] ?? true) : undefined;
};
const accent = opt('accent');
const path = opt('path') ?? '/';
const full = args.includes('--full');
const file = opt('file');
const browserName = opt('browser') === 'firefox' ? 'firefox' : 'chromium';
const motion = args.includes('--motion');
const scale = Number(opt('scale') ?? 1);
const schemes = opt('scheme') ? [String(opt('scheme'))] : ['light', 'dark'];
const HERO_FRAMES_MS = [0, 300, 700];
const SECTIONS = ['about', 'work', 'experience', 'skills'];
const SETTLE_MS = 400;
const label =
  (opt('label') ?? accent ?? (file ? basename(String(file), '.html') : 'default')) +
  (browserName === 'firefox' ? '-firefox' : '') +
  (motion ? '-motion' : '') +
  (scale === 1 ? '' : `-x${String(scale)}`);
const port = 8788;
const base = `http://127.0.0.1:${port}`;
const widths = opt('widths') ? String(opt('widths')).split(',').map(Number) : [390, 1280, 2560];
const outDir = join('.visual', String(label));
mkdirSync(outDir, { recursive: true });

const server = file
  ? undefined
  : spawn('npx', ['wrangler', 'dev', '--port', String(port)], {
      stdio: 'ignore',
      shell: process.platform === 'win32'
    });
const stop = () => {
  if (!server) return;
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

if (!file) await waitFor(base);
const target = file ? pathToFileURL(resolve(String(file))).href : `${base}${path}`;
const browser = await (browserName === 'firefox' ? firefox : chromium).launch();
for (const scheme of schemes) {
  for (const width of widths) {
    const context = await browser.newContext({
      viewport: { width, height: width < 768 ? 844 : 1200 },
      colorScheme: scheme,
      reducedMotion: motion ? 'no-preference' : 'reduce',
      deviceScaleFactor: scale
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
    const slug = path === '/' ? 'home' : path.replace(/\W+/g, '-');
    const shot = async suffix => {
      const file = join(outDir, `${slug}-${width}-${scheme}${suffix}.png`);
      await page.screenshot({ path: file, fullPage: full && !suffix });
      console.log(file);
    };
    // Motion review: hero frames timed from the load event, before anything else moves the page.
    if (motion) {
      await page.goto(target, { waitUntil: 'load' });
      const loaded = Date.now();
      for (const ms of HERO_FRAMES_MS) {
        const wait = loaded + ms - Date.now();
        if (wait > 0) await page.waitForTimeout(wait);
        await shot(`-${String(ms)}ms`);
      }
    } else {
      await page.goto(target, { waitUntil: 'networkidle' });
    }
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
    if (motion) {
      // Scroll-driven reveals follow position, so each section is captured after an instant scroll.
      // One pointer move stands in for the visitor's input: an instant scroll fires only a scroll
      // event, which the intent-gated islands ignore (D18), so without it the cloud never mounts.
      await page.mouse.move(8, 8);
      for (const id of SECTIONS) {
        const found = await page.evaluate(sectionId => {
          const section = document.getElementById(sectionId);
          if (!section) return false;
          section.scrollIntoView({ behavior: 'instant', block: 'start' });
          return true;
        }, id);
        if (!found) continue;
        await page.waitForTimeout(SETTLE_MS);
        if (id === 'skills') {
          // Let the cloud chunk load and mount where the gates allow it; bounded, never required.
          await page
            .locator('[data-island="cloud"] [data-cloud-view="cloud"]')
            .waitFor({ timeout: 8000 })
            .catch(() => undefined);
          await page.waitForTimeout(SETTLE_MS);
        }
        await shot(`-${id}`);
      }
    } else {
      await shot('');
    }
    await context.close();
  }
}
await browser.close();
stop();
