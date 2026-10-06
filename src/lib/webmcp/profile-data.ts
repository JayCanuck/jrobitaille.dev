// The agent-facing data (D12, D17): the full approved resume content, built from src/content at
// build time for /api/profile.json and the WebMCP tools. Pure: content in, plain JSON out. The
// fourth About paragraph stays out; availability is the structured entry instead.
import { earlier, employer } from '@/content/experience';
import { projects } from '@/content/projects';
import { availability, education, openSource, profile, skills, summary } from '@/content/resume';
import type { Bullet } from '@/content/schema';
import { siteUrl } from '@/lib/site';

const ABOUT_PARAGRAPHS = 3;

const toBullet = (bullet: Bullet) =>
  typeof bullet === 'string'
    ? { text: bullet }
    : { text: bullet.text, reference: bullet.reference };

const experience = () => [
  ...employer.titles.flatMap(title =>
    title.eras.map(era => ({
      id: era.id,
      employer: employer.name,
      title: title.title,
      name: era.name,
      years: era.years,
      dates: title.dates,
      desc: era.desc,
      line: era.line,
      bullets: era.bullets.map(toBullet),
      ...(era.link && { link: era.link })
    }))
  ),
  ...earlier.map(role => ({
    id: role.id,
    employer: role.org,
    title: role.role,
    name: role.era,
    years: role.years,
    dates: role.dates,
    desc: role.desc,
    bullets: role.bullets.map(toBullet),
    ...(role.link && { link: role.link })
  }))
];

export const buildProfileData = () => ({
  name: profile.name,
  title: profile.title,
  headline: profile.headline,
  location: profile.location,
  url: siteUrl,
  summary,
  about: profile.aboutLong.slice(0, ABOUT_PARAGRAPHS),
  availability,
  skills,
  experience: experience(),
  projects: projects.map(project => ({
    slug: project.slug,
    title: project.title,
    era: project.era,
    blurb: project.blurb,
    description: project.description,
    link: project.link,
    ...(project.secondaryLink && { secondaryLink: project.secondaryLink })
  })),
  openSource,
  education,
  contact: {
    email: profile.email,
    linkedin: profile.links.linkedin,
    github: profile.links.github,
    npm: profile.links.npm,
    location: profile.location
  },
  resumeUrl: `${siteUrl}${profile.links.resume}`
});

export type ProfileData = ReturnType<typeof buildProfileData>;
