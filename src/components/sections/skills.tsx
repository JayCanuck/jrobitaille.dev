import { badgeVariants } from '@/components/ui/badge';
import { SectionHeading } from '@/components/ui/section-heading';
import { skills } from '@/content/resume';
import { siteCopy } from '@/content/site';

const chipClass = badgeVariants({
  variant: 'outline',
  className: 'h-7 px-2.5 text-label hover:border-brand hover:text-brand-text'
});

// Grouped text chips, five groups, no bars, no logo wall (spec §2). Plain <li> with the badge
// styles: no Base UI client JS. This list is also the no-JS version of the Phase 4 word cloud.
export function Skills() {
  return (
    <section aria-labelledby="skills-heading" className="flex flex-col gap-6">
      <SectionHeading id="skills-heading">{siteCopy.headings.skills}</SectionHeading>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {skills.map(group => (
          <div key={group.name} className="flex flex-col gap-3">
            <h3 className="font-mono text-label tracking-wide text-muted-foreground uppercase">
              {group.name}
            </h3>
            <ul className="flex flex-wrap gap-2">
              {group.terms.map(term => (
                <li key={term} className={chipClass}>
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
