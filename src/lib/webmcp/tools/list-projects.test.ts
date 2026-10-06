// list_projects: the selected projects in page order, without descriptions or links.
import { describe, expect, it } from 'vitest';

import { buildProfileData } from '@/lib/webmcp/profile-data';
import { listProjects } from '@/lib/webmcp/tools/list-projects';
import { EMPTY_INPUT } from '@/lib/webmcp/tools/types';

const data = buildProfileData();

describe('list_projects', () => {
  it('declares its name, the exact description and an empty input schema', () => {
    expect(listProjects.name).toBe('list_projects');
    expect(listProjects.description).toBe(
      'The selected projects in page order, without descriptions: slug, title, era, blurb. Use get_project with a slug for the detail and links.'
    );
    expect(listProjects.inputSchema).toEqual(EMPTY_INPUT);
  });

  it('returns every project in page order', () => {
    const result = listProjects.handler(data, {});
    const projects = result.structuredContent?.projects as { slug: string }[];
    expect(result.isError).toBeUndefined();
    expect(projects.map(project => project.slug)).toEqual(data.projects.map(p => p.slug));
    expect(projects.length).toBeGreaterThan(0);
  });

  it('copies only slug, title, era and blurb', () => {
    const result = listProjects.handler(data, {});
    const projects = result.structuredContent?.projects as Record<string, unknown>[];
    projects.forEach((project, index) => {
      const source = data.projects[index];
      expect(Object.keys(project).sort()).toEqual(['blurb', 'era', 'slug', 'title']);
      expect(project).toEqual({
        slug: source?.slug,
        title: source?.title,
        era: source?.era,
        blurb: source?.blurb
      });
    });
  });

  it('puts the same JSON in the text content and does not mutate the data', () => {
    const before = JSON.stringify(data);
    const result = listProjects.handler(data, {});
    expect(result.content[0].text).toBe(JSON.stringify(result.structuredContent));
    expect(JSON.stringify(data)).toBe(before);
  });
});
