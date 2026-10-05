@AGENTS.md

Claude-specific notes: hooks in `.claude/settings.json` run Prettier after every edit and gate Stop on typecheck, lint and unit tests; fix failures instead of working around them. Use the `reviewer` subagent before a PR, on request only.
