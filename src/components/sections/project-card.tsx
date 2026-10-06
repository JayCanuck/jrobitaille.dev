import { ArrowUpRight } from 'lucide-react';

import { chipClass } from '@/components/ui/chip';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Picture } from '@/components/ui/picture';
import type { Project } from '@/content/schema';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
}

// Image on top, the year span as a mono label, title, one-line blurb, then a row of proof chips
// only, so the row wraps freely (D13 amendment). The whole card is the primary link: the title anchor stretches over the card, and both proof chips are
// anchors above the stretched one, the primary to the same destination (D15 amendment).
export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="group/project relative w-full gap-3 pt-0 hover:shadow-md hover:ring-foreground/25 motion-safe:transition-[transform,box-shadow] motion-safe:duration-200 motion-safe:hover:-translate-y-0.5">
      {project.image ? (
        <Picture
          image={project.image}
          className="block"
          imgClassName="aspect-[16/10] w-full border-b object-cover"
        />
      ) : (
        <div aria-hidden="true" className="slot-pattern aspect-[16/10] w-full" />
      )}
      <CardHeader>
        <p className="font-mono text-label text-muted-foreground">{project.era}</p>
        <h3 className="text-base leading-snug font-semibold">
          <a
            href={project.link.href}
            rel="noopener noreferrer"
            className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
          >
            {project.title}
            <ArrowUpRight
              aria-hidden="true"
              className="ml-1 inline size-[1em] align-[-0.1em] text-muted-foreground group-hover/project:text-brand-text motion-safe:transition-transform motion-safe:group-hover/project:translate-x-px motion-safe:group-hover/project:-translate-y-px"
            />
          </a>
        </h3>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-small text-muted-foreground">{project.blurb}</p>
      </CardContent>
      <CardFooter className="flex-wrap gap-2 border-t-0 bg-transparent pt-0">
        <a
          href={project.link.href}
          rel="noopener noreferrer"
          className={cn(chipClass, 'relative z-10')}
        >
          {project.link.label}
        </a>
        {project.secondaryLink && (
          <a
            href={project.secondaryLink.href}
            rel="noopener noreferrer"
            className={cn(chipClass, 'relative z-10')}
          >
            {project.secondaryLink.label}
          </a>
        )}
      </CardFooter>
    </Card>
  );
}
