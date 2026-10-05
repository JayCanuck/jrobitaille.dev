import { FileText } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { GithubIcon, LinkedinIcon } from '@/components/ui/icons';
import { profile } from '@/content/resume';

// The resume is the primary action (a filled accent pill); LinkedIn and GitHub are labelled icons
// (D15). Plain anchors with the button styles: no Base UI client JS.
export const resumeLink = { label: 'Resume (PDF)', href: profile.links.resume };

const social = [
  { label: 'LinkedIn', href: profile.links.linkedin, Icon: LinkedinIcon },
  { label: 'GitHub', href: profile.links.github, Icon: GithubIcon }
];

const resumeButtonClass = buttonVariants({
  size: 'lg',
  className: 'rounded-full bg-brand px-4 text-brand-foreground hover:bg-brand/85'
});

export function HeroActions() {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
      <li>
        <a href={resumeLink.href} className={resumeButtonClass}>
          <FileText data-icon="inline-start" />
          {resumeLink.label}
        </a>
      </li>
      {social.map(({ label, href, Icon }) => (
        <li key={href}>
          <a
            href={href}
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-sm font-mono text-label text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <Icon className="size-5" />
            {label}
          </a>
        </li>
      ))}
    </ul>
  );
}
