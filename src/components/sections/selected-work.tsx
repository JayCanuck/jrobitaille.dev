import { ProjectCard } from '@/components/sections/project-card';
import { SectionHeading } from '@/components/ui/section-heading';
import { projects } from '@/content/projects';
import { siteCopy } from '@/content/site';
import { cn } from '@/lib/utils';

// Five proof-linked cards (D11): one column under 640, two from 768, three from 1280 where the first
// card spans two columns so five cards fill a 3+3 grid. Height comes from the grid, not truncation.
export function SelectedWork() {
  return (
    <section aria-labelledby="work-heading" className="flex flex-col gap-6">
      <SectionHeading id="work-heading">{siteCopy.headings.work}</SectionHeading>
      <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project, index) => (
          <li key={project.slug} className={cn('flex', index === 0 && 'xl:col-span-2')}>
            <ProjectCard project={project} />
          </li>
        ))}
      </ul>
    </section>
  );
}
