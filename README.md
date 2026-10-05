# jrobitaille.dev

Personal site of Jason Robitaille, Staff Software Engineer. Two routes (`/`, `/resume.pdf`) and a 404, built as a static export and served from Cloudflare's edge. The code is MIT; the site content is Jason's.

**Status:** Phase 3 design. Styled, accessible and measured; the WebMCP island and word cloud land in Phase 4 (`docs/PLAN.md`).

## Stack

Next.js 16 (App Router, `output: 'export'`, React Compiler), TypeScript strict, Tailwind CSS v4, shadcn/ui on Base UI, Vitest, Playwright + axe, ESLint 9, Prettier 3, knip. Hosted on Cloudflare Workers static assets, deployed by GitHub Actions. Node 24, npm.

Nearly everything is a Server Component rendered at build time, so the shipped JavaScript is Next's runtime baseline plus a small number of deliberate client islands (added in Phase 4). That baseline is the whole bill: evergreen browsers load 143.8 KB gzipped of React DOM, the React Flight client and the Next app router, plus an 11 KB inline payload, and 0 KB of site code. The budget is 150 KB. A zero-JS framework would ship a few KB for the same page; Next was chosen anyway for the hiring signal of a public, well-built Next.js codebase. The trade is recorded in `docs/DECISIONS.md` (D1, D14).

## Run it

```sh
nvm use            # Node 24, from .nvmrc
npm ci
npm run dev        # http://localhost:3000
npm run check      # every gate: format, lint, knip, typecheck, unit, build, e2e + axe
```

`npm run e2e` serves `./out` with `wrangler dev`, so run `npm run build` first (or use `npm run check`).

## How this was built

The site is built with Claude Code, and the build process is part of the repo. Three tiers, each real and each used:

1. **Native harness, in-repo.** `AGENTS.md` carries the rules every agent follows; `CLAUDE.md` imports it. Path-scoped rules in `.claude/rules/` load only when matching files are touched. Subagents in `.claude/agents/` are evaluators (a `reviewer` so far). Hooks in `.claude/settings.json` are deterministic only: Prettier after every edit, and typecheck + lint + unit tests before Claude can call a turn done. No model runs in a hook.
2. **Agents in CI.** GitHub Actions runs the deterministic gates on every PR. Claude Code Action handles PR review when a `review` label is applied, not on every push. Dependabot runs weekly.
3. **One-shot method demos.** Spec-driven development, a dynamic multi-agent workflow, and a post-deploy SEO audit, each run once and logged here as the phases ship.

What was deliberately not done: scheduled model runs, model-driven hooks, agent frameworks with hundreds of skills, a three.js hero. Costs and token notes are filled in as each phase lands.

## Repository map

| Path                      | Why it exists                                                               |
| ------------------------- | --------------------------------------------------------------------------- |
| `AGENTS.md` / `CLAUDE.md` | Agent instructions (open standard) and the Claude import of it              |
| `docs/`                   | `SPEC.md` what and why, `DECISIONS.md` D1 onward, `PLAN.md` phase checklist |
| `.claude/`                | Path-scoped rules, subagents, hooks, hook scripts                           |
| `.mcp.json`               | MCP servers used during development: Playwright and Chrome DevTools         |
| `src/app/`                | Routes, metadata, `robots.ts`, `sitemap.ts`                                 |
| `src/components/ui/`      | shadcn-installed primitives (owned source)                                  |
| `src/content/`            | Typed content (`schema.ts`, `resume.ts`, `experience.ts`, `projects.ts`)    |
| `src/lib/`                | Pure helpers: `site.ts` (origin), `json-ld.ts`                              |
| `src/styles/globals.css`  | Tailwind v4 theme tokens                                                    |
| `e2e/`                    | Playwright + axe tests                                                      |
| `package.json`            | Scripts (`check` runs every gate), Node 24 pin via `engines`                |
| `components.json`         | shadcn CLI config: Base UI, Nova preset, `src/` aliases                     |
| `wrangler.jsonc`          | Cloudflare Workers static-assets config (custom domain added in Phase 5)    |
| `.github/`                | `ci.yml` gates, `deploy.yml` to Workers, `dependabot.yml`                   |

## License

Code: [MIT](LICENSE). Site content (resume text, images, copy): all rights reserved.
