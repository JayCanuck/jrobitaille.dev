// list_experience: every role newest first without bullets, as JSON text and structured content.
import { describe, expect, it } from 'vitest';

import { buildProfileData } from '@/lib/webmcp/profile-data';
import { EMPTY_INPUT } from './types';
import { listExperience } from './list-experience';

const data = buildProfileData();
const FIELDS = ['desc', 'employer', 'id', 'name', 'title', 'years'];

describe('listExperience', () => {
  it('declares the name, the exact description and an empty input schema', () => {
    expect(listExperience.name).toBe('list_experience');
    expect(listExperience.description).toBe(
      'Every role newest first, without bullets: id, employer, title, name, years, desc. Use get_experience with an id for the full detail.'
    );
    expect(listExperience.inputSchema).toEqual(EMPTY_INPUT);
  });

  it('lists roles newest first: start years never increase down the list', () => {
    const result = listExperience.handler(data, {});
    const list = (result.structuredContent as { experience: { years: string }[] }).experience;
    const starts = list.map(entry => Number(/\d{4}/.exec(entry.years)?.[0]));
    expect(starts.every(year => year > 2000)).toBe(true);
    for (let i = 1; i < starts.length; i++) {
      expect(starts[i]).toBeLessThanOrEqual(starts[i - 1] ?? 0);
    }
  });

  it('returns every role in data order with exactly the listed fields', () => {
    const result = listExperience.handler(data, {});
    expect(result.isError).toBeUndefined();
    const list = (result.structuredContent as { experience: Record<string, unknown>[] }).experience;
    expect(list.map(entry => entry.id)).toEqual(data.experience.map(entry => entry.id));
    for (const entry of list) expect(Object.keys(entry).sort()).toEqual(FIELDS);
  });

  it('copies each field unchanged and leaves out bullets, dates and links', () => {
    const result = listExperience.handler(data, {});
    const list = (result.structuredContent as { experience: Record<string, unknown>[] }).experience;
    data.experience.forEach((source, index) => {
      expect(list[index]).toEqual({
        id: source.id,
        employer: source.employer,
        title: source.title,
        name: source.name,
        years: source.years,
        desc: source.desc
      });
    });
  });

  it('puts the same value in the text as in the structured content, without mutating data', () => {
    const before = JSON.stringify(data);
    const result = listExperience.handler(data, {});
    expect(JSON.parse(result.content[0].text)).toEqual(result.structuredContent);
    expect(JSON.stringify(data)).toBe(before);
  });
});
