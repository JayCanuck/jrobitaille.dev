import { ProjectCard } from '@/components/sections/project-card';
import { SectionHeading } from '@/components/ui/section-heading';
import { projects } from '@/content/projects';
import { siteCopy } from '@/content/site';

// Six proof-linked image cards (D11) in a grid: one column, two from 640 px and three equal columns
// from 1024 px, so six cards fill two rows. Cards rise 8 px as they enter where scroll-driven
// animation runs.
export function SelectedWork() {
  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="flex scroll-mt-14 flex-col gap-6 pt-16 lg:pt-24"
    >
      <SectionHeading id="work-heading">{siteCopy.headings.work}</SectionHeading>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map(project => (
          <li key={project.slug} className="rise flex">
            <ProjectCard project={project} />
          </li>
        ))}
      </ul>
    </section>
  );
}
