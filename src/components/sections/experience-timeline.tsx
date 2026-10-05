import { TimelineNode } from '@/components/sections/timeline-node';
import { experience } from '@/content/experience';

// One node per era, newest first; motion and the rail treatment arrive in Phase 3.
export function ExperienceTimeline() {
  return (
    <section aria-labelledby="experience-heading" className="flex flex-col gap-6">
      <h2 id="experience-heading" className="text-2xl font-semibold tracking-tight">
        Experience
      </h2>
      <ol className="flex flex-col gap-8">
        {experience.map(era => (
          <TimelineNode key={era.id} era={era} />
        ))}
      </ol>
    </section>
  );
}
