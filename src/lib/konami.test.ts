import { describe, expect, it } from 'vitest';

import { advance, isComplete, KONAMI_SEQUENCE } from '@/lib/konami';

const run = (keys: string[], from = 0) =>
  keys.reduce((progress, key) => advance(progress, key), from);

describe('the Konami detector', () => {
  it('accepts the sequence', () => {
    expect(isComplete(run([...KONAMI_SEQUENCE]))).toBe(true);
  });

  it('accepts the letters in either case', () => {
    expect(isComplete(run([...KONAMI_SEQUENCE.slice(0, 8), 'B', 'A']))).toBe(true);
  });

  it('rejects a wrong order', () => {
    const wrong = [...KONAMI_SEQUENCE.slice(0, 8), 'a', 'b'];
    expect(isComplete(run(wrong))).toBe(false);
    expect(run(wrong)).toBe(0);
  });

  it('resets after a miss and starts again from the first key', () => {
    const progress = run(['ArrowUp', 'ArrowUp', 'ArrowDown', 'x']);
    expect(progress).toBe(0);
    expect(isComplete(run([...KONAMI_SEQUENCE], progress))).toBe(true);
    // A miss that is itself the first key begins a new attempt.
    expect(run(['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowUp'])).toBe(1);
  });

  it('keeps the longest matching run after an extra first key', () => {
    expect(run(['ArrowUp', 'ArrowUp', 'ArrowUp'])).toBe(2);
    expect(isComplete(run(['ArrowUp', ...KONAMI_SEQUENCE]))).toBe(true);
  });

  it('ignores modifier keys between the sequence keys', () => {
    const withModifiers = KONAMI_SEQUENCE.flatMap(key => ['Shift', key, 'Control']);
    expect(isComplete(run(withModifiers))).toBe(true);
    expect(run(['ArrowUp', 'Meta', 'Alt', 'CapsLock'])).toBe(1);
  });

  it('is complete only at the full length', () => {
    expect(isComplete(0)).toBe(false);
    expect(isComplete(KONAMI_SEQUENCE.length - 1)).toBe(false);
    expect(isComplete(KONAMI_SEQUENCE.length)).toBe(true);
  });
});
