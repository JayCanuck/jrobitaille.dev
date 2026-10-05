# jrobitaille.dev: specification

What the site is, what it is not, and how it is built. Decisions live in `DECISIONS.md`; the phase checklist in `PLAN.md`. If it is not in this repo, an agent cannot see it.

## 1. Goals and non-goals

**Goal:** a visitor lands on jrobitaille.dev and within 10 seconds knows who Jason is (Staff Software Engineer; full-stack, platform and developer tooling; 15+ years), where to click (Resume PDF, LinkedIn, GitHub), and sees five proof-linked projects. Engineers who open the repo see a clean, modern, deliberate codebase and a demonstrable agentic build process.

**The site confirms, it does not convert.** It must be fast, clean, truthful and finished. Nothing here is worth a week.

**Non-goals:** blog, contact form, CMS, backend, analytics dashboards, 3D hero, animation showcase, "writing" page, auto-sync from LinkedIn. A small React Three Fiber island may be added later if it ever matters.

## 2. Information architecture and content

```
/              hero, about, selected work (5), experience timeline, skills, contact footer
/resume.pdf    static file, swapped per build
/404
```

The site confirms the resume; it does not restate it (D11). There is no `/projects` route.

- **Hero:** name, "Staff Software Engineer", one line ("Full-Stack, Platform & Developer Tooling · 15+ yrs shipping web products"), location line "Mountain View, CA · remote or Bay Area", three buttons (Resume PDF, LinkedIn, GitHub), availability line "Open to full-stack, platform or developer tooling roles".
- **About:** two short paragraphs sized for the page (origin and arc, then availability); the full four-paragraph public profile text is kept as `profile.aboutLong` for the agent-facing data (D13).
- **Content layers (D12, D13):** `src/content/` holds the full approved resume content as the agent-facing data: summary, five skill groups, the title ladder with every bullet per era (texts, era line and desc, a public reference on a bullet where one exists), open source entries, the earlier roles with their bullets, education, the long About and the card descriptions. The page renders only the page layer: the short About, timeline highlights and one-line card blurbs. Everything else renders nowhere until `/api/profile.json` and WebMCP in Phase 4.
- **Experience timeline:** one block "LG Electronics, 2015 to 2026" (h3) holding the five eras newest first (h4: RetailVerse 2025 to 2026, 3D asset platform 2022 to 2026, SVL Simulator 2020 to 2022, Enact 2017 to 2020, Enyo 2015 to 2017) under the title ladder, where the full title ("Staff Software Engineer", "Senior Software Engineer", "Software Engineer") is a labelled non-heading element shown where the title changes; then Experis IT 2013 to 2015 and Canuck Coding 2009 to 2013 as their own blocks. Each node: name, years, one-line descriptor, 1 to 2 highlights of under 140 characters (1 for Experis and Canuck Coding), proof link where public (RetailVerse links the LG press release, SVL links `github.com/lgsvl/simulator`; never `svlsimulator.com`, the domain lapsed). Canuck Coding's rail reads "Software Developer (self-employed)" to match the public profile.
- **Project cards, exactly five, all on the home page, in order:** RetailVerse Web (LG press release + one live viewer example); @enact/cli (GitHub, npm); SVL Simulator cloud platform (`github.com/lgsvl/svlsimulator.com`); webOS homebrew (webos-quick-install, legacy-webos); gamelist-utils and muos.js, 2021 to present (GitHub, npm). Each card: title, a one-line blurb (hard cap 100 characters, rendered with a two-line clamp so every card is the same height), a footer row with the proof links and the year span, and an optional fixed 16:10 image slot (placeholder box until Phase 3 screenshots). A longer two-sentence description per card is kept for the agent-facing data. The 3D asset platform lives in the timeline only. No download counts, no internal metrics, no patents, company figures attributed to the company.
- **No public string appears twice on the page.** The hero `h1` is the name only and the title appears once below it; a build-output test enforces uniqueness of every rendered string of 20 or more characters, with the title ladder excluded because it repeats the current title by design.
- **Meta description:** "Staff software engineer: full-stack, platform and developer tooling, 15+ years shipping web products. Mountain View, CA, open to remote."
- **Skills:** grouped text chips in five groups (Languages, Frontend, Backend and data, Build and tooling, CI and cloud). No bars, no logo wall.
- **Skills word cloud:** the one flourish. A React Three Fiber floating cloud of the same terms, no metrics. Lazily loaded client island below the fold, imported after idle and when the section nears the viewport (the one justified dynamic import + IntersectionObserver, because it gates ~150 KB); `prefers-reduced-motion` disables it; the chip list is the no-JS and screen-reader version; canvas is `aria-hidden`; plain WebGL renderer. Built in Phase 4 so it never blocks launch.
- **Footer:** one line, "© <build year> Jason Robitaille · jason.aj.robitaille@gmail.com · Source", the email as `mailto:`, Source linking to the repository, the year a build-time constant.
- **Easter egg:** Konami code as a lazily loaded client island.

## 3. Design direction

Technical, quiet, with personality (D14): crisp where recruiters scan (hero facts, cards, timeline legibility), personality where they linger (headings with voice, the tagline and footer slots, the UFO 404). Slate-and-white family with one accent, "Ultraviolet", system dark mode (D4), no toggle. Geist for body and Geist Mono for labels, dates and the timeline rail, both self-hosted via `next/font`. Tokens as Tailwind v4 `@theme` in `globals.css`. Motion is texture, not a show: the cover band drifts with `animation-timeline: scroll()`, timeline nodes reveal with `animation-timeline: view()`, every effect behind `@supports` and `prefers-reduced-motion`; where unsupported, everything is simply visible and static. No page transitions. Fluid type with `clamp()`, container queries for cards, prose near 72ch with the work grid and timeline on a wider column; cards one column under 640px, two from 768px, three from 1280px with the first card featured across two; timeline alternating on a center rail from 768px, single left rail below.

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

The list in `AGENTS.md` is authoritative: static first, no `useEffect` for data or layout, no layout shift, small files, accessibility as a CI gate, evergreen browsers with progressive enhancement (Next's modern default compile target, no browserslist; revisit if one is ever needed, D10), SEO built in (per-page metadata, JSON-LD `Person` and `WebSite`, sitemap, permissive robots including AI crawlers, manifest, favicons, `llms.txt`), a performance budget (initial JS under 150 KB gzipped for evergreen browsers, LCP under 2.0 s on throttled 4G, CLS 0; D14), security headers, and the public content rules in `.claude/rules/content.md`.

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
- **Public content rules:** `content.md` carries the rules and the content guard test enforces them, so an agent cannot reintroduce removed content.
