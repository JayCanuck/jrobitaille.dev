import { TimelineNode } from '@/components/sections/timeline-node';
import { earlier, employer } from '@/content/experience';

const railClass = 'text-sm font-medium text-muted-foreground';

// One LG block (h3) holding the five eras (h4) under the title ladder: the full title is a non-heading
// labelled element shown where the title changes (D13). Experis and Canuck Coding are their own blocks.
export function ExperienceTimeline() {
  return (
    <section aria-labelledby="experience-heading" className="flex flex-col gap-6">
      <h2 id="experience-heading" className="text-2xl font-semibold tracking-tight">
        Experience
      </h2>
      <ol className="flex flex-col gap-10">
        <li className="flex flex-col gap-6">
          <h3 className="text-xl font-medium">
            {employer.name}, {employer.years}
          </h3>
          <ol className="flex flex-col gap-8">
            {employer.titles.map(title => (
              <li key={title.title} className="flex flex-col gap-4 border-l border-border pl-4">
                <p data-rail className={railClass}>
                  <span className="sr-only">Title: </span>
                  {title.rail}
                </p>
                <ol className="flex flex-col gap-6">
                  {title.eras.map(era => (
                    <li key={era.id}>
                      <TimelineNode
                        as="h4"
                        name={era.name}
                        years={era.years}
                        desc={era.desc}
                        highlights={era.highlights}
                        link={era.link}
                      />
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ol>
        </li>
        {earlier.map(role => (
          <li key={role.id} className="flex flex-col gap-4 border-l border-border pl-4">
            <p data-rail className={railClass}>
              <span className="sr-only">Title: </span>
              {role.rail}
            </p>
            <TimelineNode
              as="h3"
              name={role.org}
              years={role.years}
              desc={role.desc}
              highlights={role.highlights}
              link={role.link}
            />
          </li>
        ))}
      </ol>
    </section>
  );
}
