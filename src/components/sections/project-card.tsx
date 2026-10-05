import Image from 'next/image';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import type { Project } from '@/content/schema';

interface ProjectCardProps {
  project: Project;
}

const linkClass =
  'underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none';

// Title, a one-line blurb clamped to two lines so every card is the same height, and a footer row
// with the proof links and the year span (D13). The 16:10 image slot is reserved for Phase 3.
export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="h-full w-full pt-0">
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
      </CardHeader>
      <CardContent>
        <p className="line-clamp-2">{project.blurb}</p>
      </CardContent>
      <CardFooter className="mt-auto justify-between gap-4 text-sm">
        <span className="flex flex-wrap gap-4">
          <a href={project.link.href} rel="noopener noreferrer" className={linkClass}>
            {project.link.label}
          </a>
          {project.secondaryLink && (
            <a href={project.secondaryLink.href} rel="noopener noreferrer" className={linkClass}>
              {project.secondaryLink.label}
            </a>
          )}
        </span>
        <span className="text-muted-foreground">{project.era}</span>
      </CardFooter>
    </Card>
  );
}
