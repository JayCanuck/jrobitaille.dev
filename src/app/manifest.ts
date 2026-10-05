import type { MetadataRoute } from 'next';

import { profile } from '@/content/resume';

// Metadata routes must opt into static rendering under output: "export".
export const dynamic = 'force-static';

// Web app manifest (spec §5): name, icons from the avatar, brand colours matching globals.css.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${profile.name} · ${profile.title}`,
    short_name: 'jrobitaille.dev',
    description: profile.metaDescription,
    start_url: '/',
    display: 'browser',
    background_color: '#ffffff',
    theme_color: '#8b5cf6',
    icons: [
      { src: '/icon.png', sizes: '32x32', type: 'image/png' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  };
}
