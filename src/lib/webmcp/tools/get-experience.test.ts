// get_experience: one role by id with every bullet, the era line, dates and link.
import { describe, expect, it } from 'vitest';

import { buildProfileData } from '@/lib/webmcp/profile-data';
import { getExperience } from '@/lib/webmcp/tools/get-experience';

const data = buildProfileData();
const first = data.experience[0];
if (!first) throw new Error('profile data has no experience');

describe('get_experience', () => {
  it('declares a required string id and no extra properties', () => {
    expect(getExperience.name).toBe('get_experience');
    expect(getExperience.inputSchema.type).toBe('object');
    expect(getExperience.inputSchema.properties.id?.type).toBe('string');
    expect(getExperience.inputSchema.required).toEqual(['id']);
    expect(getExperience.inputSchema.additionalProperties).toBe(false);
  });

  it('returns the full entry for every id, copied field for field', () => {
    for (const entry of data.experience) {
      const result = getExperience.handler(data, { id: entry.id });
      expect(result.isError).toBeUndefined();
      expect(result.structuredContent).toEqual({ experience: entry });
    }
  });

  it('carries the text as the JSON of the structured content', () => {
    const result = getExperience.handler(data, { id: first.id });
    expect(result.content[0].text).toBe(JSON.stringify(result.structuredContent));
  });

  it('fails on an unknown id and lists the valid ids', () => {
    const result = getExperience.handler(data, { id: 'nope' });
    expect(result.isError).toBe(true);
    expect(result.structuredContent).toBeUndefined();
    const ids = data.experience.map(entry => entry.id).join(', ');
    expect(result.content[0].text).toBe(`Unknown experience id "nope". Valid ids: ${ids}`);
  });

  it('fails on a missing, blank or non-string id without throwing', () => {
    const ids = data.experience.map(entry => entry.id).join(', ');
    for (const input of [{}, { id: '' }, { id: 3 }, undefined]) {
      const result = getExperience.handler(data, input as never);
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe(`Missing id. Valid ids: ${ids}`);
    }
  });

  it('returns a copy: mutating the result leaves the data and later calls untouched', () => {
    const before = JSON.stringify(data);
    const result = getExperience.handler(data, { id: first.id });
    const entry = (result.structuredContent as { experience: { link?: object; bullets: object[] } })
      .experience;
    expect(entry).not.toBe(first);
    expect(entry.bullets[0]).not.toBe(first.bullets[0]);
    if (first.link) expect(entry.link).not.toBe(first.link);
    entry.bullets.length = 0;
    expect(JSON.stringify(data)).toBe(before);
  });

  it('does not mutate the profile data', () => {
    const before = JSON.stringify(data);
    getExperience.handler(data, { id: first.id });
    getExperience.handler(data, { id: 'nope' });
    expect(JSON.stringify(data)).toBe(before);
  });
});
