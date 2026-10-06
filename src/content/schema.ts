// Content schema: every public string on the site is typed here and validated in schema.test.ts.
// Two layers (D12, D13): the full agent-facing data (bullets, summary, open source, education, the
// long About, card descriptions) and the page layer (short About, highlights, one-line blurbs),
// which is all the home page renders.
import { z } from 'zod';

// Public, live proof only: https or a site-relative path (content.md).
export const hrefSchema = z
  .string()
  .regex(/^(https:\/\/\S+|\/\S*)$/, 'https URL or site-relative path');

export const linkSchema = z.object({
  label: z.string().min(1),
  href: hrefSchema
});

// Fixed 16:10 slot so a Phase 3 screenshot cannot shift layout (CLS budget 0).
export const imageSchema = z
  .object({
    src: hrefSchema,
    alt: z.string(),
    width: z.int().positive(),
    height: z.int().positive(),
    // Extra rendered widths (same aspect) for a srcset, e.g. the full-width cover band.
    widths: z.array(z.int().positive()).optional()
  })
  .refine(image => image.width * 10 === image.height * 16, 'image must be 16:10');

// Resume bullets in resume order, approved resume content; a bullet may carry a public reference.
const bulletSchema = z.union([
  z.string().min(1),
  z.object({ text: z.string().min(1), reference: hrefSchema })
]);
const bulletsSchema = z.array(bulletSchema).min(1);

export type Bullet = z.infer<typeof bulletSchema>;
export const bulletText = (bullet: Bullet) => (typeof bullet === 'string' ? bullet : bullet.text);

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

// One rung of the title ladder; its rail label is shown where the title changes.
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
  // Era node name under the employer heading and title label, mirroring the LG block (D14).
  era: z.string().min(1),
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

export const openSourceSchema = z.array(z.string().min(1)).min(1);

const skillGroupSchema = z.object({
  name: z.string().min(1),
  terms: z.array(z.string().min(1)).min(1)
});

export const skillsSchema = z.array(skillGroupSchema).length(5);

// Structured availability for the agent-facing data only (D17); the page says it in prose.
export const availabilitySchema = z.object({
  open: z.boolean(),
  roles: z.array(z.string().min(1)).min(1),
  location: z.string().min(1)
});

export const profileSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  headline: z.string().min(1),
  location: z.string().min(1),
  availability: z.string().min(1),
  email: z.email(),
  metaDescription: z.string().min(1).max(160),
  links: z.object({
    resume: hrefSchema,
    linkedin: z.url(),
    github: z.url(),
    npm: z.url()
  }),
  // Short About for the page; the long form is agent-facing data (D13).
  about: z.array(z.string().min(1)).min(1).max(2),
  aboutLong: z.array(z.string().min(1)).min(1)
});

// One line per card (D13): hard cap 100 characters.
export const BLURB_MAX_LENGTH = 100;

const projectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  era: z.string().min(1),
  blurb: z.string().min(1).max(BLURB_MAX_LENGTH),
  description: z.string().min(1),
  link: linkSchema,
  secondaryLink: linkSchema.optional(),
  image: imageSchema.optional()
});

export const projectsSchema = z
  .array(projectSchema)
  .length(6)
  .refine(
    projects => new Set(projects.map(project => project.slug)).size === projects.length,
    'slugs are unique'
  );

// Site chrome: section headings may carry voice; the tagline and footer line are optional slots
// that render no element while empty (D14).
export const siteCopySchema = z.object({
  headings: z.object({
    about: z.string().min(1),
    work: z.string().min(1),
    experience: z.string().min(1),
    skills: z.string().min(1)
  }),
  tagline: z.string(),
  footerLine: z.string(),
  // The agent-tools badge and its popover (D17), rendered only after WebMCP registration succeeds.
  agentTools: z.object({
    badge: z.string().min(1),
    explain: z.string().min(1)
  }),
  notFound: z.object({
    title: z.string().min(1),
    body: z.string().min(1),
    home: z.string().min(1)
  })
});

export type SiteImage = z.infer<typeof imageSchema>;
export type SiteCopy = z.infer<typeof siteCopySchema>;
export type Link = z.infer<typeof linkSchema>;
export type Employer = z.infer<typeof employerSchema>;
export type EarlierRole = z.infer<typeof earlierRoleSchema>;
export type SkillGroup = z.infer<typeof skillGroupSchema>;
export type Availability = z.infer<typeof availabilitySchema>;
export type Profile = z.infer<typeof profileSchema>;
export type Project = z.infer<typeof projectSchema>;
