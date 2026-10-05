import { JsonLd } from '@/components/layout/json-ld';
import { SiteHeader } from '@/components/layout/site-header';
import { About } from '@/components/sections/about';
import { ExperienceTimeline } from '@/components/sections/experience-timeline';
import { Hero } from '@/components/sections/hero';
import { SelectedWork } from '@/components/sections/selected-work';
import { Skills } from '@/components/sections/skills';
import { profile } from '@/content/resume';
import { personJsonLd, webSiteJsonLd } from '@/lib/json-ld';

// Home (D15): fixed header, full-width hero, then About and Toolbox side by side from 1024 px,
// the card grid and the timeline, each section separated by a hairline. Server Components only.
export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <JsonLd data={personJsonLd(profile)} />
        <JsonLd data={webSiteJsonLd(profile)} />
        <Hero />
        <div className="mx-auto flex w-full max-w-6xl flex-col px-4 pb-16 sm:px-6">
          <div className="grid gap-16 pt-16 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-20 lg:pt-24">
            <About />
            <Skills />
          </div>
          <hr className="mt-16 lg:mt-24" />
          <SelectedWork />
          <hr className="mt-16 lg:mt-24" />
          <ExperienceTimeline />
        </div>
      </main>
    </>
  );
}
