# AGENTS.md

Instructions for coding agents working in this repository. Claude Code loads this through `CLAUDE.md`; other tools read it directly. Keep it under 100 lines.

## What this is

jrobitaille.dev, Jason Robitaille's personal site: `/` (hero, about, experience timeline, selected work, skills, contact), `/projects`, `/resume.pdf`, and a 404. Static, fast, truthful, finished. The repo is public and part of the point: clean code and a visible, real agentic build process.

Non-goals: blog, contact form, CMS, backend, analytics dashboards, 3D hero, animation showcase, LinkedIn auto-sync.

## Stack

| Layer     | Choice                                                                                 |
| --------- | -------------------------------------------------------------------------------------- |
| Framework | Next.js 16 App Router, `output: 'export'`, React Compiler on                           |
| Language  | TypeScript strict with `noUncheckedIndexedAccess`                                      |
| Styling   | Tailwind CSS v4, CSS-first `@theme` in `src/styles/globals.css`; shadcn on Base UI     |
| Design    | `DESIGN.md` at the root is the design authority (D16); its tokens mirror `globals.css` |
| Content   | `src/content/*.ts` typed with zod, validated by a Vitest test (Phase 2)                |
| Tests     | Vitest (unit), Playwright + axe (e2e, 390 and 1280 px)                                 |
| Quality   | ESLint 9 flat config, Prettier 3 + Tailwind plugin, knip                               |
| Hosting   | Cloudflare Workers static assets, `wrangler.jsonc`, GitHub Actions deploy              |
| Runtime   | Node 24 (`.nvmrc`), npm                                                                |

## Commands

- `npm run dev` local dev server
- `npm run lint`, `npm run format`, `npm run knip`, `npm run typecheck`
- `npm test` unit tests (seconds; the Stop hook runs these)
- `npm run build` static export to `./out`
- `npm run e2e` Playwright + axe against `./out` served by `wrangler dev`
- `npm run check` every gate in CI order: format:check, lint, knip, typecheck, test, build, e2e

## Engineering rules

- **Static first.** Every page is a Server Component rendered at build. Client components only for: WebMCP registration, mobile nav sheet, the skills word cloud, the easter egg. Each `'use client'` file carries a comment saying why. Islands receive data as props or fetch the public JSON; they never import content modules (a unit test under `src/components/islands/` enforces it).
- **No `useEffect` for data or layout.** Content is imported, never fetched. Use CSS (`@supports`, container queries) before any DOM measurement; a ref-based layout effect is the last resort and must be justified in a comment.
- **No layout shift.** Explicit `width`/`height` on every image, `next/font`, no late-loading fonts or icons, reserve space for anything that hydrates. CLS budget is 0.
- **Small files.** Components under ~150 lines, files under ~200. One component per file, props typed with a `Props` suffix, named exports except Next.js route files.
- **Accessibility.** Semantic landmarks, one `h1` per page, skip link, visible `:focus-visible`, WCAG AA contrast in both color schemes, `prefers-reduced-motion` honored, ARIA only where native semantics fall short, keyboard-navigable everything. Lighthouse a11y 100 and axe clean are CI gates.
- **Browser support.** Evergreen (last 2 of Chrome, Edge, Firefox, Safari). Rely on Next's modern default compile target; revisit if a browserslist is ever needed (D10). Progressive enhancement for scroll-driven animations and `<ViewTransition>`.
- **SEO built in.** `metadata` per page, JSON-LD `Person` and `WebSite` on home, `sitemap.ts`, `robots.ts` permissive including AI crawlers, `manifest.ts`, favicon set, `llms.txt`.
- **Performance budget.** Initial JS under 150 KB gzipped on home for evergreen browsers: the scripts the exported HTML references plus anything fetched before the load event with no interaction (the Next and React runtime is 143.8 KB of that; the island loader about 2 KB; the cost of choosing Next over a zero-JS framework for its hiring signal, D1 and D14). Every island loads after idle, on intersection or on user action and has its own named lazy budget in `e2e/budgets.spec.ts` (D17). LCP under 2.0 s on throttled 4G (the mobile LCP element is the About paragraph; Lighthouse's simulated score is a known text-LCP artifact, D14). Lazy islands must not move LCP or CLS.
- **Security headers** via Cloudflare `_headers`: CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.
- **Public content rules.** Every public string is checked against `.claude/rules/content.md`. Never reintroduce removed content.
- **Design authority.** Read `DESIGN.md` before any UI change. It describes what `main` renders: tokens only (no hex in components), the palette, type scale, radii and the composition. `npm run design:lint` and the token test keep it equal to `globals.css`.
- **Design changes ship as code.** A change to `DESIGN.md` that alters rendering ships as its own PR; before and after visual-check runs are taken on `main` and on the branch, kept under `.visual/`, and the PR body states what differs per pair. Screenshots are never attached or committed. A documentation PR changes no pixels.
- **Content sync.** Content mirrors the current master resume and public profile text; update both together. The page renders highlights and blurbs only; the full experience detail is kept for the agent-facing data (D12).

## Public repo

Commit messages, PR titles and PR bodies describe the change only. Never reference files, folders, documents, conversations or tooling outside this repository, and never use the owner's name in comments.

## Token discipline

- Deterministic first: tsc, eslint, vitest, axe, Lighthouse are free. Hooks run only those, never a model.
- Model-driven agents (`reviewer`, auditors) run on demand at milestones. Nothing model-driven fires on Stop or on a schedule.
- Right-sized models: Sonnet for auditors, Opus or Fable for the main thread and `reviewer`.
- Small context: path-scoped rules, subagents return summaries not transcripts, `/clear` between features.
- One-shot demos stay one-shot.

## Process per feature

Plan (plan mode), implement with tests first for `lib/` and `content/`, `npm run check`, PR, CI, `reviewer` on request, preview URL, squash merge. Tick `docs/PLAN.md` as items ship.

## Definition of done

- `npm run check` green locally and in CI.
- No new `'use client'` without a justifying comment. No `useEffect`.
- New `lib/` or `content/` code has a test that was written first.
- Public strings pass `.claude/rules/content.md`.
- `docs/PLAN.md` ticked for whatever shipped.

## Where things are

- `DESIGN.md` design tokens and rules (D16); `docs/SPEC.md` what and why, `docs/DECISIONS.md` D1 onward, `docs/PLAN.md` phase checklist.
- `.claude/rules/` path-scoped rules, `.claude/agents/` subagents, `.claude/settings.json` hooks, `.mcp.json` MCP servers.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
