import { badgeVariants } from '@/components/ui/badge';
import { skills } from '@/content/resume';

// Grouped text chips, five groups, no bars, no logo wall (spec §2). Plain <li> with the badge
// styles: no Base UI client JS. This list is also the no-JS version of the Phase 4 word cloud.
export function Skills() {
  return (
    <section aria-labelledby="skills-heading" className="flex flex-col gap-6">
      <h2 id="skills-heading" className="text-2xl font-semibold tracking-tight">
        Skills
      </h2>
      {skills.map(group => (
        <div key={group.name} className="flex flex-col gap-2">
          <h3 className="text-base font-medium">{group.name}</h3>
          <ul className="flex flex-wrap gap-2">
            {group.terms.map(term => (
              <li key={term} className={badgeVariants({ variant: 'outline' })}>
                {term}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
