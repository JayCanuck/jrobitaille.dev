import { buttonVariants } from '@/components/ui/button';
import { Picture } from '@/components/ui/picture';
import { images } from '@/content/images';
import { profile } from '@/content/resume';
import { siteCopy } from '@/content/site';

// The three links a recruiter needs (spec §2). Plain anchors with the button styles: no Base UI client JS.
const links = [
  { label: 'Resume (PDF)', href: profile.links.resume, external: false },
  { label: 'LinkedIn', href: profile.links.linkedin, external: true },
  { label: 'GitHub', href: profile.links.github, external: true }
];

// Cover band at a fixed 16:5 with explicit dimensions (no layout shift); the image drifts a little
// under scroll where scroll-driven animation is supported and motion is wanted, otherwise static.
export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="flex flex-col">
      <div className="relative">
        <div className="aspect-[16/5] w-full overflow-hidden rounded-2xl bg-muted">
          <Picture
            image={images.cover}
            priority
            sizes="(min-width: 1184px) 1120px, calc(100vw - 2rem)"
            className="block h-full w-full"
            imgClassName="parallax h-full w-full object-cover"
          />
        </div>
        <Picture
          image={images.avatar}
          priority
          className="absolute -bottom-10 left-5 block sm:-bottom-12 sm:left-8"
          imgClassName="size-24 rounded-full bg-muted ring-4 ring-background sm:size-32"
        />
      </div>
      <div className="mt-14 flex max-w-[72ch] flex-col gap-3 px-1 sm:mt-16 sm:px-2">
        <h1 id="hero-heading" className="text-display font-semibold tracking-tight">
          {profile.name}
        </h1>
        <p className="text-lg text-muted-foreground">{profile.title}</p>
        <p>{profile.headline}</p>
        {siteCopy.tagline && (
          <p className="font-mono text-label text-brand-text">{siteCopy.tagline}</p>
        )}
        <p className="font-mono text-label text-muted-foreground">{profile.location}</p>
        <ul className="mt-2 flex flex-wrap gap-3">
          {links.map(link => (
            <li key={link.href}>
              <a
                href={link.href}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className={buttonVariants({
                  variant: 'outline',
                  size: 'lg',
                  className: 'hover:border-brand hover:text-brand-text'
                })}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground">{profile.availability}</p>
      </div>
    </section>
  );
}
