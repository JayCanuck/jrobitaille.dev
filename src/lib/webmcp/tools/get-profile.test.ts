// get_profile: identity and summary copied from the agent-facing data, read-only.
import { describe, expect, it } from 'vitest';

import { buildProfileData } from '@/lib/webmcp/profile-data';
import { getProfile } from './get-profile';
import { EMPTY_INPUT } from './types';

const data = buildProfileData();
const FIELDS = [
  'name',
  'title',
  'headline',
  'location',
  'url',
  'summary',
  'about',
  'availability'
] as const;

describe('get_profile', () => {
  it('declares its name, description and an empty input schema', () => {
    expect(getProfile.name).toBe('get_profile');
    expect(getProfile.description).toBe(
      'Identity and summary: name, title, headline, location, site url, summary, the About paragraphs and the structured availability.'
    );
    expect(getProfile.inputSchema).toBe(EMPTY_INPUT);
  });

  it('returns exactly the listed fields', () => {
    const result = getProfile.handler(data, {});
    expect(result.isError).toBeUndefined();
    expect(Object.keys(result.structuredContent ?? {}).sort()).toEqual([...FIELDS].sort());
  });

  it('copies each field from the data unchanged', () => {
    const value = getProfile.handler(data, {}).structuredContent;
    for (const field of FIELDS) expect(value?.[field]).toEqual(data[field]);
  });

  it('puts the same value as JSON text in content', () => {
    const result = getProfile.handler(data, {});
    expect(result.content[0].text).toBe(JSON.stringify(result.structuredContent));
  });

  it('does not mutate the data', () => {
    const before = JSON.stringify(data);
    getProfile.handler(data, {});
    expect(JSON.stringify(data)).toBe(before);
  });
});
