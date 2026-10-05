import { chipClass } from '@/components/ui/chip';
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

// One era card: name (h4), years in mono, descriptor, one or two highlights, proof chip if public.
// Highlights are the page layer; the full experience detail stays in the agent-facing data (D12).
// A 1 px hairline in the rail's colour runs from the card's rail-facing edge to its year badge,
// level with the badge's centre: from the left edge on the single rail (badge 48 px, 16 px gap),
// and from the edge `side` names on the centre rail (badge 56 px, 24 px gap). It is a pseudo-element
// of the card, so it slides in with the card and is static under reduced motion (D15 amendment).
const connector =
  "before:absolute before:top-[23px] before:right-[calc(100%+1px)] before:h-px before:w-4 before:bg-border before:content-[''] lg:before:top-[27px] lg:before:w-6 lg:data-[side=left]:before:right-auto lg:data-[side=left]:before:left-[calc(100%+1px)]";

export function TimelineNode({ name, years, desc, highlights, link, side }: TimelineNodeProps) {
  return (
    <div
      data-side={side}
      className={`timeline-card relative flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-xs sm:p-5 ${connector}`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h4 className="text-base font-semibold">{name}</h4>
        <p className="font-mono text-label text-muted-foreground">{years}</p>
      </div>
      <p className="text-small text-muted-foreground">{desc}</p>
      <ul className="list-disc space-y-1 pl-5 text-small marker:text-brand">
        {highlights.map(highlight => (
          <li key={highlight}>{highlight}</li>
        ))}
      </ul>
      {link && (
        <a href={link.href} rel="noopener noreferrer" className={`${chipClass} w-fit`}>
          {link.label}
        </a>
      )}
    </div>
  );
}
