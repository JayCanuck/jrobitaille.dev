import { badgeVariants } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Picture } from '@/components/ui/picture';
import type { Project } from '@/content/schema';

interface ProjectCardProps {
  project: Project;
}

const chipClass = badgeVariants({
  variant: 'outline',
  className: 'h-7 px-2.5 text-label hover:border-brand hover:text-brand-text'
});

// Title, one-line blurb (schema caps it at 100 characters), a footer row with link chips and the
// year span pinned right (D13). The 16:10 slot shows the image or a short hatch pattern until one
// exists. Container queries size the title by card width, not viewport.
export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="@container h-full w-full gap-3 pt-0 transition-[transform,box-shadow] duration-200 hover:shadow-md motion-safe:hover:-translate-y-0.5">
      {project.image ? (
        <Picture
          image={project.image}
          className="block"
          imgClassName="aspect-[16/10] w-full object-cover"
        />
      ) : (
        <div aria-hidden="true" className="slot-pattern aspect-[16/10] w-full" />
      )}
      <CardHeader>
        <h3 className="text-base leading-snug font-semibold @md:text-lg">{project.title}</h3>
      </CardHeader>
      <CardContent className="flex-1">
        <p>{project.blurb}</p>
      </CardContent>
      <CardFooter className="flex-wrap gap-2">
        <a href={project.link.href} rel="noopener noreferrer" className={chipClass}>
          {project.link.label}
        </a>
        {project.secondaryLink && (
          <a href={project.secondaryLink.href} rel="noopener noreferrer" className={chipClass}>
            {project.secondaryLink.label}
          </a>
        )}
        <span className="ml-auto shrink-0 font-mono text-label text-muted-foreground">
          {project.era}
        </span>
      </CardFooter>
    </Card>
  );
}
