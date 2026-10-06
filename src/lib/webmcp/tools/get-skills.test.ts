// get_skills returns the five skill groups with their terms, copied from the profile data.
import { describe, expect, it } from 'vitest';

import { buildProfileData } from '@/lib/webmcp/profile-data';
import { getSkills } from '@/lib/webmcp/tools/get-skills';

const data = buildProfileData();

describe('get_skills', () => {
  it('declares its name, description and an empty input schema', () => {
    expect(getSkills.name).toBe('get_skills');
    expect(getSkills.description).toBe(
      'The five skill groups with their terms, as the Toolbox section lists them.'
    );
    expect(getSkills.inputSchema).toEqual({
      type: 'object',
      properties: {},
      additionalProperties: false
    });
  });

  it('returns exactly the skills field', () => {
    const result = getSkills.handler(data, {});
    expect(result.isError).toBeUndefined();
    expect(Object.keys(result.structuredContent ?? {})).toEqual(['skills']);
    expect(result.structuredContent?.skills).toEqual(data.skills);
    expect(data.skills).toHaveLength(5);
  });

  it('puts the same value in the text as JSON', () => {
    const result = getSkills.handler(data, {});
    expect(result.content[0].text).toBe(JSON.stringify(result.structuredContent));
  });

  it('does not mutate the data', () => {
    const before = JSON.stringify(data);
    getSkills.handler(data, {});
    expect(JSON.stringify(data)).toBe(before);
  });
});
