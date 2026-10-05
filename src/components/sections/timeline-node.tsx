import { badgeVariants } from '@/components/ui/badge';
import type { Link } from '@/content/schema';
import type { TimelineSide } from '@/lib/timeline';

interface TimelineNodeProps {
  name: string;
  years: string;
  desc: string;
  highlights: string[];
  link?: Link;
  side: TimelineSide;
}

const chipClass = badgeVariants({
  variant: 'secondary',
  className:
    'h-6 w-fit border-transparent bg-brand-soft px-2.5 font-mono text-label text-brand-text'
});

// One era card: name (h4), years in mono, descriptor, one or two highlights, proof chip if public.
// Highlights are the page layer; the full experience detail stays in the agent-facing data (D12).
// `side` picks the direction the card slides in from on the centre rail (D15).
export function TimelineNode({ name, years, desc, highlights, link, side }: TimelineNodeProps) {
  return (
    <div
      data-side={side}
      className="timeline-card flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-xs sm:p-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h4 className="text-base font-semibold">{name}</h4>
        <p className="font-mono text-label text-muted-foreground">{years}</p>
      </div>
      <p className="text-muted-foreground">{desc}</p>
      <ul className="list-disc space-y-1 pl-5 marker:text-brand">
        {highlights.map(highlight => (
          <li key={highlight}>{highlight}</li>
        ))}
      </ul>
      {link && (
        <a href={link.href} rel="noopener noreferrer" className={chipClass}>
          {link.label}
        </a>
      )}
    </div>
  );
}
