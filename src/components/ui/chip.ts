// One chip shape for every proof link (accent) and every Toolbox term (grey): 24 px tall, mono
// label with a line height that fits inside it, pill radius. Written out rather than built from the
// shadcn Badge so nothing in a text chip clips (no overflow-hidden) or transitions (DESIGN.md).
// Plain strings, no class merge: the agent-tools island imports tagClass and must not pull
// tailwind-merge into its chunk.
const base =
  'inline-flex h-6 shrink-0 items-center gap-1 rounded-4xl px-2.5 font-mono text-label leading-4 font-medium whitespace-nowrap';

export const chipClass = `${base} bg-brand-soft text-brand-text hover:bg-brand/20 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none`;
export const tagClass = `${base} bg-muted text-foreground`;
