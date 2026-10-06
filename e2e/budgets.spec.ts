// Performance, security-header and architecture gates over the served export (AGENTS.md budgets,
// D14, D17): CLS 0 before and after the islands mount, the initial JavaScript under 150 KB gzipped
// with every island outside it, one named budget per lazy set, a strict CSP without 'unsafe-inline',
// client components only in the island directories with a reason, no effects anywhere, and the SEO
// and agent files present.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

import { profile } from '../src/content/resume';
import { siteCopy } from '../src/content/site';

// AGENTS.md budget: 150 KB gzipped on home for evergreen browsers. Measured 2026-10-04 with Next
// 16.3.8 and React 19.3: React DOM, the Flight client and the app router 116.8 KB, Next helpers
// 27.0 KB, site code 0 KB; 143.8 KB in all. Phase 4 adds the island loader (about 2.3 KB). The
// guard holds that line so a dependency or an island cannot grow it unnoticed (D14, D17).
const JS_BUDGET_BYTES = 150 * 1024;

// Lazy sets, gzipped, each asserted on its own trigger (D17). Islands are identified by when they
// load, not by their hashed chunk names, which is why every island has a distinct trigger.
const LAZY_BUDGET_BYTES = {
  // The WebMCP island with the eight tool definitions and the badge, loaded after idle.
  webmcp: 10 * 1024,
  // @mcp-b/webmcp-polyfill 5.1.0, loaded only when the browser has no native API (8.0 KB measured).
  'webmcp-polyfill': 12 * 1024,
  // /api/profile.json, fetched on the first tool call, never at idle.
  'profile-json': 24 * 1024,
  // The skills cloud: three, fiber and the island in one chunk (245 KB measured, D18).
  cloud: 260 * 1024,
  // The Konami egg: the detector and the payoff, loaded on the first keydown (D14 amendment).
  konami: 3 * 1024
};
const POLYFILL_MARKER = '__isWebMCPPolyfill';
const THREE_MARKER = 'WebGLRenderer';
const KONAMI_MARKER = 'ArrowLeft';
const KONAMI_KEYS = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a'
];

// 'use client' is allowed only here, and only with a comment on the next line saying why.
const CLIENT_ALLOWLIST = [
  'src/components/islands/',
  'src/components/webmcp/',
  'src/components/cloud/',
  'src/components/konami/'
];

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

const gzippedSize = async (request: APIRequestContext, url: string) =>
  gzipSync(await (await request.get(url)).body()).length;

const sumGzipped = async (request: APIRequestContext, urls: Iterable<string>) => {
  let total = 0;
  for (const url of urls) total += await gzippedSize(request, url);
  return total;
};

const hasMarker = async (request: APIRequestContext, url: string, marker: string) =>
  (await (await request.get(url)).text()).includes(marker);

const isNativeProject = () => test.info().project.name.endsWith('-webmcp');

// Resource timing from inside the page: what was fetched and when, relative to the load event.
const resourcesSince = (page: Page, since: number, pattern: RegExp) =>
  page.evaluate(
    ([from, source]) =>
      performance
        .getEntriesByType('resource')
        .filter(entry => entry.startTime > from && new RegExp(source).test(entry.name))
        .map(entry => entry.name),
    [since, pattern.source] as const
  );

const loadEventStart = (page: Page) =>
  page.evaluate(() => {
    const [navigation] = performance.getEntriesByType('navigation');
    return (navigation as PerformanceNavigationTiming).loadEventStart;
  });

// "Initial" JavaScript (D17): the union of the module scripts the exported HTML references (nomodule
// polyfills never load in evergreen browsers, D10), the script preloads in that HTML, and every
// script fetched before the load event with no interaction. Everything an island loads comes later.
const initialScripts = async (page: Page, request: APIRequestContext) => {
  // From the served HTML, not the live DOM: Turbopack appends a script tag for every dynamic
  // chunk it loads, so after hydration the DOM would list an island as if the HTML had.
  const html = await (await request.get('/')).text();
  const base = new URL(page.url());
  const tags = (name: string) =>
    Array.from(html.matchAll(new RegExp(`<${name}\\b([^>]*)>`, 'g'))).map(match => match[1] ?? '');
  const attribute = (attrs: string, name: string) =>
    new RegExp(`\\b${name}="([^"]+)"`).exec(attrs)?.[1];
  const fromHtml = [
    ...tags('script')
      .filter(attrs => !/\bnomodule\b/i.test(attrs))
      .map(attrs => attribute(attrs, 'src')),
    ...tags('link')
      .filter(attrs => /rel="(preload|modulepreload)"/.test(attrs))
      .filter(attrs => !attrs.includes('rel="preload"') || attrs.includes('as="script"'))
      .map(attrs => attribute(attrs, 'href'))
  ]
    .filter((path): path is string => Boolean(path))
    .map(path => new URL(path, base).href);
  const loadStart = await loadEventStart(page);
  const untilLoad = await page.evaluate(
    from =>
      performance
        .getEntriesByType('resource')
        .filter(entry => entry.startTime <= from && /\.js(\?|$)/.test(entry.name))
        .map(entry => entry.name),
    loadStart
  );
  return new Set([...fromHtml, ...untilLoad]);
};

const badge = (page: Page) => page.getByRole('button', { name: siteCopy.agentTools.badge });

// Layout-shift entries so far, each source named with its rects, so a failure says what moved and
// by how much rather than a bare number.
interface ShiftSource {
  value: number;
  name: string;
  // Inside the hero: centred text that re-centres by a few pixels at the font swap.
  inHero: boolean;
  // Inside the Toolbox reserved box: wrapping chips that may re-break while the box stays put.
  inToolbox: boolean;
  // About prose: left-aligned paragraphs whose line count a wide fallback face can change.
  inAbout: boolean;
  text: string;
}

const measureCls = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<{ total: number; sources: ShiftSource[] }>(resolve => {
        let total = 0;
        const sources: ShiftSource[] = [];
        const hero = document.querySelector('section.hero-timeline');
        const about = document.getElementById('about');
        // The Toolbox reserved boxes: the chip box and the control's slot in the heading row.
        const toolbox = [
          document.querySelector('[data-island="cloud"]'),
          document.getElementById('skills-view')
        ];
        const observer = new PerformanceObserver(list => {
          for (const entry of list.getEntries() as (PerformanceEntry & {
            value: number;
            hadRecentInput: boolean;
            sources?: {
              node: Node | null;
              previousRect: DOMRectReadOnly;
              currentRect: DOMRectReadOnly;
            }[];
          })[]) {
            if (entry.hadRecentInput) continue;
            total += entry.value;
            const rect = (r: DOMRectReadOnly) =>
              [r.x, r.y, r.width, r.height].map(n => String(Math.round(n))).join(',');
            for (const source of entry.sources ?? []) {
              const node = source.node;
              const element = node instanceof Element ? node : (node?.parentElement ?? null);
              const name =
                node instanceof Element
                  ? `${node.tagName.toLowerCase()}.${node.getAttribute('class') ?? ''}`
                  : `text in ${element?.tagName.toLowerCase() ?? '?'}.${element?.getAttribute('class') ?? ''}`;
              const { previousRect: a, currentRect: b } = source;
              const inHero = Boolean(hero && element && hero.contains(element));
              sources.push({
                value: entry.value,
                name,
                inHero,
                inAbout: Boolean(about && element && about.contains(element)),
                inToolbox: Boolean(element && toolbox.some(box => box?.contains(element))),
                text: `${entry.value.toFixed(4)} at ${String(Math.round(entry.startTime))}ms ${name} [${rect(a)}] -> [${rect(b)}]`
              });
            }
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });
        setTimeout(() => {
          observer.disconnect();
          resolve({ total, sources });
        }, 300);
      })
  );

const describeShifts = (sources: ShiftSource[]) => sources.map(source => source.text).join(' | ');

const expectNoShift = async (page: Page, when: string) => {
  const cls = await measureCls(page);
  expect(cls.total, `${when}: ${describeShifts(cls.sources)}`).toBe(0);
};

// The platform fonts Chromium actually used for an element, so the record names the fallback face
// the runner resolved (Arial on Windows, whatever fontconfig gives on Linux).
const platformFonts = async (page: Page, selector: string) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('DOM.enable');
  await cdp.send('CSS.enable');
  const { root } = await cdp.send('DOM.getDocument', { depth: 1 });
  const { nodeId } = await cdp.send('DOM.querySelector', {
    nodeId: root.nodeId,
    selector
  });
  const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
  await cdp.detach();
  return fonts
    .map(
      font =>
        `${font.familyName} (${font.isCustomFont ? 'web' : 'system'}, ${String(font.glyphCount)} glyphs)`
    )
    .join(', ');
};

test('home has a cumulative layout shift of 0, before and after the islands mount', async ({
  page
}) => {
  await page.goto('/');
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await page.waitForTimeout(500);
  await expectNoShift(page, 'after load and a scroll to the bottom');
  // The WebMCP island arrives after idle and fills a reserved row in the footer.
  await expect(badge(page)).toBeVisible({ timeout: 10_000 });
  await page.waitForTimeout(300);
  await expectNoShift(page, 'after the badge');
  // The cloud overlays the chips inside their reserved box once the Cloud control is pressed.
  await page.getByRole('button', { name: siteCopy.skillsView.cloud }).click();
  await expect(page.locator('[data-island="cloud"] canvas')).toBeAttached({ timeout: 20_000 });
  await page.waitForTimeout(500);
  await expectNoShift(page, 'after the cloud mounted');
  // The Konami payoff is a fixed layer: the island loads on the first key, the rest follow.
  await page.keyboard.press(KONAMI_KEYS[0] ?? '');
  await expect(page.locator('[data-konami="armed"]')).toBeAttached({ timeout: 10_000 });
  for (const key of KONAMI_KEYS.slice(1)) await page.keyboard.press(key);
  await expect(page.locator('[data-konami="showing"]')).toBeAttached();
  await page.waitForTimeout(1500);
  await expectNoShift(page, 'after the Konami payoff');
});

// The web fonts arriving after first paint (D15 amendment). The first viewport is immune to the
// fallback face the platform resolves: every row that could wrap differently has a fixed line
// count, and the fallback stack applies calibrated metric overrides to whichever local face
// matches. The runner's own fallback is the mismatched case and a developer machine the
// compatible one, so nothing is simulated. Loads per project: ten in CI, thirty with
// FONT_DELAY_RUNS=30 for a diagnosis run, the font files held back two seconds. On every load: no
// line count above the fold changes except the About paragraphs (left-aligned prose whose break
// points a face decides; only their first line is above the fold), no layout-shift source outside
// the hero, About or the two Toolbox reserved boxes (the chip box and the control's slot, whose
// own rects are asserted unchanged), and the total stays under 0.01; failures name the element and
// its rects. The first load logs the fallback face Chromium rendered.
const FONT_DELAY_RUNS = Number(process.env.FONT_DELAY_RUNS ?? (process.env.CI ? 10 : 30));
const FONT_SWAP_CLS = 0.01;

// The Toolbox reserved boxes in page coordinates, the chip box and the control's slot: the chips
// and the labels may re-flow under the fallback face, but neither box changes size or position at
// the swap.
const toolboxBox = (page: Page) =>
  page.evaluate(() =>
    [document.querySelector('[data-island="cloud"]'), document.getElementById('skills-view')].map(
      box => {
        if (!box) return null;
        const r = box.getBoundingClientRect();
        return [r.x, r.y + window.scrollY, r.width, r.height].map(n => Math.round(n));
      }
    )
  );

// Line counts of every text-bearing element above the fold, keyed by element, so a wrap change
// between the fallback and the web font is named; About prose is keyed apart.
const foldLineCounts = (page: Page) =>
  page.evaluate(() => {
    const out: Record<string, number> = {};
    const seen = new Map<string, number>();
    document.querySelectorAll('h1, h2, h3, p, li, a, span').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0 || rect.top >= window.innerHeight) return;
      const text = el.textContent.trim();
      if (!text) return;
      const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
      if (!lineHeight) return;
      // About prose and the chip rows inside the Toolbox box may re-break at the swap; the box
      // itself is asserted unchanged instead (D18).
      const chipRow = el.closest('[data-island="cloud"]') && /^(ul|li)$/i.test(el.tagName);
      const section = el.closest('#about') ? 'about: ' : chipRow ? 'toolbox-chips: ' : '';
      const base = `${section}${el.tagName.toLowerCase()}.${(el.getAttribute('class') ?? '').slice(0, 24)} "${text.slice(0, 16)}"`;
      const n = (seen.get(base) ?? 0) + 1;
      seen.set(base, n);
      out[n > 1 ? `${base} #${String(n)}` : base] = Math.round(rect.height / lineHeight);
    });
    return out;
  });

test('fonts arriving two seconds late move nothing outside the hero and the About prose', async ({
  page
}) => {
  test.skip(
    !['mobile-390', 'desktop-1280'].includes(test.info().project.name),
    'the two widths the budget names'
  );
  test.setTimeout(10 * 60_000);
  const started = Date.now();
  const tag = `[font-delay ${test.info().project.name}]`;
  await page.route('**/*.woff2', async route => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    await route.continue();
  });
  for (let run = 1; run <= FONT_DELAY_RUNS; run++) {
    // The preloaded font requests hold the load event, so the fallback is observed before it:
    // after the DOM, first paint, hydration and the mount of the Toolbox control, which does not
    // wait for fonts, two seconds ahead of the swap.
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#hero-heading')).toBeVisible();
    await expect(page.getByRole('button', { name: siteCopy.skillsView.list })).toBeAttached();
    const before = await foldLineCounts(page);
    const boxBefore = await toolboxBox(page);
    if (run === 1) {
      console.log(
        `${tag} fallback rendered for the name: ${await platformFonts(page, '#hero-heading')}; for a label: ${await platformFonts(page, 'section.hero-timeline li a')}`
      );
    }
    await page.waitForLoadState('load');
    await page.waitForTimeout(2600);
    if (run === 1) {
      console.log(
        `${tag} web font rendered for the name: ${await platformFonts(page, '#hero-heading')}`
      );
    }
    const after = await foldLineCounts(page);
    expect(
      await toolboxBox(page),
      `${tag} run ${String(run)}: a Toolbox reserved box changed`
    ).toEqual(boxBefore);
    const rewrapped = Object.keys(before)
      .filter(key => !key.startsWith('about: ') && !key.startsWith('toolbox-chips: '))
      .filter(key => key in after && before[key] !== after[key])
      .map(key => `${key}: ${String(before[key])} -> ${String(after[key])} lines`);
    expect(rewrapped, `${tag} run ${String(run)}: line counts above the fold changed`).toEqual([]);
    const cls = await measureCls(page);
    const label = `${tag} run ${String(run)}: ${describeShifts(cls.sources)}`;
    expect(cls.total, label).toBeLessThan(FONT_SWAP_CLS);
    const foreign = cls.sources.filter(
      source => !(source.inHero || source.inAbout || source.inToolbox)
    );
    expect(
      foreign.map(source => source.text),
      label
    ).toEqual([]);
  }
  console.log(
    `${tag} ${String(FONT_DELAY_RUNS)} loads in ${String(Math.round((Date.now() - started) / 1000))} s`
  );
});
// Scripts fetched after the load event that the HTML never referenced: the islands. Polled, since
// a resource-timing entry can land a moment after the state it belongs to.
const lazyIslandScripts = async (page: Page, initial: Set<string>, loadStart: number) =>
  (await resourcesSince(page, loadStart, /\.js(\?|$)/)).filter(url => !initial.has(url));

test('home JavaScript for evergreen browsers stays within the measured budget, islands excluded', async ({
  page,
  request
}) => {
  await page.goto('/', { waitUntil: 'load' });
  const initial = await initialScripts(page, request);
  expect(initial.size).toBeGreaterThan(0);
  const total = await sumGzipped(request, initial);
  expect(total, `initial scripts: ${[...initial].join(', ')}`).toBeLessThan(JS_BUDGET_BYTES);

  // The WebMCP island loads after idle as chunks the HTML never references. Wait on the state it
  // depends on (registration finished, the badge visible), then on the entries themselves.
  const loadStart = await loadEventStart(page);
  await expect(badge(page)).toBeVisible({ timeout: 10_000 });
  await expect
    .poll(() => lazyIslandScripts(page, initial, loadStart), {
      message: `island chunks after load, outside the initial set ${[...initial].join(', ')}`,
      timeout: 10_000
    })
    .not.toEqual([]);
  const islandChunks = await lazyIslandScripts(page, initial, loadStart);
  const html = await (await request.get('/')).text();
  for (const url of islandChunks) expect(html, url).not.toContain(new URL(url).pathname);
});

test('the WebMCP island and the polyfill stay within their own lazy budgets', async ({
  page,
  request
}) => {
  await page.goto('/', { waitUntil: 'load' });
  const initial = await initialScripts(page, request);
  const loadStart = await loadEventStart(page);
  await expect(badge(page)).toBeVisible({ timeout: 10_000 });
  await expect
    .poll(() => lazyIslandScripts(page, initial, loadStart), {
      timeout: 10_000
    })
    .not.toEqual([]);
  const lazy = await lazyIslandScripts(page, initial, loadStart);
  const polyfill: string[] = [];
  const island: string[] = [];
  for (const url of lazy) {
    if (await hasMarker(request, url, POLYFILL_MARKER)) polyfill.push(url);
    else island.push(url);
  }
  expect(await sumGzipped(request, island), island.join(', ')).toBeLessThan(
    LAZY_BUDGET_BYTES.webmcp
  );
  if (isNativeProject()) {
    // The native API exists, so the polyfill chunk is never requested.
    expect(polyfill).toEqual([]);
  } else {
    expect(polyfill).toHaveLength(1);
    expect(await sumGzipped(request, polyfill)).toBeLessThan(LAZY_BUDGET_BYTES['webmcp-polyfill']);
  }
  // The data is not fetched at idle; the first tool call pays for it (next test).
  expect(await resourcesSince(page, -1, /\/api\/profile\.json/)).toEqual([]);
});

test('the profile JSON is fetched once, on the first tool call, within its budget', async ({
  page,
  request
}) => {
  await page.goto('/', { waitUntil: 'load' });
  await expect(badge(page)).toBeVisible({ timeout: 10_000 });
  const results = await page.evaluate(async () => {
    const context = (
      document as {
        modelContext?: {
          getTools(): Promise<{ name: string }[]>;
          executeTool(tool: { name: string }, input: string): Promise<unknown>;
        };
      }
    ).modelContext;
    if (!context) throw new Error('no modelContext');
    const toolList = await context.getTools();
    const skills = toolList.find(tool => tool.name === 'get_skills');
    const contact = toolList.find(tool => tool.name === 'get_contact');
    if (!skills || !contact) throw new Error('tools missing');
    return [await context.executeTool(skills, '{}'), await context.executeTool(contact, '{}')];
  });
  expect(results).toHaveLength(2);
  await expect
    .poll(() => resourcesSince(page, -1, /\/api\/profile\.json/), {
      timeout: 5000
    })
    .toHaveLength(1);
  expect(await gzippedSize(request, '/api/profile.json')).toBeLessThan(
    LAZY_BUDGET_BYTES['profile-json']
  );
});
test('the Konami island loads on the first keydown and stays within its lazy budget', async ({
  page,
  request
}) => {
  await page.goto('/', { waitUntil: 'load' });
  const initial = await initialScripts(page, request);
  const loadStart = await loadEventStart(page);
  // The idle island first, so the only scripts after the key are the egg's.
  await expect(badge(page)).toBeVisible({ timeout: 10_000 });
  await page.waitForTimeout(300);
  const beforeKey = new Set(await lazyIslandScripts(page, initial, loadStart));
  await page.keyboard.press(KONAMI_KEYS[0] ?? '');
  await expect(page.locator('[data-konami="armed"]')).toBeAttached({ timeout: 10_000 });
  await expect
    .poll(async () =>
      (await lazyIslandScripts(page, initial, loadStart)).filter(url => !beforeKey.has(url))
    )
    .not.toEqual([]);
  const konami = (await lazyIslandScripts(page, initial, loadStart)).filter(
    url => !beforeKey.has(url)
  );
  for (const url of konami) expect(await hasMarker(request, url, KONAMI_MARKER), url).toBe(true);
  for (const url of konami) expect(initial.has(url), url).toBe(false);
  expect(await sumGzipped(request, konami), konami.join(', ')).toBeLessThan(
    LAZY_BUDGET_BYTES.konami
  );
});

test('the skills cloud loads only on the Cloud control and stays within its lazy budget', async ({
  page,
  request
}) => {
  await page.goto('/', { waitUntil: 'load' });
  const initial = await initialScripts(page, request);
  const loadStart = await loadEventStart(page);
  await page.getByRole('button', { name: siteCopy.skillsView.cloud }).click();
  await expect(page.locator('[data-island="cloud"] canvas')).toBeAttached({ timeout: 20_000 });
  const lazy = (await resourcesSince(page, loadStart, /\.js(\?|$)/)).filter(
    url => !initial.has(url)
  );
  const cloud: string[] = [];
  for (const url of lazy) if (await hasMarker(request, url, THREE_MARKER)) cloud.push(url);
  expect(cloud.length).toBeGreaterThan(0);
  expect(await sumGzipped(request, cloud), cloud.join(', ')).toBeLessThan(LAZY_BUDGET_BYTES.cloud);
  // Islands never import content modules: no About paragraph can be in the cloud chunk.
  for (const url of cloud) {
    const body = await (await request.get(url)).text();
    for (const paragraph of profile.aboutLong) expect(body, url).not.toContain(paragraph);
    expect(body, url).not.toContain(profile.email);
  }
});

test('responses carry the strict security headers, and the agent JSON is CORS-open', async ({
  request
}) => {
  const response = await request.get('/');
  const csp = response.headers()['content-security-policy'] ?? '';
  expect(csp).toContain("script-src 'self' 'sha256-");
  expect(csp).not.toContain('unsafe-inline');
  expect(csp).not.toContain('unsafe-eval');
  expect(csp).toContain("style-src 'self'");
  expect(response.headers()['x-content-type-options']).toBe('nosniff');
  expect(response.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin');

  for (const path of ['/api/profile.json', '/api/profile.schema.json']) {
    const json = await request.get(path);
    expect(json.status(), path).toBe(200);
    expect(json.headers()['access-control-allow-origin'], path).toBe('*');
    expect(json.headers()['content-type'], path).toContain('application/json');
  }
});

test('home runs without console errors, the polyfill and registration included', async ({
  page
}) => {
  const errors: string[] = [];
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  // Registration (and the polyfill, where it loads) runs under the served CSP: no eval, no inline.
  await expect(badge(page)).toBeVisible({ timeout: 10_000 });
  await page.waitForLoadState('networkidle');
  expect(errors).toEqual([]);
});

test('SEO and agent files and tags are present', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    /opengraph-image/
  );
  await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(2);
  for (const path of [
    '/llms.txt',
    '/manifest.webmanifest',
    '/sitemap.xml',
    '/robots.txt',
    '/api/profile.json',
    '/api/profile.schema.json'
  ]) {
    expect((await request.get(path)).status(), path).toBe(200);
  }
  const llms = await (await request.get('/llms.txt')).text();
  expect(llms).toContain('/api/profile.json');
  expect(llms).toContain('get_profile');
});

test('client components only in the island directories, each with a reason; no effects anywhere', () => {
  const sources = walk('src').filter(
    path => /\.(ts|tsx)$/.test(path) && !path.endsWith('.test.ts')
  );
  const effects = sources.filter(path => /\buseEffect\b/.test(readFileSync(path, 'utf8')));
  expect(effects).toEqual([]);

  const clients = sources.filter(path => readFileSync(path, 'utf8').includes("'use client'"));
  for (const path of clients) {
    const normalized = path.replaceAll('\\', '/');
    expect(
      CLIENT_ALLOWLIST.some(dir => normalized.startsWith(dir)),
      `${normalized} is outside the island allowlist`
    ).toBe(true);
    const [first, second] = readFileSync(path, 'utf8').split('\n');
    expect(first?.trim(), path).toBe("'use client';");
    expect(second?.trim(), `${path} needs a comment saying why it is a client component`).toMatch(
      /^\/\/ Why a client component:/
    );
  }
});
