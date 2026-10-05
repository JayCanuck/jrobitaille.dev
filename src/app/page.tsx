import { JsonLd } from '@/components/layout/json-ld';
import { About } from '@/components/sections/about';
import { ExperienceTimeline } from '@/components/sections/experience-timeline';
import { Hero } from '@/components/sections/hero';
import { SelectedWork } from '@/components/sections/selected-work';
import { Skills } from '@/components/sections/skills';
import { profile } from '@/content/resume';
import { personJsonLd, webSiteJsonLd } from '@/lib/json-ld';

// Home: hero, About, Selected work, Experience, Skills (D13). Server Components only, no client JS.
export default function HomePage() {
  return (
    <main id="main" className="mx-auto flex w-full max-w-prose flex-1 flex-col gap-16 px-6 py-16">
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
