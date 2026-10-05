// JSON-LD builders for the home page (spec §5: Person and WebSite). Pure data in, pure data out.
import type { Profile } from '@/content/schema';
import { siteUrl } from '@/lib/site';

export const personJsonLd = (profile: Profile) => {
  // "Mountain View, CA · remote or Bay Area": locality and region only, never a street address.
  const [locality = '', region = ''] = profile.location.split(' · ')[0]?.split(', ') ?? [];
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.title,
    url: siteUrl,
    email: profile.email,
    sameAs: [profile.links.linkedin, profile.links.github, profile.links.npm],
    address: { '@type': 'PostalAddress', addressLocality: locality, addressRegion: region }
  };
};

export const webSiteJsonLd = (profile: Profile) => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: profile.name,
  url: siteUrl
});

// JSON.stringify does not escape "<", so a value could close the script tag; see the Next JSON-LD guide.
export const serializeJsonLd = (data: object) => JSON.stringify(data).replace(/</g, '\\u003c');
