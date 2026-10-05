import { JsonLd } from '@/components/layout/json-ld';
import { About } from '@/components/sections/about';
import { ExperienceTimeline } from '@/components/sections/experience-timeline';
import { Hero } from '@/components/sections/hero';
import { SelectedWork } from '@/components/sections/selected-work';
import { Skills } from '@/components/sections/skills';
import { profile } from '@/content/resume';
import { personJsonLd, webSiteJsonLd } from '@/lib/json-ld';

// Home: hero, About, Selected work, Experience, Skills (D13). Server Components only, no client JS.
// Prose sections cap themselves near 72ch; the work grid and timeline use the wider column.
export default function HomePage() {
  return (
    <main
      id="main"
      className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-20 px-4 pt-4 pb-16 sm:px-6 md:gap-24"
    >
      <JsonLd data={personJsonLd(profile)} />
      <JsonLd data={webSiteJsonLd(profile)} />
      <Hero />
      <About />
      <SelectedWork />
      <ExperienceTimeline />
      <Skills />
    </main>
  );
}
