import { buttonVariants } from '@/components/ui/button';
import { profile } from '@/content/resume';

// The three links a recruiter needs (spec §2). Plain anchors with the button styles: no Base UI client JS.
const links = [
  { label: 'Resume (PDF)', href: profile.links.resume, external: false },
  { label: 'LinkedIn', href: profile.links.linkedin, external: true },
  { label: 'GitHub', href: profile.links.github, external: true }
];

export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="flex flex-col gap-4">
      <h1 id="hero-heading" className="text-4xl font-semibold tracking-tight">
        {profile.name}
      </h1>
      <p className="text-xl text-muted-foreground">{profile.title}</p>
      <p>{profile.headline}</p>
      <p className="text-muted-foreground">{profile.location}</p>
      <ul className="flex flex-wrap gap-3">
        {links.map(link => (
          <li key={link.href}>
            <a
              href={link.href}
              rel={link.external ? 'noopener noreferrer' : undefined}
              className={buttonVariants({ variant: 'outline', size: 'lg' })}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
      <p>{profile.availability}</p>
    </section>
  );
}
