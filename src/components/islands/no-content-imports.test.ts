// Islands receive their data as props or fetch the public JSON; they never import content modules
// (AGENTS.md, D18). This walks every island directory and fails on an import of src/content or of
// the data builder, including type-only imports, so a resume string can never ride into a chunk.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ISLAND_DIRS = [
  'src/components/islands',
  'src/components/cloud',
  'src/components/konami',
  'src/components/webmcp'
];

const FORBIDDEN = [/['"]@\/content\//, /['"](\.\.\/)+content\//, /profile-data['"]/];

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

const sources = ISLAND_DIRS.filter(dir => existsSync(dir))
  .flatMap(dir => walk(dir))
  .filter(path => /\.(ts|tsx)$/.test(path) && !path.endsWith('.test.ts'));

describe('island directories', () => {
  it('exist and hold source files', () => {
    expect(sources.length).toBeGreaterThan(3);
  });

  it.each(sources)('%s imports no content module and no data builder', path => {
    const source = readFileSync(path, 'utf8');
    const imports = source.match(/^(import|export)\b[^;]*from\s+['"][^'"]+['"]/gm) ?? [];
    const offenders = imports.filter(line => FORBIDDEN.some(pattern => pattern.test(line)));
    expect(offenders).toEqual([]);
    expect(source).not.toMatch(/import\(\s*['"]@\/content\//);
  });
});
