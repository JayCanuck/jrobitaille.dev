// Stop hook: block "done" until typecheck, lint and unit tests pass. Deterministic, seconds, no model (AGENTS.md token rules).
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

let input = '';
for await (const chunk of process.stdin) input += chunk;

let event = {};
try {
  event = JSON.parse(input);
} catch {
  // No event payload: nothing to gate on.
}

// Nothing to check before the scaffold exists.
if (!existsSync('package.json') || !existsSync('node_modules')) process.exit(0);

const failures = [];
for (const script of ['typecheck', 'lint', 'test']) {
  const result = spawnSync('npm', ['run', '--silent', script], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: process.platform === 'win32'
  });
  if (result.status !== 0) {
    failures.push(
      `npm run ${script} failed:\n${result.stdout}${result.stderr}`.trim().slice(-3000)
    );
  }
}

if (failures.length === 0) process.exit(0);

// stop_hook_active means this stop was already blocked once this turn: report instead of blocking again (loop guard).
if (event.stop_hook_active === true) {
  process.stdout.write(
    `Stop gate still failing; fix before the next commit.\n${failures.join('\n\n')}\n`
  );
  process.exit(0);
}

process.stderr.write(`Stop gate: fix these before finishing.\n${failures.join('\n\n')}\n`);
process.exit(2);
