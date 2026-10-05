// Content schema: every public string on the site is typed here and validated in schema.test.ts.
// Two layers (D12): the full agent-facing data (bullets, summary, open source, education) and the
// page layer (highlights, blurbs), which is all the home page renders in Phase 2.
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

// Resume bullets in resume order; each is approved resume content.
const bulletsSchema = z.array(z.string().min(1)).min(1);

// Page layer: one or two lines per timeline node, each under 140 characters.
const highlightsSchema = z.array(z.string().min(1).max(139)).min(1).max(2);

const eraSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  years: z.string().min(1),
  desc: z.string().min(1),
  line: z.string().min(1),
  bullets: bulletsSchema,
  highlights: highlightsSchema,
  link: linkSchema.optional()
});

// One rung of the title ladder; its rail label changes only when the title changes.
const titleSchema = z.object({
  title: z.string().min(1),
  rail: z.string().min(1),
  dates: z.string().min(1),
  eras: z.array(eraSchema).min(1)
});

export const employerSchema = z.object({
  name: z.string().min(1),
  dates: z.string().min(1),
  years: z.string().min(1),
  titles: z.array(titleSchema).min(1)
});

const earlierRoleSchema = z.object({
  id: z.string().min(1),
  org: z.string().min(1),
  role: z.string().min(1),
  rail: z.string().min(1),
  dates: z.string().min(1),
  years: z.string().min(1),
  desc: z.string().min(1),
  bullets: bulletsSchema,
  highlights: highlightsSchema,
  link: linkSchema.optional()
});

export const earlierRolesSchema = z.array(earlierRoleSchema).min(1);

export const openSourceSchema = bulletsSchema;

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
  // Plain approved sentences (D12). Ceiling is three: the @enact/cli blurb has three.
  blurb: z
    .string()
    .min(1)
    .refine(text => sentenceCount(text) >= 1 && sentenceCount(text) <= 3, 'one to three sentences'),
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

export type Link = z.infer<typeof linkSchema>;
export type Employer = z.infer<typeof employerSchema>;
export type EarlierRole = z.infer<typeof earlierRoleSchema>;
export type SkillGroup = z.infer<typeof skillGroupSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type Project = z.infer<typeof projectSchema>;
