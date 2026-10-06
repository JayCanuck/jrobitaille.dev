// Performance, security-header and architecture gates over the served export (AGENTS.md budgets,
// D14, D17): CLS 0 before and after the islands mount, the initial JavaScript under 150 KB gzipped
// with every island outside it, one named budget per lazy set, a strict CSP without 'unsafe-inline',
// client components only in the island directories with a reason, no effects anywhere, and the SEO
// and agent files present.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

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
  'profile-json': 24 * 1024
};
const POLYFILL_MARKER = '__isWebMCPPolyfill';

// 'use client' is allowed only here, and only with a comment on the next line saying why.
const CLIENT_ALLOWLIST = ['src/components/islands/', 'src/components/webmcp/'];

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
const initialScripts = async (page: Page) => {
  const fromHtml = await page.evaluate(() => [
    ...Array.from(document.scripts)
      .filter(script => !script.noModule && script.src)
      .map(script => script.src),
    ...Array.from(
      document.querySelectorAll<HTMLLinkElement>(
        'link[rel="preload"][as="script"], link[rel="modulepreload"]'
      )
    ).map(link => link.href)
  ]);
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
  inHero: boolean;
  horizontalOnly: boolean;
  text: string;
}

const measureCls = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<{ total: number; sources: ShiftSource[] }>(resolve => {
        let total = 0;
        const sources: ShiftSource[] = [];
        const hero = document.querySelector('section.hero-timeline');
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
              sources.push({
                value: entry.value,
                name,
                inHero: Boolean(hero && element && hero.contains(element)),
                horizontalOnly:
                  Math.round(a.y) === Math.round(b.y) &&
                  Math.round(a.height) === Math.round(b.height),
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
});

// The web fonts arriving after first paint (D15 amendment): the fallback faces are metric-adjusted
// and every row that could wrap differently has a fixed line count, so nothing below the hero moves.
// What remains is the centred hero text re-centring by a few pixels at the swap, a measured
// sub-perceptual shift that is accepted (0.0003 at 1280, up to 0.0008 and rare at 390): the total
// stays under 0.005 and every source is a hero text re-centre (inside the hero, horizontal only);
// any other source or any larger value fails with the element and its rects. Thirty loads per
// width with the font files held back two seconds.
const FONT_DELAY_RUNS = 30;
const SWAP_RECENTRE_CLS = 0.005;
test('fonts arriving two seconds late shift nothing but a sub-perceptual hero re-centre', async ({
  page
}) => {
  test.skip(
    !['mobile-390', 'desktop-1280'].includes(test.info().project.name),
    'the two widths the budget names'
  );
  test.setTimeout(10 * 60_000);
  await page.route('**/*.woff2', async route => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    await route.continue();
  });
  for (let run = 1; run <= FONT_DELAY_RUNS; run++) {
    await page.goto('/', { waitUntil: 'load' });
    await page.waitForTimeout(2600);
    const cls = await measureCls(page);
    const label = `run ${String(run)} with the fonts delayed: ${describeShifts(cls.sources)}`;
    expect(cls.total, label).toBeLessThan(SWAP_RECENTRE_CLS);
    const foreign = cls.sources.filter(source => !(source.inHero && source.horizontalOnly));
    expect(
      foreign.map(source => source.text),
      label
    ).toEqual([]);
  }
});

test('home JavaScript for evergreen browsers stays within the measured budget, islands excluded', async ({
  page,
  request
}) => {
  await page.goto('/', { waitUntil: 'load' });
  const initial = await initialScripts(page);
  expect(initial.size).toBeGreaterThan(0);
  const total = await sumGzipped(request, initial);
  expect(total, `initial scripts: ${[...initial].join(', ')}`).toBeLessThan(JS_BUDGET_BYTES);

  // The WebMCP island loads after idle as chunks the HTML never references. (A low-priority chunk
  // the HTML does reference may also start after the load event; it is counted above already.)
  const loadStart = await loadEventStart(page);
  await expect(badge(page)).toBeVisible({ timeout: 10_000 });
  const lazy = await resourcesSince(page, loadStart, /\.js(\?|$)/);
  const islandChunks = lazy.filter(url => !initial.has(url));
  expect(islandChunks.length).toBeGreaterThan(0);
  const html = await (await request.get('/')).text();
  for (const url of islandChunks) expect(html, url).not.toContain(new URL(url).pathname);
});

test('the WebMCP island and the polyfill stay within their own lazy budgets', async ({
  page,
  request
}) => {
  await page.goto('/', { waitUntil: 'load' });
  const initial = await initialScripts(page);
  const loadStart = await loadEventStart(page);
  await expect(badge(page)).toBeVisible({ timeout: 10_000 });
  // Only chunks the HTML never references count: a low-priority initial chunk may start late.
  const lazy = (await resourcesSince(page, loadStart, /\.js(\?|$)/)).filter(
    url => !initial.has(url)
  );
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
  const fetches = await resourcesSince(page, -1, /\/api\/profile\.json/);
  expect(fetches).toHaveLength(1);
  expect(await gzippedSize(request, '/api/profile.json')).toBeLessThan(
    LAZY_BUDGET_BYTES['profile-json']
  );
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
