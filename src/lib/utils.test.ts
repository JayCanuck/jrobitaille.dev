import { describe, expect, it } from 'vitest';

import { cn } from '@/lib/utils';

// The merge must know the project's fluid type tokens as font sizes, not colours (D15 amendment).
describe('cn', () => {
  it('keeps a font-size token beside a text colour', () => {
    expect(cn('text-label', 'text-foreground')).toBe('text-label text-foreground');
    expect(cn('text-label', 'text-brand-text')).toBe('text-label text-brand-text');
  });

  it('lets a later font-size token replace an earlier font size', () => {
    expect(cn('text-xs', 'text-label')).toBe('text-label');
    expect(cn('text-body', 'text-sm')).toBe('text-sm');
  });

  it('still resolves ordinary conflicts', () => {
    expect(cn('h-9', 'h-10')).toBe('h-10');
    expect(cn('px-2', 'px-4', ['rounded-lg', 'rounded-full'])).toBe('px-4 rounded-full');
  });
});
