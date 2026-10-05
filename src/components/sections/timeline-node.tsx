import type { Era } from '@/content/schema';

interface TimelineNodeProps {
  era: Era;
}

// One era: rail label (title ladder), name, years, descriptor, up to two bullets, proof link if public.
export function TimelineNode({ era }: TimelineNodeProps) {
  return (
    <li className="flex flex-col gap-2 border-l border-border pl-4">
      <p className="text-sm text-muted-foreground">
        {era.rail} · {era.employer}
      </p>
      <h3 className="text-lg font-medium">{era.name}</h3>
      <p className="text-sm text-muted-foreground">
        <time dateTime={String(era.start)}>{era.start}</time> to{' '}
        <time dateTime={String(era.end)}>{era.end}</time>
      </p>
      <p>{era.descriptor}</p>
      <ul className="list-disc pl-5">
        {era.bullets.map(bullet => (
          <li key={bullet.id}>{bullet.text}</li>
        ))}
      </ul>
      {era.link && (
        <a
          href={era.link.href}
          rel="noopener noreferrer"
          className="w-fit underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          {era.link.label}
        </a>
      )}
    </li>
  );
}
