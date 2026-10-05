// The real content must satisfy the zod schema; structural rules (order, counts) live here too (tdd.md).
import { describe, expect, it } from 'vitest';

import { experience } from '@/content/experience';
import { projects } from '@/content/projects';
import { profile, skills } from '@/content/resume';
import {
  experienceSchema,
  imageSchema,
  profileSchema,
  projectsSchema,
  skillsSchema
} from '@/content/schema';

const issuesOf = (result: { success: boolean; error?: { issues: unknown[] } }) =>
  result.success ? [] : (result.error?.issues ?? ['unknown failure']);

describe('content parses against the schema', () => {
  it('profile', () => {
    expect(issuesOf(profileSchema.safeParse(profile))).toEqual([]);
  });

  it('skills', () => {
    expect(issuesOf(skillsSchema.safeParse(skills))).toEqual([]);
  });

  it('experience', () => {
    expect(issuesOf(experienceSchema.safeParse(experience))).toEqual([]);
  });

  it('projects', () => {
    expect(issuesOf(projectsSchema.safeParse(projects))).toEqual([]);
  });
});

describe('experience timeline', () => {
  it('has one node per era, newest first', () => {
    expect(experience).toHaveLength(7);
    const starts = experience.map(era => era.start);
    expect(starts).toEqual([...starts].sort((a, b) => b - a));
  });

  it('keeps every node to at most two bullets', () => {
    for (const era of experience) {
      expect(era.bullets.length).toBeGreaterThanOrEqual(1);
      expect(era.bullets.length).toBeLessThanOrEqual(2);
    }
  });

  it('uses the LinkedIn rail label for Canuck Coding', () => {
    const canuck = experience.find(era => era.name === 'Canuck Coding');
    expect(canuck?.rail).toBe('Software Developer (self-employed)');
  });
});

describe('project cards', () => {
  it('has exactly five cards with unique slugs and a proof link each', () => {
    expect(projects).toHaveLength(5);
    expect(new Set(projects.map(project => project.slug)).size).toBe(5);
    for (const project of projects) expect(project.link.href).toMatch(/^https:\/\//);
  });

  it('keeps every blurb to one or two sentences', () => {
    for (const project of projects) {
      const sentences = project.blurb.match(/[.!?](?=\s|$)/g) ?? [];
      expect(sentences.length).toBeGreaterThanOrEqual(1);
      expect(sentences.length).toBeLessThanOrEqual(2);
    }
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
