# jrobitaille.dev

Source of [jrobitaille.dev](https://jrobitaille.dev), a one-page static personal site, and a working, inspectable record of how it was built with coding agents.

[![CI](https://github.com/JayCanuck/jrobitaille.dev/actions/workflows/ci.yml/badge.svg)](https://github.com/JayCanuck/jrobitaille.dev/actions/workflows/ci.yml)

## What this repo is

A personal site: one page, a resume PDF and a 404, rendered to static files at build time and served from Cloudflare Workers static assets. Everything on the page is a Server Component; the shipped JavaScript is the framework runtime and nothing else. The stack is in the table below.

The repo also doubles as a place to try agentic development practices in the open. Every decision, budget and guardrail is committed, so the process can be read and not just the result: `docs/DECISIONS.md` is the running log of decisions with their measurements, and `docs/PLAN.md` is the phase checklist that says what has shipped.

## Stack

| Layer           | Choice                                                                                  |
| --------------- | --------------------------------------------------------------------------------------- |
| Framework       | Next.js 16.3.8, App Router, `output: 'export'`, React 19.3.0 with the React Compiler    |
| UI              | shadcn ^4.21.1 on @base-ui/react ^1.8.0, lucide-react ^1.52.0                           |
| Styling         | Tailwind CSS ^4 through @tailwindcss/postcss, tokens in `src/styles/globals.css`        |
| Type system     | TypeScript ^6.0.3 strict with `noUncheckedIndexedAccess`; content typed with zod ^4.6.5 |
| Lint and format | ESLint ^10.12.0 flat config, typescript-eslint ^8.71.0, Prettier ^3.9.9, knip ^6.39.0   |
| Tests           | Vitest ^5.0.3, Playwright ^1.63.0 with @axe-core/playwright ^4.13.0, @lhci/cli ^0.15.1  |
| Hosting         | Cloudflare Workers static assets, wrangler ^4.147.0, `wrangler.jsonc`                   |
| CI              | GitHub Actions: `ci.yml`, `deploy.yml`, `links.yml`, Dependabot weekly                  |

## How this was built

### The harness, in three tiers

1. **Deterministic gates first.** Hooks in `.claude/settings.json` run Prettier after every edit (`.claude/hooks/format.mjs`) and block the agent from calling a turn done until typecheck, lint and unit tests pass (`.claude/hooks/stop-gate.mjs`). `npm run check` runs every gate in CI order, and `.github/workflows/ci.yml` runs the same command on every pull request.
2. **Path-scoped rules second.** `.claude/rules/` holds four rule files that load only when matching files are touched: accessibility and styling for components, public content rules for the content files and routes, and test-first for `src/lib/` and `src/content/`.
3. **Model-driven review last.** `.claude/agents/reviewer.md` is an adversarial reviewer that runs on request before a PR, never on every change. `.claude/skills/visual-check/SKILL.md` screenshots the built site for a human to look at. `.github/workflows/claude-code-review.yml` runs a review only when a maintainer adds the `review` label.

The order is the cheapest one: compilers, linters and test runners are free and catch most mistakes, so a model is only asked to look at what they cannot judge.

### Which file does what

- `AGENTS.md` is the vendor-neutral instruction set: stack, engineering rules, token discipline, process and definition of done. `CLAUDE.md` imports it and adds the Claude-specific notes.
- `DESIGN.md` is the design source of truth: tokens in YAML front matter and the rules in prose, kept equal to the stylesheet by `src/styles/tokens.test.ts`.
- `docs/SPEC.md` is the scope: what the site is, what it is not, and how it is built.
- `docs/DECISIONS.md` is the ADR-lite log; `docs/PLAN.md` is the phase checklist.
- `.mcp.json` registers the browser tooling the agent uses during development: Playwright and Chrome DevTools.

### Decisions that were measured rather than assumed

Each row has a full entry in `docs/DECISIONS.md`.

| Decision                              | What was measured                                                                                                                      | Outcome                                                                                         |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Whether to set a `browserslist`       | Export size with Next's default target versus a `last 2 versions` query: 565,368 B raw / 170,007 B gzip versus 608,547 B / 180,878 B   | No `browserslist`; the query downlevelled everything for 11 KB more over the wire               |
| Whether to inline the stylesheet      | About 30 KB of CSS, roughly 4 mobile Lighthouse performance points on first load, against a `style-src 'self'` CSP                     | Stylesheet stays external; the strict CSP is worth more than the points                         |
| Server Components versus a client app | Home-page JavaScript, gzipped: 116.8 KB React and router, 27.0 KB Next helpers, 11.4 KB inline payload, 0 KB site code                 | 143.8 KB of external scripts against a 150 KB budget, held by an e2e guard                      |
| Whether the LCP budget is met         | About paragraph paints at 140 ms unthrottled and 1.9 s under DevTools throttling; Lighthouse's simulation reports 3.2 s and a 93 score | Budget kept at 2.0 s; the simulated score is a known text-LCP artifact, kept as a warning in CI |
| Documentation-only design change      | Pixel comparison of eight visual-check captures (four widths, two schemes) against `main`                                              | Zero differing pixels; the design document describes what ships, it does not lead it            |
| Which WebMCP polyfill to pin          | Bundled gzipped size of the full package against the core polyfill: 73.5 KB (bundles an MCP server and transports) versus 8.0 KB       | The core polyfill only, loaded only when no native API exists; measured 7.8 KB in the export    |

### Budgets and how they are enforced

| Budget                                                                | Where it is enforced                                                                         |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Accessibility, best practices and SEO at 1.0                          | `lighthouserc.json`, asserted as errors in CI on every pull request                          |
| FCP 1.5 s, Speed Index 2 s, TBT 200 ms, CLS 0                         | `lighthouserc.json`, asserted as errors; performance category at 0.95 as a warning           |
| Home JavaScript under 150 KB gzipped                                  | `e2e/budgets.spec.ts`: scripts the HTML references plus anything fetched before load         |
| WebMCP island 10 KB, polyfill 12 KB, JSON 24 KB                       | `e2e/budgets.spec.ts`: one named lazy budget per set, each on its own trigger                |
| Cumulative layout shift of 0                                          | `e2e/budgets.spec.ts` at four viewports, before and after the islands mount, plus Lighthouse |
| Client components only in the island directories, no effects anywhere | `e2e/budgets.spec.ts`: an allowlist, and every `'use client'` file states why                |
| Strict CSP with hashed inline scripts                                 | `scripts/headers.mjs` writes `_headers` after every build; `e2e/budgets.spec.ts` checks it   |
| LCP under 2.0 s on throttled 4G                                       | A stated budget (`AGENTS.md`), measured in the decisions log rather than asserted in CI      |
| Design tokens equal to the stylesheet                                 | `src/styles/tokens.test.ts`; `npm run design:lint` validates `DESIGN.md`                     |

### Token and cost discipline

- Deterministic checks run before any model is asked: the hooks and `npm run check` are compilers, linters and test runners only, and no hook calls a model (`.claude/settings.json`, `AGENTS.md`).
- The one model-driven agent in the repo, `reviewer`, runs on Opus on request only (`.claude/agents/reviewer.md`). `AGENTS.md` reserves smaller models for audit-style agents as they are added.
- Model-driven work in CI is triggered, not scheduled: the review workflow needs the `review` label and `claude.yml` needs an `@claude` mention. The monthly job, `links.yml`, is a link checker with no model.
- One-shot method demos stay one-shot by rule (`AGENTS.md`), and each is recorded as measured token usage with list-price equivalents, never as a bill: the dynamic-workflow run that wrote the eight WebMCP tool handlers (`docs/demos/workflow-webmcp-tools.md`) used 1,655,365 tokens by the agent transcripts (64 input, 8,609 output, 1,330,979 cache read, 315,713 cache write), a $1.35 list-price equivalent at the published rates of 2026-10-05 stated beside it. Two observations from that single run sit next to the numbers: the one Opus review found the finding that mattered (every handler returned references into the shared data, fixed once in the shared helper), which the eight workers' own tests could not see; and the fan-out bought wall time (eight files in 48 s) while its token spend was dominated by re-reading shared context, with no sequential baseline measured to say anything about token efficiency. The run's own summary reported a different per-agent figure that turned out to be the final context size, not summed usage; the record keeps that as a finding.

## What was deliberately not done

- No model-driven hooks: hooks run tsc, eslint and vitest only, so every turn costs no tokens beyond the work itself (`AGENTS.md`, `.claude/settings.json`).
- PR review gated behind a label instead of automatic, so review tokens are spent on milestones, not every push (`.github/workflows/claude-code-review.yml`).
- No always-on multi-agent orchestration: subagents are evaluators that run on request, and demos are one-shot (`AGENTS.md`).
- No client-side framework for the initial render: every page is a Server Component rendered at build, and the JavaScript that ships is the framework baseline.
- No analytics beyond what the hosting provides: Cloudflare Web Analytics and Search Console, no Google Analytics.
- No dark mode toggle: the scheme follows `prefers-color-scheme`.
- No `browserslist`: Next's default target already matches the evergreen intent with the smallest output.

## Status

The current phase and what has shipped are in `docs/PLAN.md`.

## Development

Node 24 (`.nvmrc`, `engines` in `package.json`) and npm 10 or newer.

| Script                 | What it does                                                               |
| ---------------------- | -------------------------------------------------------------------------- |
| `npm run dev`          | Local dev server                                                           |
| `npm run build`        | Static export to `./out`, then writes `out/_headers` with the hashed CSP   |
| `npm run lint`         | ESLint                                                                     |
| `npm run format`       | Prettier, write mode; `format:check` is the CI form                        |
| `npm run design:lint`  | Validates `DESIGN.md` against the format                                   |
| `npm run typecheck`    | Generates route types, then `tsc --noEmit`                                 |
| `npm run knip`         | Unused files, exports and dependencies                                     |
| `npm test`             | Vitest unit tests                                                          |
| `npm run e2e`          | Playwright and axe against `./out` served by `wrangler dev`; build first   |
| `npm run images`       | Regenerates AVIF and WebP images and their dimensions from `assets/images` |
| `npm run visual-check` | Screenshots the built site at several widths in both schemes for review    |
| `npm run lighthouse`   | Lighthouse CI against the built site                                       |
| `npm run check`        | Every gate in CI order                                                     |

`WEBMCP_ORIGIN_TRIAL_TOKEN` is an optional build-time variable (a GitHub repository variable in `deploy.yml`, not a secret, since an origin-trial token is bound to the origin and public): when set, the layout emits the Chrome origin-trial meta tag for WebMCP; when absent, nothing is emitted.

Claude Code, or any agent that reads `AGENTS.md`, is expected to read it first.

## Credits and license

Code: [MIT](LICENSE). Site content (resume text, images, copy): all rights reserved.
