// The real content must satisfy the zod schema; structural rules (order, counts, highlights, the full
// [removed] bullet pool) live here too (tdd.md, D12).
import { describe, expect, it } from 'vitest';

import { earlier, employer } from '@/content/experience';
import { projects } from '@/content/projects';
import { education, openSource, profile, skills, summary } from '@/content/resume';
import {
  earlierRolesSchema,
  employerSchema,
  imageSchema,
  openSourceSchema,
  profileSchema,
  projectsSchema,
  skillsSchema
} from '@/content/schema';

// Every bullet id in the master resume [removed], minus excluded ([id]). Update when the resume changes.
const B14_BULLET_IDS = [
  '[id]',
  '[id]',
  '[id]',
  '[id]',
  '[id]',
  '[id]',
  '[id]',
  '[id]',
  '[id]',
  '[id]',
  '[id]',
  '[id]',
  '[id]',
  '[id]',
  '[id]',
  '[id]',
  '[id]',
  '[id]',
  '[id]',
  '[id]',
  '[id]',
  '[id]',
  '[id]',
  '[id]'
];

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
});

describe('agent-facing dataset mirrors the master resume [removed]', () => {
  it('carries every bullet id except excluded', () => {
    const ids = [
      ...timelineNodes.flatMap(node => node.bullets.map(bullet => bullet.id)),
      ...openSource.map(entry => entry.id)
    ];
    expect([...ids].sort()).toEqual([...B14_BULLET_IDS].sort());
    expect(ids).not.toContain('[id]');
  });

  it('keeps the title ladder newest first', () => {
    expect(employer.titles.map(title => title.title)).toEqual([
      'Staff Software Engineer',
      'Senior Software Engineer',
      'Software Engineer'
    ]);
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

  it('uses the LinkedIn rail label for Canuck Coding', () => {
    const canuck = earlier.find(role => role.org === 'Canuck Coding');
    expect(canuck?.rail).toBe('Software Developer (self-employed)');
  });
});

describe('project cards', () => {
  it('has exactly five cards with unique slugs and a proof link each', () => {
    expect(projects).toHaveLength(5);
    expect(new Set(projects.map(project => project.slug)).size).toBe(5);
    for (const project of projects) expect(project.link.href).toMatch(/^https:\/\//);
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
