import { badgeVariants } from '@/components/ui/badge';
import { SectionHeading } from '@/components/ui/section-heading';
import { skills } from '@/content/resume';
import { siteCopy } from '@/content/site';

const tagClass = badgeVariants({
  variant: 'outline',
  className: 'h-6 border-transparent bg-muted px-2.5 font-mono text-label'
});

// Grouped text chips, five groups, no bars, no logo wall (spec §2). Plain <li> with the badge
// styles: no Base UI client JS. This list is also the no-JS version of the Phase 4 word cloud.
// One column: the section sits beside About from 1024 px (D15).
export function Skills() {
  return (
    <section id="skills" aria-labelledby="skills-heading" className="flex flex-col gap-5">
      <SectionHeading id="skills-heading">{siteCopy.headings.skills}</SectionHeading>
      <div className="flex flex-col gap-4">
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
    </section>
  );
}
