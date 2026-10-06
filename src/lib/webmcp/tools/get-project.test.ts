// get_project: one project entry by slug, or a failure that lists the valid slugs.
import { describe, expect, it } from 'vitest';

import { buildProfileData } from '@/lib/webmcp/profile-data';
import { getProject } from '@/lib/webmcp/tools/get-project';

const data = buildProfileData();
const first = data.projects[0];

describe('get_project', () => {
  it('requires a string slug and nothing else', () => {
    expect(getProject.name).toBe('get_project');
    expect(getProject.inputSchema.required).toEqual(['slug']);
    expect(getProject.inputSchema.properties.slug?.type).toBe('string');
    expect(getProject.inputSchema.additionalProperties).toBe(false);
  });

  it('returns the full project entry for every known slug', () => {
    for (const project of data.projects) {
      const result = getProject.handler(data, { slug: project.slug });
      expect(result.isError).toBeUndefined();
      expect(result.structuredContent).toEqual({ project });
    }
  });

  it('copies the listed fields and the text equals the JSON of structuredContent', () => {
    if (!first) throw new Error('no projects');
    const result = getProject.handler(data, { slug: first.slug });
    const project = (result.structuredContent as { project: Record<string, unknown> }).project;
    expect(Object.keys(project).sort()).toEqual(Object.keys(first).sort());
    expect(project).not.toBe(first);
    expect(result.content[0].text).toBe(JSON.stringify(result.structuredContent));
  });

  it('leaves secondaryLink out, not undefined, when a project has none', () => {
    if (!first) throw new Error('no projects');
    const { secondaryLink: _dropped, ...without } = first;
    const fixture = { ...data, projects: [without] };
    const result = getProject.handler(fixture, { slug: first.slug });
    const project = (result.structuredContent as { project: Record<string, unknown> }).project;
    expect('secondaryLink' in project).toBe(false);
    expect(JSON.parse(result.content[0].text)).toEqual(result.structuredContent);
    expect(_dropped).toBeDefined();
  });

  it('returns copies of the nested link objects', () => {
    if (!first) throw new Error('no projects');
    const result = getProject.handler(data, { slug: first.slug });
    const project = (result.structuredContent as { project: { link: object } }).project;
    expect(project.link).toEqual(first.link);
    expect(project.link).not.toBe(first.link);
  });

  it('fails on a missing, blank or non-string slug without throwing', () => {
    for (const input of [{}, { slug: '' }, { slug: 1 }, undefined]) {
      const result = getProject.handler(data, input as never);
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toMatch(/^Missing slug\. Valid slugs: /);
    }
  });

  it('fails on an unknown slug and lists the valid slugs', () => {
    const result = getProject.handler(data, { slug: 'no-such-project' });
    expect(result.isError).toBe(true);
    expect(result.structuredContent).toBeUndefined();
    for (const project of data.projects) expect(result.content[0].text).toContain(project.slug);
  });
});
