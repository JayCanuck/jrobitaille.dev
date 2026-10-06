'use client';
// Why a client component: the List/Cloud control (D18) holds the view state the island owns and
// exists only once the cloud has mounted; before that the chips are the only view. Its labels are
// props from the Server Component, never a content import.

export type SkillsView = 'list' | 'cloud';

export interface ViewToggleLabels {
  list: string;
  cloud: string;
}

interface ViewToggleProps {
  view: SkillsView;
  labels: ViewToggleLabels;
  onChange: (view: SkillsView) => void;
}

// Mono label scale like the header links; plain class strings so the island stays free of the
// class-merge dependency.
const buttonClass =
  'flex h-7 cursor-pointer items-center rounded-sm font-mono text-label font-medium tracking-wider uppercase hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none';

export function ViewToggle({ view, labels, onChange }: ViewToggleProps) {
  const options: [SkillsView, string][] = [
    ['list', labels.list],
    ['cloud', labels.cloud]
  ];
  return (
    <>
      {options.map(([value, label]) => (
        <button
          key={value}
          type="button"
          aria-pressed={view === value}
          onClick={() => {
            onChange(value);
          }}
          className={`${buttonClass} ${view === value ? 'text-foreground underline decoration-brand underline-offset-4' : 'text-muted-foreground'}`}
        >
          {label}
        </button>
      ))}
    </>
  );
}
