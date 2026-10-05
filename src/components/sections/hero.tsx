import { HeroActions } from '@/components/sections/hero-actions';
import { Picture } from '@/components/ui/picture';
import { images } from '@/content/images';
import { profile } from '@/content/resume';
import { siteCopy } from '@/content/site';

// Full-width cover band at 16:5, capped near 38vh on desktop, with a short fade into the page at
// its bottom edge and an accent tint in dark mode; the avatar overlaps the band by half its height
// and the name sits centred beneath (D15). Only the band's inner wrapper clips (the drift scales
// the image); the avatar is positioned above it so the band never paints over it. The band drifts
// under scroll and the hero staggers in on load, both motion-safe only; the section publishes the
// view timeline the fixed header fades in against.
export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="hero-timeline">
      <div className="relative overflow-hidden bg-muted">
        <Picture
          image={images.cover}
          priority
          sizes="100vw"
          className="block"
          imgClassName="parallax aspect-[16/5] w-full object-cover lg:max-h-[38vh]"
        />
        <div aria-hidden="true" className="absolute inset-0 hidden bg-brand/15 dark:block" />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-background to-transparent sm:h-24"
        />
      </div>
      <div className="stagger mx-auto flex w-full max-w-6xl flex-col items-center px-4 text-center sm:px-6">
        <Picture
          image={images.avatar}
          priority
          className="relative z-10 -mt-[60px] block sm:-mt-20"
          imgClassName="size-[120px] rounded-full bg-muted shadow-lg ring-[6px] ring-background sm:size-40"
        />
        <h1 id="hero-heading" className="mt-5 text-display font-semibold tracking-tight">
          {profile.name}
        </h1>
        <p className="mt-2 text-xl font-medium">{profile.title}</p>
        <p className="mt-3 max-w-[640px] text-balance text-muted-foreground">{profile.headline}</p>
        {siteCopy.tagline && (
          <p className="mt-2 font-mono text-label text-brand-text">{siteCopy.tagline}</p>
        )}
        <p className="mt-2 font-mono text-label text-muted-foreground">{profile.location}</p>
        <div className="mt-6">
          <HeroActions />
        </div>
      </div>
    </section>
  );
}
