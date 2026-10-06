// /llms.txt is generated from the content (D17): the page sections, the resume, the JSON and its
// schema, and the WebMCP tool names, so it can never drift from what ships.
import { describe, expect, it } from 'vitest';

import { profile } from '@/content/resume';
import { siteCopy } from '@/content/site';
import { buildLlmsText } from '@/lib/llms';
import { tools } from '@/lib/webmcp/tools';

const text = buildLlmsText();

describe('buildLlmsText', () => {
  it('opens with the site name and the meta description', () => {
    expect(text.startsWith('# jrobitaille.dev\n')).toBe(true);
    expect(text).toContain(`> ${profile.metaDescription}`);
  });

  it('points at every page section by anchor with its heading', () => {
    for (const [id, heading] of Object.entries(siteCopy.headings)) {
      expect(text).toContain(`/#${id}`);
      expect(text).toContain(heading);
    }
  });

  it('points at the resume, the JSON, its schema and names every tool', () => {
    for (const path of [
      '/resume.pdf',
      '/api/profile.json',
      '/api/profile.schema.json',
      '/opengraph-image'
    ]) {
      expect(text).toContain(path);
    }
    for (const tool of tools) expect(text).toContain(tool.name);
  });

  it('carries the public contact only and ends with a newline', () => {
    expect(text).toContain(profile.email);
    expect(text).toContain(profile.links.linkedin);
    expect(text).toContain(profile.links.github);
    expect(text).not.toMatch(/\(?\d{3}\)?[ .-]?\d{3}[ .-]?\d{4}/);
    expect(text.endsWith('\n')).toBe(true);
    expect(text).not.toContain(profile.aboutLong[3]);
  });
});
