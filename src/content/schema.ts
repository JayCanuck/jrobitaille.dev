// Content schema: every public string on the site is typed here and validated in schema.test.ts.
import { z } from 'zod';

// Public, live proof only: https or a site-relative path (content.md).
const hrefSchema = z.string().regex(/^(https:\/\/\S+|\/\S*)$/, 'https URL or site-relative path');

const linkSchema = z.object({
  label: z.string().min(1),
  href: hrefSchema
});

// Fixed 16:10 slot so a Phase 3 screenshot cannot shift layout (CLS budget 0).
export const imageSchema = z
  .object({
    src: hrefSchema,
    alt: z.string(),
    width: z.int().positive(),
    height: z.int().positive()
  })
  .refine(image => image.width * 10 === image.height * 16, 'image must be 16:10');

// Bullet IDs trace each sentence to the master resume (RV, SM, SW, SR, SE, PRE) or a locked LinkedIn
// position (LI-<position>-<n>) so a claim is never introduced without a source.
const bulletSchema = z.object({
  id: z.string().regex(/^(RV|SM|SW|SR|SE|PRE|LI)-[A-Z0-9]+(-\d+)?$/),
  text: z.string().min(1)
});

const eraSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    start: z.int().min(2009),
    end: z.int().min(2009),
    rail: z.string().min(1),
    employer: z.string().min(1),
    descriptor: z.string().min(1),
    bullets: z.array(bulletSchema).min(1).max(2),
    link: linkSchema.optional()
  })
  .refine(era => era.end >= era.start, 'era ends after it starts');

export const experienceSchema = z
  .array(eraSchema)
  .min(1)
  .refine(
    eras => eras.every((era, i) => i === 0 || (eras[i - 1]?.start ?? 0) >= era.start),
    'eras are newest first'
  );

const skillGroupSchema = z.object({
  name: z.string().min(1),
  terms: z.array(z.string().min(1)).min(1)
});

export const skillsSchema = z.array(skillGroupSchema).length(5);

export const profileSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  headline: z.string().min(1),
  location: z.string().min(1),
  availability: z.string().min(1),
  email: z.email(),
  links: z.object({
    resume: hrefSchema,
    linkedin: z.url(),
    github: z.url(),
    npm: z.url()
  }),
  about: z.array(z.string().min(1)).min(1)
});

const sentenceCount = (text: string) => (text.match(/[.!?](?=\s|$)/g) ?? []).length;

const projectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  era: z.string().min(1),
  blurb: z
    .string()
    .min(1)
    .refine(text => sentenceCount(text) >= 1 && sentenceCount(text) <= 2, 'one or two sentences'),
  link: linkSchema,
  secondaryLink: linkSchema.optional(),
  image: imageSchema.optional()
});

export const projectsSchema = z
  .array(projectSchema)
  .length(5)
  .refine(
    projects => new Set(projects.map(project => project.slug)).size === projects.length,
    'slugs are unique'
  );

export type Era = z.infer<typeof eraSchema>;
export type SkillGroup = z.infer<typeof skillGroupSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type Project = z.infer<typeof projectSchema>;
