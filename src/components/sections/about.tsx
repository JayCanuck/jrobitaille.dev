import { SectionHeading } from '@/components/ui/section-heading';
import { profile } from '@/content/resume';
import { siteCopy } from '@/content/site';

// The short About (D13); the long form stays in the agent-facing data.
export function About() {
  return (
    <section aria-labelledby="about-heading" className="flex max-w-[72ch] flex-col gap-5">
      <SectionHeading id="about-heading">{siteCopy.headings.about}</SectionHeading>
      {profile.about.map(paragraph => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </section>
  );
}
