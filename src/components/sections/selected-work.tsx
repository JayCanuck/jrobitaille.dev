import { ProjectCard } from '@/components/sections/project-card';
import { projects } from '@/content/projects';

// All five proof-linked cards live on the home page; there is no /projects route (D11).
export function SelectedWork() {
  return (
    <section aria-labelledby="work-heading" className="flex flex-col gap-6">
      <h2 id="work-heading" className="text-2xl font-semibold tracking-tight">
        Selected work
      </h2>
      <ul className="grid gap-6 sm:grid-cols-2">
        {projects.map(project => (
          <li key={project.slug} className="flex">
            <ProjectCard project={project} />
          </li>
        ))}
      </ul>
    </section>
  );
}
