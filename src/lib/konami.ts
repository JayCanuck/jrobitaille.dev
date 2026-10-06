// The Konami detector (D14 amendment): a pure step function over KeyboardEvent.key values. No
// dependency; the previous site's detector library was 1.5 KB for these lines.
export const KONAMI_SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a'
] as const;

const MODIFIER_KEYS = new Set(['Shift', 'Control', 'Alt', 'Meta', 'AltGraph', 'CapsLock', 'Fn']);

// The progress after `key`: how many sequence keys are matched. Modifier keys change nothing; a
// miss keeps the longest tail that still starts the sequence (three Ups count as two), else 0.
export const advance = (progress: number, key: string): number => {
  if (MODIFIER_KEYS.has(key)) return progress;
  const pressed = key.length === 1 ? key.toLowerCase() : key;
  if (pressed === KONAMI_SEQUENCE[progress]) return progress + 1;
  const keys = [...KONAMI_SEQUENCE.slice(0, progress), pressed];
  for (let n = Math.min(keys.length, KONAMI_SEQUENCE.length - 1); n > 0; n--) {
    if (keys.slice(-n).every((k, i) => k === KONAMI_SEQUENCE[i])) return n;
  }
  return 0;
};

export const isComplete = (progress: number) => progress === KONAMI_SEQUENCE.length;
