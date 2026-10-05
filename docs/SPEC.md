# jrobitaille.dev: specification

What the site is, what it is not, and how it is built. Decisions live in `DECISIONS.md`; the phase checklist in `PLAN.md`. If it is not in this repo, an agent cannot see it.

## 1. Goals and non-goals

**Goal:** a visitor lands on jrobitaille.dev and within 10 seconds knows who Jason is (Staff Software Engineer; full-stack, platform and developer tooling; 15+ years), where to click (Resume PDF, LinkedIn, GitHub), and sees 5 to 6 proof-linked projects. Engineers who open the repo see a clean, modern, deliberate codebase and a demonstrable agentic build process.

**The site confirms, it does not convert.** It must be fast, clean, truthful and finished. Nothing here is worth a week.

**Non-goals:** blog, contact form, CMS, backend, analytics dashboards, 3D hero, animation showcase, "writing" page, auto-sync from LinkedIn. A small React Three Fiber island may be added later if it ever matters.

## 2. Information architecture and content

```
/              hero, about, experience timeline, selected work (5), open source, contact footer
/projects      all project cards with full blurbs and proof links
/resume.pdf    static file, swapped per build
/404
```

- **Hero:** name, "Staff Software Engineer", one line ("Full-Stack, Platform & Developer Tooling · 15+ yrs shipping web products"), location line "Mountain View, CA · remote or Bay Area", three buttons (Resume PDF, LinkedIn, GitHub), availability line "Open to full-stack, platform or developer tooling roles".
- **About:** the LinkedIn About text, verbatim (~160 words).
- **Experience timeline:** one node per era, newest first: RetailVerse 2025 to 2026, 3D asset platform 2022 to 2026, SVL Simulator 2020 to 2022, Enact 2017 to 2020, Enyo 2015 to 2017, Experis contract 2013 to 2015, Canuck Coding 2009 to 2013. Each node: era name, years, one-line descriptor, 2 to 3 bullets, proof link where public. Title ladder (Software Engineer, Senior, Staff) as a rail label.
- **Project cards, in order:** RetailVerse Web (LG press release + a live LG.com page); @enact/cli and Enact release engineering (GitHub, npm); SVL Simulator cloud platform (archived GitHub, svlsimulator.com); 3D asset platform (internal, no proof link, says so); webOS homebrew (WebOS Quick Install, Internalz; GitHub, LG docs page); current personal work (gamelist-utils, muos.js; GitHub, npm). Home shows the first five; `/projects` shows all six plus a short "also" line. Each card: what it is, what Jason did, one outcome, link. No download counts, no internal metrics, no patents, company figures attributed to the company.
- **Skills:** grouped text chips in five groups (Languages, Frontend, Backend and data, Build and tooling, CI and cloud). No bars, no logo wall.
- **Skills word cloud:** the one flourish. A React Three Fiber floating cloud of the same terms, no metrics. Lazily loaded client island below the fold, imported after idle and when the section nears the viewport (the one justified dynamic import + IntersectionObserver, because it gates ~150 KB); `prefers-reduced-motion` disables it; the chip list is the no-JS and screen-reader version; canvas is `aria-hidden`; plain WebGL renderer. Built in Phase 4 so it never blocks launch.
- **Footer:** email, GitHub, LinkedIn, npm, "Jason Robitaille (JayCanuck)" plain text as the search anchor.
- **Easter egg:** Konami code as a lazily loaded client island.

## 3. Design direction

Quiet, typographic, generous whitespace, one accent color, system dark mode (D4). A well-set document with a few deliberate motion touches, not a landing page. shadcn default aesthetic tuned with tweakcn. Two fonts max via `next/font` (self-hosted). Timeline reveal with CSS scroll-driven animations behind `@supports` and `prefers-reduced-motion`; where unsupported the nodes are simply visible. No page transitions needed. Fluid type with `clamp()`, container queries for cards, content column near 72ch, one column under 640px, timeline rail on the left edge on mobile.

## 4. Stack

| Layer           | Choice                                                                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework       | Next.js 16 App Router, `output: 'export'`, React Compiler on, `images.unoptimized`                                                          |
| Language        | TypeScript 5 strict, `noUncheckedIndexedAccess`                                                                                             |
| Styling         | Tailwind CSS 4 via `@tailwindcss/postcss`, CSS-first `@theme` in `src/styles/globals.css`                                                   |
| UI kit          | shadcn/ui on Base UI primitives; only the components in use (Button, Card, Badge, later Tooltip and Sheet)                                  |
| Icons           | lucide-react                                                                                                                                |
| Content         | `src/content/resume.ts` and `projects.ts` typed with a zod schema, validated in Vitest                                                      |
| Lint and format | ESLint 9 flat (typescript-eslint strict type-checked, react-hooks, jsx-a11y, @next/eslint-plugin-next), Prettier 3 + Tailwind plugin, knip  |
| Tests           | Vitest (schema, helpers, WebMCP handlers), Playwright + axe on every page, Lighthouse CI (perf ≥ 95, a11y 100, SEO 100, best practices 100) |
| Runtime         | Node 24 (`.nvmrc`, `engines`), npm, `package-lock.json` committed                                                                           |
| CI              | GitHub Actions `ci.yml` on PR and main, `deploy.yml` on main, Dependabot weekly, monthly link check                                         |
| Hosting         | Cloudflare Workers static assets; `_headers` for CSP and caching; Cloudflare Web Analytics + Search Console, no GA                          |

**Layout:** `src/app` routes and metadata files; `src/components/{ui,layout,sections,skills-cloud,webmcp}`; `src/content`; `src/hooks` (only what is used); `src/lib` pure helpers; `src/styles`; `public/` (resume.pdf, images, favicons, `api/profile.json`); `e2e/`; `.claude/{skills,agents,rules,settings.json}`; `.mcp.json`; `.github/workflows`. Unit tests co-located as `*.test.ts`. No `features/` or `services/` directories: there is nothing to put in them.

**Standard-first rule for agent files:** where an open standard exists it is used (`AGENTS.md`, the Agent Skills `SKILL.md` format). Where none exists (subagents, rules, hooks, MCP config) files live under `.claude/`, the primary tool. No custom sync script. Multi-target output, if ever, is Phase 5b via rulesync for tested targets only.

## 5. Engineering rules

The list in `AGENTS.md` is authoritative: static first, no `useEffect` for data or layout, no layout shift, small files, accessibility as a CI gate, evergreen browsers with progressive enhancement, SEO built in (per-page metadata, JSON-LD `Person` and `WebSite`, sitemap, permissive robots including AI crawlers, manifest, favicons, `llms.txt`), a performance budget (initial JS under 120 KB gzipped, LCP under 1.5 s on throttled 4G, CLS 0), security headers, and claims discipline per `.claude/rules/content.md`.

## 6. Agentic build workflow

Every agent, skill and hook in the repo must have actually been used to build the site. Deterministic checks run on every turn for free; model-driven agents run on demand at milestones, never on a schedule.

**Tier 1, native harness in-repo:** `AGENTS.md` (< 100 lines) imported by `CLAUDE.md`; path-scoped `.claude/rules/` (`a11y`, `styling`, `content`, `tdd`); subagents as evaluators with narrow tools and right-sized models (`architect`, `reviewer` on Opus; `qa-auditor`, `content-guard`, `seo-auditor` on Sonnet); skills `visual-check`, `add-project`, `release-check`, `lighthouse-loop`; hooks that run Prettier on edit and typecheck + lint + unit tests on Stop, no model in any hook; `.mcp.json` with Playwright and Chrome DevTools (Context7 and shadcn optional, four is the ceiling).

**Tier 2, agents in CI:** Claude Code Action for PR review and `@claude` tasks, triggered by a `review` label or mention, not every push. Dependabot weekly; the action triages its PRs when labeled. Monthly `lychee` link check (deterministic).

**Tier 3, one-shot method demos:** GitHub Spec Kit once on a branch (keep its artifacts in `docs/` if they read well); one dynamic-workflow run on a parallelizable task (the project cards) with the script committed under `docs/workflows/`; a `claude-seo` audit once, post-deploy. Each logged in the README.

**Tests:** unit (Vitest) written by the implementer test-first per `tdd.md`, run by the Stop hook; e2e + axe (Playwright, 3 pages × 3 viewports) run per PR; Lighthouse CI per PR; model-driven audits only at phase gates via `release-check`.

**Process per feature:** plan → implement with tests → `/visual-check` → PR → CI → `reviewer` on request → preview URL → merge. `/clear` between features. Keep `PLAN.md` ticked.

## 7. WebMCP proof of concept

**Status (2026-10-04):** W3C Web Machine Learning CG draft; API is `document.modelContext.registerTool({ name, description, inputSchema, execute })`, `getTools()`, `toolchange`. Chrome origin trial 149 through 156 (flag `chrome://flags/#enable-webmcp-testing`), Edge trial in 150, nothing shipped unflagged, no mainstream agent calls page tools in production yet. It is a credible demo of a bleeding-edge standard and a conversation starter, not a traffic channel, and the page says so.

**Design:** one client island `components/webmcp/ModelContextProvider.tsx` that feature-detects `document.modelContext ?? navigator.modelContext`, loads the `@mcp-b` polyfill only when absent, registers read-only tools built from `content/` (`get_profile`, `list_experience`, `get_experience`, `list_projects`, `get_project`, `get_skills`, `get_contact`, `get_resume_url`; zod schemas to JSON Schema; unit-tested), and shows a small "Agent tools available" badge with an explanatory tooltip. The same data is published as static `/api/profile.json`. Origin-trial `<meta>` token for Chrome visitors. Nothing in the tools that is not already on the page. Playwright MCP exposes page-registered tools, so e2e can assert registration without an extension.

## 8. Risks

- **Scope creep** is the only real risk. `PLAN.md` ticks are the brake.
- **Static export and `next/image`:** `images.unoptimized` is set in Phase 1, before the first `<Image>`.
- **WebMCP API churn:** names moved once already (`navigator` to `document`); pin the polyfill and feature-detect both.
- **DNS cut-over:** the old GitHub Pages CNAME must go the same hour the new host goes live.
- **Firefox and scroll-driven animations:** the fallback must look intentional; test in Firefox explicitly.
- **Claims discipline:** `content.md` carries the content-guard list so an agent cannot reintroduce a struck claim.
