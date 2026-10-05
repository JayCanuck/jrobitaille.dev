// Every external URL in the content files must resolve with a 200 and never redirect off its own
// domain (content.md: links only to public, live proof; D11: the lapsed simulator domain). Network
// tests are not part of the default run, so this file does nothing unless CHECK_LINKS=1 is set;
// the monthly link workflow sets it. npm package pages refuse non-browser clients with a 403, so
// those are verified through the registry instead, which answers for the same package.
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const enabled = process.env.CHECK_LINKS === '1';
const dir = new URL('./', import.meta.url);

const urls = [
  ...new Set(
    readdirSync(dir)
      .filter(name => name.endsWith('.ts') && !name.endsWith('.test.ts'))
      .flatMap(name =>
        Array.from(
          readFileSync(new URL(name, dir), 'utf8').matchAll(/https:\/\/[^'"\s)]+/g),
          match => match[0]
        )
      )
  )
].sort();

// Registrable domain: the last two labels, so linkedin.com and www.linkedin.com count as one.
const domain = (url: string) => new URL(url).hostname.split('.').slice(-2).join('.');

// What to fetch for a URL: npm's web pages block automated clients, so a package page is checked
// against the registry document and a profile page against a registry search for that maintainer
// (the user record itself needs a login).
const probeUrl = (url: string) => {
  const { hostname, pathname } = new URL(url);
  if (hostname !== 'www.npmjs.com') return url;
  const pkg = /^\/package\/(.+)$/.exec(pathname)?.[1];
  if (pkg) return `https://registry.npmjs.org/${pkg}`;
  const user = /^\/~(.+)$/.exec(pathname)?.[1];
  if (user) return `https://registry.npmjs.org/-/v1/search?text=maintainer:${user}&size=1`;
  return url;
};

const follow = async (url: string) => {
  let current = probeUrl(url);
  for (let hop = 0; hop < 6; hop++) {
    const response = await fetch(current, {
      redirect: 'manual',
      headers: { 'user-agent': 'Mozilla/5.0 (content link check)' }
    });
    const location = response.headers.get('location');
    if (response.status >= 300 && response.status < 400 && location) {
      current = new URL(location, current).href;
      continue;
    }
    // A maintainer search answers 200 even for an unknown name; require at least one package.
    const total = current.includes('/-/v1/search?')
      ? ((await response.json()) as { total: number }).total
      : 1;
    return { status: total > 0 ? response.status : 404, final: current };
  }
  throw new Error(`${url}: too many redirects`);
};

describe.skipIf(!enabled)('content links', () => {
  it('found the content URLs', () => {
    expect(urls.length).toBeGreaterThan(10);
  });

  it.each(urls)(
    '%s resolves with 200 on its own domain',
    async url => {
      const { status, final } = await follow(url);
      expect(status, `${url} ended at ${final}`).toBe(200);
      if (probeUrl(url) === url)
        expect(domain(final), `${url} redirected to ${final}`).toBe(domain(url));
    },
    20_000
  );
});
