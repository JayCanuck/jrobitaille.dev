// The agent-facing data (D12, D17): everything the resume holds, built from the content files at
// build time, with the same public-content guard the content itself passes.
import { describe, expect, it } from 'vitest';

import { earlier, employer } from '@/content/experience';
import { projects } from '@/content/projects';
import { availability, education, openSource, profile, skills, summary } from '@/content/resume';
import { bulletText } from '@/content/schema';
import { buildProfileData } from '@/lib/webmcp/profile-data';
import { siteUrl } from '@/lib/site';

const data = buildProfileData();
const eras = employer.titles.flatMap(title => title.eras);

const collectStrings = (value: unknown, out: string[] = []): string[] => {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) for (const item of value) collectStrings(item, out);
  else if (value && typeof value === 'object')
    for (const item of Object.values(value)) collectStrings(item, out);
  return out;
};

describe('buildProfileData', () => {
  it('carries the identity, the summary and the first three About paragraphs only', () => {
    expect(data.name).toBe(profile.name);
    expect(data.title).toBe(profile.title);
    expect(data.headline).toBe(profile.headline);
    expect(data.summary).toBe(summary);
    expect(data.about).toEqual(profile.aboutLong.slice(0, 3));
    expect(data.about).toHaveLength(3);
    expect(JSON.stringify(data)).not.toContain(profile.aboutLong[3]);
  });

  it('states availability as structured data sourced from the content', () => {
    expect(data.availability).toEqual(availability);
    expect(data.availability.open).toBe(true);
    expect(data.availability.roles.length).toBeGreaterThan(0);
  });

  it('lists every era and earlier role newest first with every bullet', () => {
    expect(data.experience.map(entry => entry.id)).toEqual([
      ...eras.map(era => era.id),
      ...earlier.map(role => role.id)
    ]);
    for (const era of eras) {
      const entry = data.experience.find(candidate => candidate.id === era.id);
      expect(entry?.employer).toBe(employer.name);
      expect(entry?.bullets.map(bullet => bullet.text)).toEqual(era.bullets.map(bulletText));
    }
    for (const role of earlier) {
      const entry = data.experience.find(candidate => candidate.id === role.id);
      expect(entry?.employer).toBe(role.org);
      expect(entry?.title).toBe(role.role);
      expect(entry?.bullets.map(bullet => bullet.text)).toEqual(role.bullets.map(bulletText));
    }
  });

  it('keeps the title ladder, bullet references and era links', () => {
    const titleOf = (id: string) =>
      employer.titles.find(title => title.eras.some(era => era.id === id))?.title;
    for (const era of eras) {
      expect(data.experience.find(entry => entry.id === era.id)?.title).toBe(titleOf(era.id));
    }
    const referenced = earlier.flatMap(role =>
      role.bullets.flatMap(bullet => (typeof bullet === 'string' ? [] : [bullet.reference]))
    );
    expect(referenced.length).toBeGreaterThan(0);
    const references = data.experience.flatMap(entry =>
      entry.bullets.flatMap(bullet => (bullet.reference ? [bullet.reference] : []))
    );
    expect(references).toEqual(expect.arrayContaining(referenced));
    for (const era of eras.filter(candidate => candidate.link)) {
      expect(data.experience.find(entry => entry.id === era.id)?.link).toEqual(era.link);
    }
  });

  it('carries the projects, skills, open source and education in full', () => {
    expect(data.projects.map(project => project.slug)).toEqual(projects.map(p => p.slug));
    for (const project of projects) {
      const entry = data.projects.find(candidate => candidate.slug === project.slug);
      expect(entry).toMatchObject({
        title: project.title,
        era: project.era,
        blurb: project.blurb,
        description: project.description,
        link: project.link
      });
      expect(entry?.secondaryLink).toEqual(project.secondaryLink);
      expect(entry).not.toHaveProperty('image');
    }
    expect(data.skills).toEqual(skills);
    expect(data.openSource).toEqual(openSource);
    expect(data.education).toBe(education);
  });

  it('exposes exactly the public contact details and an absolute resume URL', () => {
    expect(Object.keys(data.contact).sort()).toEqual(
      ['email', 'github', 'linkedin', 'location', 'npm'].sort()
    );
    expect(data.contact.email).toBe(profile.email);
    expect(data.contact.linkedin).toBe(profile.links.linkedin);
    expect(data.contact.github).toBe(profile.links.github);
    expect(data.contact.npm).toBe(profile.links.npm);
    expect(data.contact.location).toBe(profile.location);
    expect(data.resumeUrl).toBe(`${siteUrl}${profile.links.resume}`);
    expect(data.url).toBe(siteUrl);
  });

  it('passes the public-content guard: no phone number, no street address', () => {
    const strings = collectStrings(data);
    expect(strings.length).toBeGreaterThan(50);
    for (const text of strings) {
      expect(text).not.toMatch(/\(?\d{3}\)?[ .-]?\d{3}[ .-]?\d{4}/);
      expect(text).not.toMatch(
        /\b\d{2,5} [A-Z][a-z]+ (St|Street|Ave|Avenue|Rd|Road|Dr|Drive|Blvd|Way|Ct|Ln)\b/
      );
    }
  });

  it('is plain JSON: serialises and parses back to the same value', () => {
    expect(JSON.parse(JSON.stringify(data))).toEqual(data);
  });
});
