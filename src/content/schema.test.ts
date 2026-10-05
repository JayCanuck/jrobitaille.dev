// The real content must satisfy the zod schema; structural rules (order, counts, highlights) live
// here too (tdd.md, D12, D13).
import { describe, expect, it } from 'vitest';

import { earlier, employer } from '@/content/experience';
import { projects } from '@/content/projects';
import { images } from '@/content/images';
import { education, openSource, profile, skills, summary } from '@/content/resume';
import {
  BLURB_MAX_LENGTH,
  bulletText,
  earlierRolesSchema,
  employerSchema,
  imageSchema,
  openSourceSchema,
  profileSchema,
  projectsSchema,
  siteCopySchema,
  skillsSchema
} from '@/content/schema';
import { siteCopy } from '@/content/site';

const issuesOf = (result: { success: boolean; error?: { issues: unknown[] } }) =>
  result.success ? [] : (result.error?.issues ?? ['unknown failure']);

const eras = employer.titles.flatMap(title => title.eras);
const timelineNodes = [...eras, ...earlier];

describe('content parses against the schema', () => {
  it('profile', () => {
    expect(issuesOf(profileSchema.safeParse(profile))).toEqual([]);
  });

  it('skills', () => {
    expect(issuesOf(skillsSchema.safeParse(skills))).toEqual([]);
  });

  it('employer with the title ladder', () => {
    expect(issuesOf(employerSchema.safeParse(employer))).toEqual([]);
  });

  it('earlier roles', () => {
    expect(issuesOf(earlierRolesSchema.safeParse(earlier))).toEqual([]);
  });

  it('open source', () => {
    expect(issuesOf(openSourceSchema.safeParse(openSource))).toEqual([]);
  });

  it('projects', () => {
    expect(issuesOf(projectsSchema.safeParse(projects))).toEqual([]);
  });

  it('summary and education are non-empty strings', () => {
    expect(summary.length).toBeGreaterThan(0);
    expect(education.length).toBeGreaterThan(0);
  });

  it('site copy', () => {
    expect(issuesOf(siteCopySchema.safeParse(siteCopy))).toEqual([]);
  });

  it('generated images carry explicit dimensions and a 16:10 card slot where used', () => {
    for (const image of Object.values(images)) {
      expect(image.width).toBeGreaterThan(0);
      expect(image.height).toBeGreaterThan(0);
    }
    for (const project of projects) {
      if (project.image) expect(issuesOf(imageSchema.safeParse(project.image))).toEqual([]);
    }
  });
});

describe('timeline blocks share one order (D14)', () => {
  it('gives every earlier role an era name distinct from its employer', () => {
    for (const role of earlier) {
      expect(role.era.length).toBeGreaterThan(0);
      expect(role.era).not.toBe(role.org);
    }
  });
});

describe('web copy sized for the page (D13)', () => {
  it('About is two short paragraphs with the long form kept for agents', () => {
    expect(profile.about).toHaveLength(2);
    expect(profile.aboutLong).toHaveLength(4);
    expect(profile.metaDescription.length).toBeLessThanOrEqual(160);
  });

  it('every card blurb is one line within the cap and keeps a longer description', () => {
    for (const project of projects) {
      expect(project.blurb.length).toBeLessThanOrEqual(BLURB_MAX_LENGTH);
      expect(project.description.length).toBeGreaterThan(project.blurb.length);
    }
  });

  it('keeps the webOS.js reference on its bullet in the agent-facing data', () => {
    const experis = earlier.find(role => role.org === 'Experis IT');
    const bullet = experis?.bullets.find(item => bulletText(item).startsWith('Wrote webOS.js'));
    expect(bullet).toMatchObject({
      reference: 'https://webostv.developer.lge.com/develop/references/webostvjs-webos'
    });
  });
});

describe('agent-facing data', () => {
  it('keeps the full experience detail: bullets per era and four open source entries', () => {
    const bulletCounts = Object.fromEntries(
      timelineNodes.map(node => [node.id, node.bullets.length])
    );
    expect(bulletCounts).toEqual({ RV: 6, SM: 4, SW: 2, SR: 4, SE: 2, EXP: 1, CC: 1 });
    expect(openSource).toHaveLength(4);
  });

  it('keeps the title ladder newest first with full titles as rail labels', () => {
    expect(employer.titles.map(title => title.title)).toEqual([
      'Staff Software Engineer',
      'Senior Software Engineer',
      'Software Engineer'
    ]);
    for (const title of employer.titles) expect(title.rail).toBe(title.title);
    expect(eras.map(era => era.id)).toEqual(['RV', 'SM', 'SW', 'SR', 'SE']);
  });
});

describe('experience timeline', () => {
  it('gives every node one or two highlights under 140 characters', () => {
    expect(timelineNodes).toHaveLength(7);
    for (const node of timelineNodes) {
      expect(node.highlights.length).toBeGreaterThanOrEqual(1);
      expect(node.highlights.length).toBeLessThanOrEqual(2);
      for (const highlight of node.highlights) expect(highlight.length).toBeLessThan(140);
    }
  });

  it('gives Experis and Canuck Coding one highlight each', () => {
    for (const role of earlier) expect(role.highlights).toHaveLength(1);
  });

  it('uses the public profile rail label for Canuck Coding', () => {
    const canuck = earlier.find(role => role.org === 'Canuck Coding');
    expect(canuck?.rail).toBe('Software Developer (self-employed)');
  });

  it('links the RetailVerse era to the press release', () => {
    expect(eras[0]?.link?.href).toContain('lg.com/us/newsroom');
  });
});

describe('project cards', () => {
  it('has exactly five cards with unique slugs and a proof link each', () => {
    expect(projects).toHaveLength(5);
    expect(new Set(projects.map(project => project.slug)).size).toBe(5);
    for (const project of projects) expect(project.link.href).toMatch(/^https:\/\//);
  });

  it('links webOS homebrew to the two homebrew repositories', () => {
    const card = projects.find(project => project.slug === 'webos-homebrew');
    expect(card?.link.href).toBe('https://github.com/JayCanuck/webos-quick-install');
    expect(card?.secondaryLink?.href).toBe('https://github.com/JayCanuck/legacy-webos');
  });
});

describe('image slot', () => {
  it('accepts a 16:10 image', () => {
    const result = imageSchema.safeParse({ src: '/x.png', alt: 'x', width: 1200, height: 750 });
    expect(result.success).toBe(true);
  });

  it('rejects any other aspect ratio', () => {
    const result = imageSchema.safeParse({ src: '/x.png', alt: 'x', width: 1200, height: 800 });
    expect(result.success).toBe(false);
  });
});
