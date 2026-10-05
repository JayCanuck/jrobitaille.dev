// DESIGN.md: tokens only, no hex values inside components (D16). The stylesheet holds the values;
// the manifest and the Open Graph image are built outside it (a manifest colour must be a literal
// and the image renderer cannot read CSS variables), so those two files are the only exceptions.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('../../', import.meta.url));
const src = join(root, 'src');

const ALLOWED = new Set([
  'src/styles/globals.css',
  'src/styles/tokens.css',
  'src/app/manifest.ts',
  'src/app/opengraph-image.tsx'
]);

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

// A # followed by 3, 4, 6 or 8 hex digits and then a non-word character: a colour, not an anchor
// like #main or a grid row like row-start-7.
const HEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/g;

describe('no hex colours outside the stylesheet', () => {
  it('finds nothing under src/', () => {
    const offenders = walk(src)
      .filter(path => /\.(ts|tsx|css)$/.test(path) && !path.endsWith('.test.ts'))
      .map(path => ({
        path: relative(root, path).split(sep).join('/'),
        text: readFileSync(path, 'utf8')
      }))
      .filter(({ path }) => !ALLOWED.has(path))
      .flatMap(({ path, text }) => (text.match(HEX) ?? []).map(hex => `${path}: ${hex}`));
    expect(offenders).toEqual([]);
  });
});
