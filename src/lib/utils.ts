import { type ClassNameValue, extendTailwindMerge } from 'tailwind-merge';

// Class merging for every component and primitive. tailwind-merge does not know this project's
// font-size tokens (globals.css `--text-label`, `--text-body`, `--text-h2`, `--text-display`), and an
// unknown `text-*` class is treated as a colour, so `text-label` would be dropped whenever a text
// colour followed it. Teaching the font-size group those four names keeps size and colour separate.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['label', 'body', 'h2', 'display'] }]
    }
  }
});

export const cn = (...inputs: ClassNameValue[]) => twMerge(...inputs);
