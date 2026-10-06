import { Island } from '@/components/islands/island';
import { tagClass } from '@/components/ui/chip';
import { SectionHeading } from '@/components/ui/section-heading';
import { skills } from '@/content/resume';
import { siteCopy } from '@/content/site';

// Toolbox (D18): the cloud is the primary view and the chips are the fallback, both inside one
// reserved box whose height is the larger of the chip block and a square of the column width, so
// nothing shifts when the island mounts. The chips render at first paint in every case, exactly as
// before; once the cloud has mounted they fade to opacity 0 and ignore the pointer but stay in the
// DOM and the accessibility tree (never display none or visibility hidden). The heading row holds
// the slot the island's List/Cloud control renders into. No JS, reduced motion, reduced data,
// saveData, no WebGL or any load error leave the chips visible with nothing to undo.
export function Skills() {
  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="flex scroll-mt-14 flex-col gap-5"
    >
      <div className="flex items-center justify-between gap-4">
        <SectionHeading id="skills-heading">{siteCopy.headings.skills}</SectionHeading>
        <span id="skills-view" className="flex h-7 items-center gap-3" />
      </div>
      <div className="@container">
        <Island
          name="cloud"
          props={{
            terms: skills.flatMap(group => group.terms),
            labels: siteCopy.skillsView,
            toggleSlotId: 'skills-view'
          }}
          className="group relative min-h-[100cqw]"
        >
          <div className="flex flex-col gap-4 transition-opacity duration-300 group-has-[[data-cloud-view=cloud]]:pointer-events-none group-has-[[data-cloud-view=cloud]]:opacity-0 motion-reduce:transition-none">
            {skills.map(group => (
              <div key={group.name} className="flex flex-col gap-2">
                <h3 className="font-mono text-label font-medium tracking-wider text-muted-foreground uppercase">
                  {group.name}
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {group.terms.map(term => (
                    <li key={term} className={tagClass}>
                      {term}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Island>
      </div>
    </section>
  );
}
