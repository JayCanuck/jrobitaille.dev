import type { Link } from '@/content/schema';

interface TimelineNodeProps {
  as: 'h3' | 'h4';
  name: string;
  years: string;
  desc: string;
  highlights: string[];
  link?: Link;
}

// One timeline node: name, years, descriptor, one or two highlights, proof link if public.
// Highlights are the page layer; the full bullet pool stays agent-facing (D12).
export function TimelineNode({
  as: Heading,
  name,
  years,
  desc,
  highlights,
  link
}: TimelineNodeProps) {
  return (
    <div className="flex flex-col gap-2">
      <Heading className="text-lg font-medium">{name}</Heading>
      <p className="text-sm text-muted-foreground">{years}</p>
      <p>{desc}</p>
      <ul className="list-disc pl-5">
        {highlights.map(highlight => (
          <li key={highlight}>{highlight}</li>
        ))}
      </ul>
      {link && (
        <a
          href={link.href}
          rel="noopener noreferrer"
          className="w-fit underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          {link.label}
        </a>
      )}
    </div>
  );
}
