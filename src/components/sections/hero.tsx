import { HeroActions } from '@/components/sections/hero-actions';
import { Picture } from '@/components/ui/picture';
import { images } from '@/content/images';
import { profile } from '@/content/resume';
import { siteCopy } from '@/content/site';

// Full-width cover band at 16:5, capped near 38vh on desktop, with an accent-tinted fade in dark
// mode; the avatar overlaps its bottom edge and the name sits centred beneath (D15). The band
// drifts under scroll and the hero staggers in on load, both motion-safe only; the section
// publishes the view timeline the fixed header fades in against.
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
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-b from-transparent to-background/70 dark:from-brand/15"
        />
      </div>
      <div className="stagger mx-auto flex w-full max-w-6xl flex-col items-center px-4 text-center sm:px-6">
        <Picture
          image={images.avatar}
          priority
          className="-mt-[60px] block sm:-mt-20"
          imgClassName="size-[120px] rounded-full bg-muted shadow-lg ring-[6px] ring-background sm:size-40"
        />
        <h1 id="hero-heading" className="mt-5 text-display font-semibold tracking-tight">
          {profile.name}
        </h1>
        <p className="mt-2 text-xl font-medium">{profile.title}</p>
        <p className="mt-3 max-w-[44ch] text-muted-foreground">{profile.headline}</p>
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
