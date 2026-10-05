import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { siteConfig } from '@/lib/site';
import '@/styles/globals.css';

// Two self-hosted fonts via next/font: zero layout shift (spec §4).
const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} · ${siteConfig.title}`,
    template: `%s · ${siteConfig.name}`
  },
  description: `${siteConfig.name}, ${siteConfig.title}. ${siteConfig.headline}.`,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'profile',
    siteName: siteConfig.name,
    title: `${siteConfig.name} · ${siteConfig.title}`,
    description: siteConfig.headline,
    url: '/'
  },
  twitter: { card: 'summary' }
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
