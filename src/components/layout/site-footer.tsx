import { profile } from '@/content/resume';

// Contact footer: email, GitHub, LinkedIn, npm, and the plain-text search anchor (spec §2).
const contactLinks = [
  { label: 'Email', href: `mailto:${profile.email}`, external: false },
  { label: 'GitHub', href: profile.links.github, external: true },
  { label: 'LinkedIn', href: profile.links.linkedin, external: true },
  { label: 'npm', href: profile.links.npm, external: true }
];

export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-prose px-6 py-12">
      <nav aria-label="Contact">
        <ul className="flex flex-wrap gap-4">
          {contactLinks.map(link => (
            <li key={link.href}>
              <a
                href={link.href}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <p className="mt-4 text-sm text-muted-foreground">Jason Robitaille (JayCanuck)</p>
    </footer>
  );
}
