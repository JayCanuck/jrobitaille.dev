import Image from 'next/image';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import type { Project } from '@/content/schema';

interface ProjectCardProps {
  project: Project;
}

const linkClass =
  'underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none';

// Title, era, one or two sentences, primary proof link, optional secondary link (D11).
// The 16:10 image slot is reserved now so Phase 3 screenshots land without layout shift.
export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="pt-0">
      {project.image ? (
        <Image
          src={project.image.src}
          alt={project.image.alt}
          width={project.image.width}
          height={project.image.height}
          className="aspect-[16/10] w-full object-cover"
        />
      ) : (
        <div aria-hidden="true" className="aspect-[16/10] w-full bg-muted" />
      )}
      <CardHeader>
        <h3 className="text-base leading-snug font-medium">{project.title}</h3>
        <p className="text-sm text-muted-foreground">{project.era}</p>
      </CardHeader>
      <CardContent>
        <p>{project.blurb}</p>
      </CardContent>
      <CardFooter className="gap-4">
        <a href={project.link.href} rel="noopener noreferrer" className={linkClass}>
          {project.link.label}
        </a>
        {project.secondaryLink && (
          <a href={project.secondaryLink.href} rel="noopener noreferrer" className={linkClass}>
            {project.secondaryLink.label}
          </a>
        )}
      </CardFooter>
    </Card>
  );
}
