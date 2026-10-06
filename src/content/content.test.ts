// Content guard: no string in the content files may break the public content rules in
// .claude/rules/content.md. Generic checks live here; a gitignored content-guard.local.json
// ({ "deny": [regex strings] }) adds the site-specific terms and is skipped when absent.
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { earlier, employer } from '@/content/experience';
import { projects } from '@/content/projects';
import { availability, education, openSource, profile, skills, summary } from '@/content/resume';
import { siteCopy } from '@/content/site';

const PUBLIC_EMAIL = 'jason.aj.robitaille@gmail.com';

const CONTENT_GUARD: [string, RegExp][] = [
  ['phone number', /\(?\d{3}\)?[ .-]?\d{3}[ .-]?\d{4}/],
  [
    'street address',
    /\b\d{2,5} [A-Z][a-z]+ (St|Street|Ave|Avenue|Rd|Road|Dr|Drive|Blvd|Way|Ct|Ln)\b/
  ],
  // Lapsed domain, bare host only; a repository path containing it is fine.
  ['svlsimulator.com host', /(?<![\w/.])svlsimulator\.com/]
];

const LOCAL_GUARD = new URL('../../content-guard.local.json', import.meta.url);

const loadLocalGuard = (): [string, RegExp][] => {
  if (!existsSync(LOCAL_GUARD)) return [];
  const { deny } = JSON.parse(readFileSync(LOCAL_GUARD, 'utf8')) as { deny: string[] };
  return deny.map((source, index) => [`local rule ${String(index + 1)}`, new RegExp(source, 'i')]);
};

const localGuard = loadLocalGuard();

const collectStrings = (value: unknown, out: string[] = []): string[] => {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) for (const item of value) collectStrings(item, out);
  else if (value && typeof value === 'object')
    for (const item of Object.values(value)) collectStrings(item, out);
  return out;
};

// The full agent-facing data, unrendered bullets included (D12): the guard applies to every string.
const contentStrings = collectStrings([
  profile,
  summary,
  skills,
  employer,
  earlier,
  openSource,
  education,
  projects,
  siteCopy,
  availability
]);

describe('content strings', () => {
  it('exist', () => {
    expect(contentStrings.length).toBeGreaterThan(50);
  });

  it('apply the local guard when it is present', () => {
    if (localGuard.length === 0) {
      console.info('content guard: local guard not present, generic checks only');
    }
    expect(localGuard.every(([, pattern]) => pattern instanceof RegExp)).toBe(true);
  });

  it.each([...CONTENT_GUARD, ...localGuard])('never match the %s rule', (_label, pattern) => {
    const offenders = contentStrings.filter(text => pattern.test(text));
    expect(offenders).toEqual([]);
  });

  it('carry only the public email address', () => {
    const emails = contentStrings.flatMap(text => text.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) ?? []);
    expect(new Set(emails)).toEqual(new Set([PUBLIC_EMAIL]));
  });
});
