import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { SiteFooter } from '@/components/layout/site-footer';
import { SkipLink } from '@/components/layout/skip-link';
import { profile } from '@/content/resume';
import { siteUrl } from '@/lib/site';
import '@/styles/globals.css';

// Two self-hosted fonts via next/font: the variable sans for body, the mono for labels, dates and
// the timeline rail (D14). Default swap with the metric-matched fallback: no layout shift (spec §4).
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
  description: profile.metaDescription,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'profile',
    siteName: profile.name,
    title: `${profile.name} · ${profile.title}`,
    description: profile.metaDescription,
    url: '/'
  },
  twitter: { card: 'summary_large_image' }
};

// Chrome origin-trial token for WebMCP (spec §7, D17): set WEBMCP_ORIGIN_TRIAL_TOKEN at build to
// emit the meta tag; absent, nothing is rendered. A token is bound to the origin and public.
const originTrialToken = process.env.WEBMCP_ORIGIN_TRIAL_TOKEN;

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      {originTrialToken && (
        <head>
          <meta httpEquiv="origin-trial" content={originTrialToken} />
        </head>
      )}
      <body className="flex min-h-full flex-col">
        <SkipLink />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
