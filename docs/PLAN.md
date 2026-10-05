# Plan

Phase checklist. Tick items as they ship so a fresh session knows where things stand. Scope creep is the only real risk; this file is the brake.

## Phase 0: setup

Done 2026-10-04: decisions D1 to D3, empty repo, Cloudflare zones and secrets, WebMCP origin-trial token, tooling check.

## Phase 1: scaffold

- [ ] `create-next-app` (TypeScript, App Router, Tailwind v4, `src/`, npm) with `output: 'export'`, `images.unoptimized`, React Compiler, Node 24 pinned
- [ ] shadcn init on Base UI; Button, Card, Badge only
- [ ] ESLint 9 flat config, Prettier 3 + Tailwind plugin, knip; npm scripts `dev build lint format typecheck test e2e check`
- [ ] Vitest smoke test; Playwright + axe at 390 and 1280 px against the built output
- [ ] `AGENTS.md`, `CLAUDE.md`, `docs/`, `.claude/rules/`, `.claude/agents/reviewer.md`, hooks, `.mcp.json`
- [ ] Placeholder home page with metadata, `robots.ts`, `sitemap.ts`
- [ ] `wrangler.jsonc` for Workers static assets (no custom domain)
- [ ] `ci.yml`, `deploy.yml`, Dependabot, README stub
- [ ] First commit pushed, CI green, placeholder served at the workers.dev URL
- [ ] Claude Code GitHub workflows added; review gated on the `review` label
- [ ] `main` protected; first PR merged through the pipeline

## Phase 2: content model and pages

- [ ] `src/content/schema.ts` (zod) with a Vitest test; `resume.ts`, `projects.ts`
- [ ] Hero, about, experience timeline, selected work, skills chips, footer
- [ ] `/projects` page, 404 page, `public/resume.pdf`
- [ ] Everything Server Components; content complete, no styling polish

## Phase 3: design, accessibility, SEO, performance

- [ ] Theme (tweakcn), typography, timeline motion behind `@supports` and reduced motion
- [ ] Responsive pass at 390, 768, 1280, 1920, 2560
- [ ] axe clean on every page; Lighthouse 95 / 100 / 100 / 100
- [ ] Metadata per page, JSON-LD, OG image, `manifest.ts`, `llms.txt`, `_headers`, browserslist
- [ ] Lighthouse CI and link check in CI; `reviewer` pass

## Phase 4: WebMCP island, word cloud, loop demo

- [ ] WebMCP tools from content, polyfill fallback, badge, `/api/profile.json`, Vitest coverage, origin-trial meta
- [ ] Skills word cloud island (lazy, reduced-motion aware, `aria-hidden` canvas)
- [ ] `lighthouse-loop` bounded autonomous-loop demo; dynamic-workflow demo
- [ ] README "How this was built" filled in with costs

## Phase 5: cut-over

- [ ] Workers custom domain `jrobitaille.dev` plus `www` redirect; remove GitHub Pages records and old CNAME
- [ ] Tag `gatsby-final` and strip the old site from the profile repo
- [ ] `.com` and `.cv` redirects confirmed; Web Analytics beacon; SEO audit; Search Console submit

## Phase 5b (optional): multi-agent targets

- [ ] rulesync import, generate for tested targets only, CI drift check
