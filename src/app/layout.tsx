import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { SiteFooter } from '@/components/layout/site-footer';
import { SkipLink } from '@/components/layout/skip-link';
import { profile } from '@/content/resume';
import { siteUrl } from '@/lib/site';
import '@/styles/globals.css';

// Two self-hosted fonts via next/font: zero layout shift (spec §4).
const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${profile.name} · ${profile.title}`,
    template: `%s · ${profile.name}`
  },
  description: `${profile.name}, ${profile.title}. ${profile.headline}.`,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'profile',
    siteName: profile.name,
    title: `${profile.name} · ${profile.title}`,
    description: profile.headline,
    url: '/'
  },
  twitter: { card: 'summary' }
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <SkipLink />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
