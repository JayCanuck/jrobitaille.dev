import { siteConfig } from "@/lib/site";

// Phase 1 placeholder: identity and the three links a recruiter needs. Server Component, no client JS.
const links = [
  { label: "Resume (PDF)", href: siteConfig.links.resume, external: false },
  { label: "LinkedIn", href: siteConfig.links.linkedin, external: true },
  { label: "GitHub", href: siteConfig.links.github, external: true },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-prose flex-1 flex-col justify-center gap-6 px-6 py-24">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-semibold tracking-tight">
          {siteConfig.name}
        </h1>
        <p className="text-xl text-muted-foreground">{siteConfig.title}</p>
        <p className="text-base">{siteConfig.headline}</p>
      </header>
      <nav aria-label="Profiles">
        <ul className="flex flex-wrap gap-3">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="inline-flex h-9 items-center rounded-lg border border-border px-4 text-sm font-medium hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
