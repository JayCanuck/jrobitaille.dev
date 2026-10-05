import { HeroActions } from '@/components/sections/hero-actions';
import { Picture } from '@/components/ui/picture';
import { images } from '@/content/images';
import { profile } from '@/content/resume';
import { siteCopy } from '@/content/site';

// The cover is a fixed layer at the top of the viewport (z-0) and the band is a transparent window
// of the same height, so the page scrolls over the image like the previous site did; everything
// after the window carries the page background to cover it (D15 amendment). The crop anchors to the
// top, a short fade at the band's bottom edge and the dark-mode tint live in the layer, and the
// avatar overlaps the window from the identity block above it. No parallax drift: the two effects
// would fight. The hero staggers in on load, motion-safe only, and publishes the view timeline and
// the trigger the fixed header fades in against.
const bandClass = 'aspect-[16/5] w-full lg:max-h-[38vh]';

export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="hero-timeline">
      <div aria-hidden="true" className="fixed inset-x-0 top-0 z-0 bg-muted">
        <Picture
          image={images.cover}
          priority
          sizes="100vw"
          className="block"
          imgClassName={`${bandClass} object-cover object-top`}
        />
        <div className="absolute inset-0 hidden bg-brand/15 dark:block" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-background to-transparent sm:h-24" />
      </div>
      <div className={bandClass} />
      <div className="relative z-10 bg-background">
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
          <p className="mt-3 max-w-[640px] text-balance text-muted-foreground">
            {profile.headline}
          </p>
          {siteCopy.tagline && (
            <p className="mt-2 font-mono text-label text-brand-text">{siteCopy.tagline}</p>
          )}
          <p className="mt-2 font-mono text-label text-muted-foreground">{profile.location}</p>
          <div className="mt-6">
            <HeroActions />
          </div>
        </div>
      </div>
    </section>
  );
}
