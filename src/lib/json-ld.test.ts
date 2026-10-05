import { describe, expect, it } from 'vitest';

import { profile } from '@/content/resume';
import { personJsonLd, serializeJsonLd, webSiteJsonLd } from '@/lib/json-ld';
import { siteUrl } from '@/lib/site';

describe('personJsonLd', () => {
  const person = personJsonLd(profile);

  it('describes a schema.org Person with the public identity only', () => {
    expect(person).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Jason Robitaille',
      jobTitle: 'Staff Software Engineer',
      url: siteUrl,
      email: 'jason.aj.robitaille@gmail.com'
    });
    expect(person.sameAs).toEqual([
      profile.links.linkedin,
      profile.links.github,
      profile.links.npm
    ]);
  });

  it('carries locality and region but no street address', () => {
    expect(person.address).toEqual({
      '@type': 'PostalAddress',
      addressLocality: 'Mountain View',
      addressRegion: 'CA'
    });
  });
});

describe('webSiteJsonLd', () => {
  it('names the site and points at its URL', () => {
    expect(webSiteJsonLd(profile)).toEqual({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Jason Robitaille',
      url: siteUrl
    });
  });
});

describe('serializeJsonLd', () => {
  it('escapes < so the payload cannot close the script tag', () => {
    expect(serializeJsonLd({ name: '</script><b>' })).toBe('{"name":"\\u003c/script>\\u003cb>"}');
  });
});
