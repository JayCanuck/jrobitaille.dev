import { FileText } from 'lucide-react';
import Link from 'next/link';

import { resumeLink } from '@/components/sections/hero-actions';
import { buttonVariants } from '@/components/ui/button';
import { profile } from '@/content/resume';
import { siteCopy } from '@/content/site';

// Slim fixed header (D15): name left, section links and the resume right, on a solid background,
// the section links at the small pill's own 28 px height so they centre on one line. Where motion is wanted it fades in once the
// hero has fully scrolled out (a 200 ms threshold fade where animation triggers exist, a short
// scroll-linked fade where only scroll-driven animation does), opacity only, so it stays in the tab
// order and shows itself on focus; otherwise it is simply visible. The section links hide below
// 768 px, where the page is short enough to scroll.
const sections = [
  { id: 'about', label: siteCopy.headings.about },
  { id: 'work', label: siteCopy.headings.work },
  { id: 'experience', label: siteCopy.headings.experience },
  { id: 'skills', label: siteCopy.headings.skills }
];

export function SiteHeader() {
  return (
    <header className="header-fade fixed inset-x-0 top-0 z-40 border-b bg-background">
      <div className="mx-auto flex h-12 w-full max-w-6xl items-center gap-5 px-4 sm:px-6">
        <Link
          href="/"
          className="rounded-sm font-semibold tracking-tight focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          {profile.name}
        </Link>
        <nav aria-label="Sections" className="ml-auto hidden md:block">
          <ul className="flex gap-5">
            {sections.map(section => (
              <li key={section.id} className="flex">
                <a
                  href={`#${section.id}`}
                  className="flex h-7 items-center rounded-sm font-mono text-label font-medium tracking-wider text-muted-foreground uppercase hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a
          href={resumeLink.href}
          className={buttonVariants({
            size: 'sm',
            className:
              'ml-auto rounded-full bg-brand px-3 text-brand-foreground hover:bg-brand/85 md:ml-0'
          })}
        >
          <FileText data-icon="inline-start" />
          {resumeLink.label}
        </a>
      </div>
    </header>
  );
}
