// Claims discipline: no public string may carry a content-guard term from .claude/rules/content.md.
import { describe, expect, it } from 'vitest';

import { experience } from '@/content/experience';
import { projects } from '@/content/projects';
import { profile, skills } from '@/content/resume';

// Mirrors the content-guard list in .claude/rules/content.md, plus two session additions:
// the unclaimable LLM prototype wording ([id]) and the lapsed svlsimulator.com domain
// (bare host only; the github.com/lgsvl/svlsimulator.com repo link is fine).
const NEVER_SHIP: [string, RegExp][] = [
  ['phone number', /\(?650\)?[ -]?996|\d{3}[-. ]\d{3}[-. ]\d{4}/],
  [
    'street address',
    /\b\d{2,5} [A-Z][a-z]+ (St|Street|Ave|Avenue|Rd|Road|Dr|Drive|Blvd|Way|Ct|Ln)\b/
  ],
  ['payroll entity', /Zenith/],
  ['lab name', /Emerging Tech Lab/],
  ['compensation or severance', /severance|compensation|salary/i],
  ['patents', /patent/i],
  ['download counts', /\d[\d,]*\s*downloads?\b|downloads? counts?/i],
  ['unclaimable LLM prototype', /Anthropic API/],
  ['lapsed domain', /(?<![\w/.])svlsimulator\.com/]
];

const collectStrings = (value: unknown, out: string[] = []): string[] => {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) for (const item of value) collectStrings(item, out);
  else if (value && typeof value === 'object')
    for (const item of Object.values(value)) collectStrings(item, out);
  return out;
};

const publicStrings = collectStrings([profile, skills, experience, projects]);

describe('public strings', () => {
  it('exist', () => {
    expect(publicStrings.length).toBeGreaterThan(50);
  });

  it.each(NEVER_SHIP)('never contain a %s', (_label, pattern) => {
    const offenders = publicStrings.filter(text => pattern.test(text));
    expect(offenders).toEqual([]);
  });

  it('carry only the public email address', () => {
    const emails = publicStrings.flatMap(text => text.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) ?? []);
    expect(new Set(emails)).toEqual(new Set(['jason.aj.robitaille@gmail.com']));
  });

  it('link to the download button, not download counts', () => {
    expect(
      NEVER_SHIP.find(([label]) => label === 'download counts')?.[1].test('Resume (PDF)')
    ).toBe(false);
  });
});
