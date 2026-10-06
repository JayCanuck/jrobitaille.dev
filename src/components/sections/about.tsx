import { SectionHeading } from '@/components/ui/section-heading';
import { profile } from '@/content/resume';
import { siteCopy } from '@/content/site';

// The short About (D13); the long form stays in the agent-facing data. Sits beside the Toolbox
// from 1024 px (D15), so the section carries no width cap of its own beyond the prose measure.
export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="flex scroll-mt-14 flex-col gap-5"
    >
      <SectionHeading id="about-heading">{siteCopy.headings.about}</SectionHeading>
      {profile.about.map(paragraph => (
        <p key={paragraph} className="max-w-[56ch]">
          {paragraph}
        </p>
      ))}
    </section>
  );
}
