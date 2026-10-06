// The eight read-only tools as one list (spec §7): unique names, object input schemas, every
// handler answers the real content, and nothing under tools/ imports zod (it must not ship).
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { buildProfileData } from '@/lib/webmcp/profile-data';
import { callTool, tools } from '@/lib/webmcp/tools';

const data = buildProfileData();
const dir = new URL('./', import.meta.url);

describe('tools', () => {
  it('are the eight read-only tools from the spec, in order', () => {
    expect(tools.map(tool => tool.name)).toEqual([
      'get_profile',
      'list_experience',
      'get_experience',
      'list_projects',
      'get_project',
      'get_skills',
      'get_contact',
      'get_resume_url'
    ]);
  });

  it('describe themselves and take an object input with no extra properties', () => {
    for (const tool of tools) {
      expect(tool.description.length).toBeGreaterThan(20);
      expect(tool.inputSchema.type).toBe('object');
      expect(tool.inputSchema.additionalProperties).toBe(false);
      for (const property of Object.values(tool.inputSchema.properties)) {
        expect(property.description.length).toBeGreaterThan(0);
      }
    }
  });

  it('every tool answers the real content with text and structured content', () => {
    const sample: Record<string, Record<string, string>> = {
      get_experience: { id: data.experience[0]?.id ?? '' },
      get_project: { slug: data.projects[0]?.slug ?? '' }
    };
    for (const tool of tools) {
      const result = (tool.handler as (d: typeof data, i: Record<string, string>) => unknown)(
        data,
        sample[tool.name] ?? {}
      ) as {
        content: { type: string; text: string }[];
        structuredContent?: unknown;
        isError?: boolean;
      };
      expect(result.isError).toBeFalsy();
      expect(result.content[0]?.type).toBe('text');
      expect(JSON.parse(result.content[0]?.text ?? '')).toEqual(result.structuredContent);
    }
  });

  it('return copies: mutating a result changes neither the data nor the next call', () => {
    const before = JSON.stringify(data);
    const sample: Record<string, Record<string, string>> = {
      get_experience: { id: data.experience[0]?.id ?? '' },
      get_project: { slug: data.projects[0]?.slug ?? '' }
    };
    const wreck = (value: unknown) => {
      if (Array.isArray(value)) value.length = 0;
      else if (value && typeof value === 'object') {
        for (const key of Object.keys(value)) {
          wreck((value as Record<string, unknown>)[key]);
          Reflect.deleteProperty(value, key);
        }
      }
    };
    for (const tool of tools) {
      const first = callTool(tool, data, sample[tool.name] ?? {});
      wreck(first.structuredContent);
      const second = callTool(tool, data, sample[tool.name] ?? {});
      expect(second.content[0].text, tool.name).toBe(first.content[0].text);
    }
    expect(JSON.stringify(data)).toBe(before);
  });

  it('callTool turns a throwing handler into a failure result', () => {
    const broken = {
      name: 'broken',
      description: 'throws',
      inputSchema: tools[0]?.inputSchema ?? {
        type: 'object',
        properties: {},
        additionalProperties: false
      },
      handler: () => {
        throw new Error('boom');
      }
    } as (typeof tools)[number];
    const result = callTool(broken, data, {});
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('broken failed: boom');
  });

  it('never import zod or the content schemas, and import the data as a type only', () => {
    // Tests run in node and build the real data; only shipped modules are checked.
    const shipped = readdirSync(dir).filter(
      file => file.endsWith('.ts') && !file.endsWith('.test.ts')
    );
    expect(shipped.length).toBeGreaterThanOrEqual(10);
    for (const name of shipped) {
      const source = readFileSync(new URL(name, dir), 'utf8');
      expect(source, name).not.toMatch(/['"]zod['"]/);
      expect(source, name).not.toMatch(/content\/schema['"]/);
      expect(source, name).not.toMatch(/profile-schema['"]/);
      expect(source, name).not.toMatch(/^import (?!type )[^;]*profile-data['"]/m);
      expect(source, name).not.toMatch(/import\(/);
    }
  });
});
