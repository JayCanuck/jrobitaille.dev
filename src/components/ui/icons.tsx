import type { SVGProps } from 'react';

// The two brand marks lucide no longer ships. Plain inline SVGs in lucide's stroke style so they
// sit beside its FileText in the hero; decorative, the link text carries the name.
// Both glyphs' ink runs from y 2 to 22 of the 24-unit box once the LinkedIn shapes are moved down
// half a unit, so the two ink centres match; the viewBox then starts half a unit above zero, which
// drops both glyphs 0.4 px so their ink centres sit on the label's x-height rather than the line box.
const base: SVGProps<SVGSVGElement> = {
  viewBox: '0 -0.5 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true
};

export function GithubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M16 8.5a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9.5" />
      <circle cx="4" cy="4.5" r="2" />
    </svg>
  );
}
