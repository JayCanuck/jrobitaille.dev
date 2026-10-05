import type { Link } from '@/content/schema';

interface TimelineNodeProps {
  name: string;
  years: string;
  desc: string;
  highlights: string[];
  link?: Link;
}

// One era card: name (h4), years in mono, descriptor, one or two highlights, proof link if public.
// Highlights are the page layer; the full experience detail stays in the agent-facing data (D12).
export function TimelineNode({ name, years, desc, highlights, link }: TimelineNodeProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-xs sm:p-5">
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
        <a
          href={link.href}
          rel="noopener noreferrer"
          className="w-fit text-label font-medium text-brand-text underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          {link.label}
        </a>
      )}
    </div>
  );
}
