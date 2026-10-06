import { TimelineNode } from '@/components/sections/timeline-node';
import { SectionHeading } from '@/components/ui/section-heading';
import { earlier, employer } from '@/content/experience';
import type { Link } from '@/content/schema';
import { siteCopy } from '@/content/site';
import { layoutTimeline, startYear } from '@/lib/timeline';
import { cn } from '@/lib/utils';

interface EraView {
  id: string;
  name: string;
  years: string;
  desc: string;
  highlights: string[];
  link?: Link;
}

type Item =
  | { kind: 'employer'; key: string; heading: string }
  | { kind: 'title'; key: string; rail: string; single: boolean }
  | { kind: 'era'; key: string; era: EraView };

// One flat list in page order: employer heading, title rung, era nodes (D13, D14), the earlier
// roles mirroring the LG block. The placement helper assigns each item its grid row at 1024+.
const items: Item[] = [
  { kind: 'employer', key: 'LG', heading: `${employer.name}, ${employer.years}` },
  ...employer.titles.flatMap(title => [
    {
      kind: 'title',
      key: `${title.rail}-LG`,
      rail: title.rail,
      single: title.eras.length === 1
    } as const,
    ...title.eras.map(era => ({ kind: 'era', key: era.id, era }) as const)
  ]),
  ...earlier.flatMap(role => [
    { kind: 'employer', key: role.id, heading: role.org } as const,
    { kind: 'title', key: `${role.rail}-${role.id}`, rail: role.rail, single: true } as const,
    {
      kind: 'era',
      key: `${role.id}-era`,
      era: {
        id: role.id,
        name: role.era,
        years: role.years,
        desc: role.desc,
        highlights: role.highlights
      }
    } as const
  ])
];

const placed = layoutTimeline(items);

// Dot on the single rail below 1024 px; at 1024+ the label knocks out the centre rail instead.
const labelClass =
  'relative pl-16 before:absolute before:top-1.5 before:left-[calc(1.5rem-6px)] before:size-3 before:rounded-full before:border-2 before:border-brand before:bg-background lg:col-span-3 lg:col-start-1 lg:pl-0 lg:text-center lg:before:hidden';
// One line whatever the font, so a wider fallback cannot wrap the label (D15 amendment).
const knockout = 'relative inline-block bg-background px-3 whitespace-nowrap';

// Single left rail with round year badges below 1024 px; a centre rail from 1024 px where the cards
// alternate sides and interleave, each starting at the previous card's midpoint (D15).
export function ExperienceTimeline() {
  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="flex scroll-mt-14 flex-col gap-8 pt-16 lg:pt-24"
    >
      <SectionHeading id="experience-heading">{siteCopy.headings.experience}</SectionHeading>
      <ol className="relative flex flex-col gap-6 before:absolute before:inset-y-2 before:left-6 before:w-px before:bg-border lg:grid lg:grid-cols-[minmax(0,1fr)_3.5rem_minmax(0,1fr)] lg:gap-x-6 lg:gap-y-8 lg:before:left-1/2">
        {placed.map(item => {
          const rowClass = `lg:row-start-${String(item.row)}`;
          if (item.kind === 'employer') {
            return (
              <li key={item.key} className={cn(labelClass, rowClass)}>
                <h3 className={cn(knockout, 'text-lg font-semibold tracking-tight')}>
                  {item.heading}
                </h3>
              </li>
            );
          }
          if (item.kind === 'title') {
            // A rung with a single era sits a third closer to its neighbours; the negative margins
            // shrink the row the label occupies without touching the alternation.
            return (
              <li
                key={item.key}
                className={cn(labelClass, rowClass, item.single && '-my-2 lg:-my-[0.667rem]')}
              >
                <p
                  data-rail
                  className={cn(
                    knockout,
                    'font-mono text-label font-semibold tracking-wider text-brand-text uppercase'
                  )}
                >
                  <span className="sr-only">Title: </span>
                  {item.rail}
                </p>
              </li>
            );
          }
          const start = startYear(item.era.years);
          const side = item.side ?? 'left';
          return (
            <li
              key={item.key}
              className={cn(
                'relative pl-16 lg:row-span-2 lg:pl-0',
                rowClass,
                side === 'left' ? 'lg:col-start-1' : 'lg:col-start-3'
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'badge-in absolute top-0 left-0 z-10 flex size-12 flex-col items-center justify-center rounded-full bg-brand font-mono text-xs leading-none font-bold text-brand-foreground ring-[5px] ring-background lg:size-14 lg:text-[0.8125rem]',
                  side === 'left'
                    ? 'lg:left-[calc(100%+1.5rem)]'
                    : 'lg:right-[calc(100%+1.5rem)] lg:left-auto'
                )}
              >
                {start}
              </span>
              <TimelineNode
                name={item.era.name}
                years={item.era.years}
                desc={item.era.desc}
                highlights={item.era.highlights}
                side={side}
              />
            </li>
          );
        })}
      </ol>
    </section>
  );
}
