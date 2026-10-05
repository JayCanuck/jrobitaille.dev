import { TimelineNode } from '@/components/sections/timeline-node';
import { SectionHeading } from '@/components/ui/section-heading';
import { earlier, employer } from '@/content/experience';
import type { Link } from '@/content/schema';
import { siteCopy } from '@/content/site';
import { cn } from '@/lib/utils';

interface EraView {
  id: string;
  name: string;
  years: string;
  desc: string;
  highlights: string[];
  link?: Link;
}

// Every block has the same order: employer heading (h3), title label, era nodes (h4) (D13, D14).
const blocks = [
  {
    id: 'LG',
    heading: `${employer.name}, ${employer.years}`,
    groups: employer.titles.map(title => ({ rail: title.rail, eras: title.eras }))
  },
  ...earlier.map(role => ({
    id: role.id,
    heading: role.org,
    groups: [
      {
        rail: role.rail,
        eras: [
          {
            id: role.id,
            name: role.era,
            years: role.years,
            desc: role.desc,
            highlights: role.highlights,
            link: role.link
          }
        ] as EraView[]
      }
    ]
  }))
];

const centered = 'md:self-center md:bg-background md:px-3 md:text-center';

// Alternating cards on a center rail from 768 px, a single left rail below. Nodes reveal with
// scroll-driven animation where supported; otherwise they are simply visible.
export function ExperienceTimeline() {
  let index = 0;
  return (
    <section aria-labelledby="experience-heading" className="flex flex-col gap-8">
      <SectionHeading id="experience-heading">{siteCopy.headings.experience}</SectionHeading>
      <ol className="relative ml-2 flex flex-col gap-8 border-l-2 border-brand/40 pl-6 md:ml-0 md:border-l-0 md:pl-0 md:before:absolute md:before:inset-y-0 md:before:left-1/2 md:before:w-0.5 md:before:-translate-x-1/2 md:before:bg-brand/40">
        {blocks.map(block => (
          <li key={block.id} className="flex flex-col gap-6">
            <h3 className={cn('text-xl font-semibold tracking-tight', centered)}>
              {block.heading}
            </h3>
            {block.groups.map(group => (
              <div key={group.rail} className="flex flex-col gap-6">
                <p data-rail className={cn('font-mono text-label text-brand-text', centered)}>
                  <span className="sr-only">Title: </span>
                  {group.rail}
                </p>
                <ol className="flex flex-col gap-6">
                  {group.eras.map(era => {
                    const side = index++ % 2 === 0 ? 'left' : 'right';
                    return (
                      <li
                        key={era.id}
                        className="reveal relative before:absolute before:top-6 before:-left-[calc(1.5rem+7px)] before:size-3 before:rounded-full before:bg-brand before:ring-4 before:ring-background md:grid md:grid-cols-[1fr_2rem_1fr] md:items-start md:before:hidden"
                      >
                        <span
                          aria-hidden="true"
                          className="col-start-2 row-start-1 mx-auto mt-6 hidden size-3 rounded-full bg-brand ring-4 ring-background md:block"
                        />
                        <div
                          className={cn(
                            'md:row-start-1',
                            side === 'left' ? 'md:col-start-1' : 'md:col-start-3'
                          )}
                        >
                          <TimelineNode
                            name={era.name}
                            years={era.years}
                            desc={era.desc}
                            highlights={era.highlights}
                            link={era.link}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))}
          </li>
        ))}
      </ol>
    </section>
  );
}
