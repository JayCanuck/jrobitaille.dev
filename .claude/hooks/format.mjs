// PostToolUse hook: Prettier the file Claude just edited or wrote. Deterministic, no model (AGENTS.md token rules).
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { extname } from 'node:path';

const FORMATTABLE = new Set([
  '.ts',
  '.tsx',
  '.mts',
  '.js',
  '.mjs',
  '.cjs',
  '.json',
  '.jsonc',
  '.css',
  '.md',
  '.yml',
  '.yaml'
]);
const PRETTIER = 'node_modules/prettier/bin/prettier.cjs';

let input = '';
for await (const chunk of process.stdin) input += chunk;

let filePath;
try {
  filePath = JSON.parse(input).tool_input?.file_path;
} catch {
  process.exit(0);
}

if (
  typeof filePath !== 'string' ||
  !existsSync(filePath) ||
  !existsSync(PRETTIER) ||
  !FORMATTABLE.has(extname(filePath))
) {
  process.exit(0);
}

try {
  execFileSync(process.execPath, [PRETTIER, '--write', '--log-level', 'warn', filePath], {
    stdio: 'inherit'
  });
} catch {
  // A half-finished edit may not parse yet; formatting is advisory and must never block the tool.
  process.exit(0);
}
