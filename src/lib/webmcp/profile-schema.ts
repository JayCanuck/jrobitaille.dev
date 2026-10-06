// Schema of the agent-facing data (D17), composed from the content schemas and converted to JSON
// Schema at build time for /api/profile.schema.json and the tools' output schemas. Build-time only:
// nothing under src/lib/webmcp/tools imports this file, so zod never reaches the browser.
import { z } from 'zod';

import {
  availabilitySchema,
  hrefSchema,
  linkSchema,
  openSourceSchema,
  skillsSchema
} from '@/content/schema';

const bulletSchema = z.object({
  text: z.string().min(1),
  reference: hrefSchema.optional()
});

const experienceEntrySchema = z.object({
  id: z.string().min(1),
  employer: z.string().min(1),
  title: z.string().min(1),
  name: z.string().min(1),
  years: z.string().min(1),
  dates: z.string().min(1),
  desc: z.string().min(1),
  line: z.string().min(1).optional(),
  bullets: z.array(bulletSchema).min(1),
  link: linkSchema.optional()
});

const projectEntrySchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  era: z.string().min(1),
  blurb: z.string().min(1),
  description: z.string().min(1),
  link: linkSchema,
  secondaryLink: linkSchema.optional()
});

// Public contact only (content.md): the strict object rejects any extra field such as a phone.
const contactSchema = z.strictObject({
  email: z.email(),
  linkedin: z.url(),
  github: z.url(),
  npm: z.url(),
  location: z.string().min(1)
});

export const profileDataSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  headline: z.string().min(1),
  location: z.string().min(1),
  url: z.url(),
  summary: z.string().min(1),
  about: z.array(z.string().min(1)).min(1).max(3),
  availability: availabilitySchema,
  skills: skillsSchema,
  experience: z.array(experienceEntrySchema).min(1),
  projects: z.array(projectEntrySchema).min(1),
  openSource: openSourceSchema,
  education: z.string().min(1),
  contact: contactSchema,
  resumeUrl: z.url()
});

export const profileJsonSchema = z.toJSONSchema(profileDataSchema);
