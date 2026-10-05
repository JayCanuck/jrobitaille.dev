# Decisions

ADR-lite. D1 to D3 are locked; D4 onward are defaults that cost one edit to change. Add a new entry rather than rewriting an old one.

## D1: Framework is Next.js 16 static export

- **Date:** 2026-10-04 · **Status:** locked
- **Context:** A three-page static site. Astro 7 is the better pure-static fit (zero JS by default); TanStack Start and React Router framework mode were also weighed.
- **Decision:** Next.js 16 App Router with `output: 'export'`, React Compiler on, nearly everything a Server Component.
- **Why:** Next.js is the most-requested React framework in full-stack roles and a public artifact is the honest way to claim it. The cost (a framework bigger than the site, roughly 80 to 120 KB of runtime JS) is real and is mitigated by keeping client code to a few deliberate islands and saying so in the README.
- **Consequences:** No middleware, ISR, or default image loader (`images.unoptimized`); dynamic routes need `generateStaticParams`. None of these bite this site.

## D2: Hosting is Cloudflare Workers static assets

- **Date:** 2026-10-04 · **Status:** locked
- **Context:** GitHub Pages is free and simple but has no custom headers, no cache control and no branch previews.
- **Decision:** Cloudflare Workers static assets with the `jrobitaille.dev` zone on Cloudflare nameservers; deploy from GitHub Actions with `cloudflare/wrangler-action`. Phase 1 serves the `*.workers.dev` URL only; the custom domain moves over in Phase 5.
- **Why:** `_headers` for CSP and caching, preview URLs per PR, free cookieless Web Analytics, free bulk redirects for the `.com` and `.cv` domains.
- **Consequences:** Analytics is Cloudflare Web Analytics plus Google Search Console; no Google Analytics (50 to 100 KB of JS and a consent question for no gain).

## D3: Repository is public, content checked in

- **Date:** 2026-10-04 · **Status:** locked
- **Decision:** New public repo `JayCanuck/jrobitaille.dev`, history starting at creation, nothing hidden. `main` protected, PRs with CI required, squash merge, Conventional Commits, Dependabot weekly. MIT for code; site content all rights reserved.
- **Why:** Open-source public code is itself the talking piece. A private content repo or obfuscation layer protects nothing the resume PDF does not already publish and breaks the open-source story.
- **Consequences:** The privacy line is what stays out of the repo entirely: phone, street address, anything the employer did not publish, internal product names, internal metrics. See `.claude/rules/content.md`.

## D4: Dark mode follows `prefers-color-scheme`, no toggle

- **Date:** 2026-10-04 · **Status:** default
- **Why:** A toggle needs client JS, localStorage and a flash-prevention script for a feature nobody asks for. Add later if missed.

## D5: Ship the "actively looking" line in About

- **Date:** 2026-10-04 · **Status:** default
- **Decision:** Use the same About wording as LinkedIn, including the line about the team being eliminated in the 2026 restructuring.
- **Why:** One story on every surface. Swap for a one-line "now at X" when hired.

## D6: Include the internal 3D asset platform card

- **Date:** 2026-10-04 · **Status:** default
- **Decision:** Keep the card, flagged as internal and described functionally, placed below the cards that have proof links.
- **Why:** It carries the Three.js and React Three Fiber evidence.

## D7: Phone number stays on the resume PDF

- **Date:** 2026-10-04 · **Status:** default
- **Why:** Matches current practice. A phone-less web variant is a one-flag build change if it ever matters. The phone never appears in site markup or content files.

## D8: Public email is `jason.aj.robitaille@gmail.com`

- **Date:** 2026-10-04 · **Status:** default
- **Why:** Already the public address on the GitHub profile; one address everywhere.

## D9: Toolchain currency: ESLint 10, TypeScript 6, tsgo shadow job, Dependabot pins

- **Date:** 2026-10-04 · **Status:** default
- **Context:** ESLint 10 is current, but eslint-plugin-jsx-a11y, eslint-plugin-react and eslint-plugin-import still declare peer ranges that stop at 9 and call context APIs that 10 removed. TypeScript 7 (the native compiler) ships without the JavaScript compiler API until 7.1, which typescript-eslint and `next build` type-checking need.
- **Decision:** ESLint 10 with eslint-config-next 16 as the base, since it declares `eslint >=9` and bundles the plugins; no direct jsx-a11y dependency, its strict rule set is layered on from the bundled instance, and the bundled react, import and jsx-a11y rules are wrapped with `@eslint/compat` `fixupPluginRules` until they support 10 natively. TypeScript 6.0 as the bridge release. A non-blocking CI job runs the TypeScript 7 native compiler on every PR as stage one of a staged migration. Dependabot groups minor and patch npm updates into one weekly PR and ignores major updates for `typescript` (until 7.1 plus typescript-eslint support) and `@types/node` (tracks the pinned Node major).
- **Consequences:** The fixup block in `eslint.config.mjs` is deleted once the plugins catch up. When 7.1 lands, the shadow job becomes the blocking typecheck and the Dependabot ignore for `typescript` goes. `@types/node` moves with `.nvmrc`.

## D10: No browserslist field; CSS stays external

- **Date:** 2026-10-04 · **Status:** default
- **Context:** SPEC §6 targets evergreen browsers (last 2 of Chrome, Edge, Firefox, Safari). Next 16.3.8 compiles against a modern default (Chrome, Edge, Firefox 111 and Safari 16.4) when no `browserslist` is set. Correction (2026-10-05): the Turbopack static export does emit a legacy polyfill chunk, about 40 KB gzipped, behind `nomodule`, which evergreen browsers never fetch; the Lighthouse legacy-JavaScript finding refers to Next's separate, unconditionally loaded polyfill module, not to that chunk. Measured from a clean cache: explicit evergreen versions SWC knows (for example `chrome 150`, `safari 26`) reproduce the default output byte for byte (565,368 B raw, 170,007 B gzip), while a `last 2 versions` query resolves to releases the bundled SWC compat table does not know yet (Chrome 153 to 154, Safari 27) and makes SWC down-level everything: 608,547 B raw, 180,878 B gzip, 11 KB more over the wire. Browsers release monthly, so that query will keep outrunning the table.
- **Decision:** No `browserslist` field. The default target already matches the evergreen intent with the smallest output; a pinned explicit list would only drift. Revisit if Next changes its default or SWC starts tracking current releases.
- **Decision, CSS:** The ~30 KB Tailwind stylesheet stays an external `<link>` rather than being inlined with `experimental.inlineCss`. Inlining would recover roughly 4 mobile Lighthouse performance points on first load but requires `style-src 'unsafe-inline'`; the strict `style-src 'self'` CSP in `_headers` (Phase 3) is worth more on a site recruiters read with DevTools open, and the stylesheet is cached for returning visitors.
- **Consequences:** The performance budget in AGENTS.md is met without either change. If a future audit shows LCP over budget on throttled 4G, inlining is the first lever to re-evaluate, together with a nonce or hash-based CSP.

## D11: The site confirms the resume; five cards on home, no `/projects`

- **Date:** 2026-10-04 · **Status:** default
- **Context:** The first Phase 2 plan grew a `/projects` route, six cards with separate "did" and "outcome" fields, and a sixth card without approved content behind it. That restates the resume instead of confirming it.
- **Decision:** IA is home, 404 and `/resume.pdf`. Exactly five project cards, every one with public proof, all on the home page: RetailVerse Web, @enact/cli, SVL Simulator cloud platform, webOS homebrew, gamelist-utils and muos.js (2021 to present). Card shape: title, era, a short blurb, one primary proof link, optional secondary link, optional fixed 16:10 image slot reserved now and filled with Phase 3 screenshots. The 3D asset platform is covered by the timeline, so its card goes (supersedes D6). The Canuck Coding rail label is "Software Developer (self-employed)" to match the public profile. `svlsimulator.com` is never linked: the domain lapsed and redirects to an unrelated site; the timeline links `github.com/lgsvl/simulator` and the content guard test rejects the bare host. `resume.docx` is not hosted.
- **Consequences:** Adding a card means adding proof; there is no overflow page to hide weaker entries on.

## D12: Highlights on the page, full data for agents

- **Date:** 2026-10-04 · **Status:** default
- **Context:** D11 made the page confirm the resume rather than restate it, but the content files then held only the sentences the page showed. Phase 4 needs the whole resume for `/api/profile.json` and the WebMCP tools, and the page needs copy written for a screen rather than a PDF.
- **Decision:** Two layers in `src/content/`. The agent-facing data holds the full approved resume content: summary, five skill groups, the title ladder with every bullet per era (texts, era line and desc), open source entries, the earlier roles with their bullets, education; the employer's payroll entity, lab and city stay out; the public profile About stays as `profile.about`. The page layer is `highlights` on every timeline node (1 to 2, under 140 characters each) and a plain-sentence `blurb` per card, both approved copy. The page renders highlights and blurbs only; bullets, summary, open source and education render nowhere in Phase 2. Structure: the hero `h1` is the name only with the title once below it; the timeline groups the five LG eras under one "LG Electronics, 2015 to 2026" block with the title ladder as a rail label that changes only when the title changes, Experis and Canuck Coding as their own blocks; no public string appears twice on the page, so era links already carried by a card are dropped.
- **Consequences:** Content mirrors the current master resume and public profile text; update both together (`AGENTS.md`). Tests pin it: every node has 1 to 2 highlights under 140 characters, the content guard test walks the full data including the unrendered bullets, and a build-output test checks that `out/index.html` carries every highlight and blurb, none of the unrendered text, and no duplicate string of 20 or more characters. The blurb ceiling is three sentences because the @enact/cli blurb has three.

## D13: Web copy sized for the page

- **Date:** 2026-10-05 · **Status:** default
- **Context:** The page review found the home page reading like a document: a four-paragraph About, two-sentence cards of uneven height, a title ladder of bare words, a footer link list that repeated the hero, and the timeline ahead of the work it should point at.
- **Decision:** Copy on the page is sized for the page; the agent-facing data keeps the long form. About is two short paragraphs, with the four-paragraph public profile text kept as `profile.aboutLong`. Each card renders a one-line blurb (hard cap 100 characters) clamped to two lines so all cards are equal height, with a footer row of proof links and the year span; the previous two-sentence blurb is kept as `description`. The webOS homebrew card links webos-quick-install and legacy-webos; the LG webOSTV.js document stays in the data as the reference on the webOS.js bullet. Timeline rail labels are the full titles, rendered as a labelled non-heading element where the title changes (employer h3, era h4), and the RetailVerse era links the LG press release. Section order is hero, About, Selected work, Experience, Skills, footer. The footer is one line: copyright with a build-time year, the public email as `mailto:`, and a Source link to the repository. The meta description is a single sentence about role, scope and location.
- **Consequences:** The duplicate-string test excludes the rail labels, since the ladder repeats the current title by design. The build-output test now also asserts that the long About and the card descriptions never render. Adding page copy means adding it to the page layer only; the data keeps every longer form for Phase 4.

## D14: Design system, motion policy and security headers

- **Date:** 2026-10-05 · **Status:** default
- **Context:** Phase 3 turns the structured page into the finished site: "technical, quiet, with personality", crisp where recruiters scan, personality where they linger. Everything stays static; no new client components.
- **Fonts and type:** Geist (variable sans, body) and Geist Mono (labels, dates, the timeline rail) through `next/font`. Fluid type as `--text-*` tokens with `clamp()`; prose capped near 72ch, the work grid and timeline on a wider column.
- **Palette and accent:** a slate-and-white family with one accent, "Ultraviolet" (`oklch(0.56 0.2 300)` light, `oklch(0.76 0.14 300)` dark), chosen over a warm tangerine candidate at the design checkpoint. `--brand` is for fills, rails and rings; `--brand-text` passes AA on each background. Dark mode follows `prefers-color-scheme` (D4). shadcn variable names are kept so the primitives keep working.
- **Voice:** section headings carry it: "Hello", "Things I've shipped", "Where I've been", "Toolbox". A tagline slot under the hero and a playful footer-line slot live in `src/content/site.ts`; empty strings render no element. The 404 brings back the UFO and cow over the previous site's backdrop.
- **Motion:** texture, not a show. The cover band drifts with `animation-timeline: scroll()`, timeline nodes reveal with `animation-timeline: view()`, the UFO floats; all inside `@supports` and `@media (prefers-reduced-motion: no-preference)`, so unsupported browsers and reduced-motion users get the static page.
- **Layout:** cover band at a fixed 16:5 with explicit dimensions and an overlapping avatar; cards in a grid of one, two then three columns with the first card spanning two columns at three, equal height from the grid; empty image slots show a short hatch pattern; the timeline alternates on a center rail from 768 px and runs on a single left rail below, every block in the same order (employer heading, title label, era node).
- **Images:** sources committed under `assets/images`; `scripts/images.mjs` emits AVIF with a WebP fallback at fixed sizes under `public/images` and writes the dimensions to `src/content/images.ts`; origins in `public/images/SOURCES.md`. Missing card images were captured from the owner's own work (the live viewer, a repository screenshot, real CLI output), never downloaded from third parties.
- **Security headers:** `scripts/headers.mjs` writes `out/_headers` after every build. Directives and why: `default-src 'self'` (everything is same-origin); `script-src 'self'` plus a SHA-256 hash per inline script found in the export, so Next's inline payload runs without `'unsafe-inline'`; `style-src 'self'` (the stylesheet is external, D10); `img-src 'self' data:` (own images, data URIs for generated icons); `font-src 'self'` (self-hosted fonts); `connect-src 'self'` (prefetches); `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'` (no plugins, no base hijack, no forms, no framing); `upgrade-insecure-requests`. Plus `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` denying camera, microphone, geolocation and interest-cohort. Cache: `/_next/static/*` immutable for a year (content-hashed names); `/images/*` one day with a week of stale-while-revalidate (names are not hashed).
- **Gates:** axe at 390, 768, 1280 and 2560; CLS 0 asserted in e2e; a test that no file under `src/` uses `'use client'` or `useEffect`; Lighthouse CI on every PR with accessibility, best practices and SEO at 1.0 as errors, metric budgets as errors (FCP 1.5 s, Speed Index 2 s, TBT 200 ms, CLS 0) and the performance category as a warning at 0.95; a monthly link check. JavaScript budget, measured on the home export (gzip): React DOM, the React Flight client and the Next app router, bundled together by Turbopack in two chunks, 116.8 KB; Next runtime helpers, 27.0 KB; inline RSC payload (page data in `<script>` tags), 11.4 KB; site code, 0 KB (every component is a Server Component); polyfills, 39.6 KB in a `nomodule` chunk that evergreen browsers never load. External scripts total 143.8 KB, so the budget is 150 KB: this is the cost of choosing Next over a zero-JS framework for its hiring signal (D1), and the e2e guard holds that line so a dependency or island cannot grow it unnoticed. LCP budget: 2.0 s on throttled 4G (Google's good threshold is 2.5 s). The mobile LCP element is the About paragraph; it paints at first paint (140 ms unthrottled, 1.9 s under DevTools throttling, performance 98). Lighthouse's simulated mobile score (93, LCP 3.2 s) is a known text-LCP artifact: the simulation charges a text LCP for every script that finished before first paint on localhost, which is all of them. CI therefore keeps the performance category as a warning and FCP, Speed Index, TBT and CLS as errors.
- **Consequences:** The `visual-check` skill is the review step before any UI PR. Changing the accent is one token block; changing a heading is one string. Every inline script Next adds in a future version is hashed automatically, so the CSP never loosens by accident.

## D15: Composition redesign: cover band, centred hero, card grid, interleaved timeline

- **Date:** 2026-10-05 · **Status:** default
- **Context:** The Phase 3 page was technically sound but read as an unstyled content stack: one 72ch column for everything, about 160 px between sections with no change of texture, hero links that did not read as navigation, cards stretched to equal height, a letterboxed homebrew image, and a scroll reveal that started content invisible. Three reference sites were studied and measured (a split sticky-column archetype, a playful-but-restrained blog, a dense single-column essay) and the previous site's source was re-read; the pattern rules are in `docs/design-notes.md`. Three static mockups were built on the real tokens and content and screenshotted at 390, 1024, 1440 and 2560 px in both schemes: (A) a split layout with a sticky identity column from 1280 px, (B) the same split from 1024 px with a compact sticky top bar below it, and (C) the previous site's skeleton reinterpreted on the current stack.
- **Decision:** C. It keeps what the old site did well (a cover photo, a centred face and name, a timeline with a shape) on the current tokens, fonts and accent, and it scales from a phone to 2560 px without the split layout's empty identity column at narrow widths or its 1184 px island at wide ones. Composition: a full-width 16:5 cover band capped near 38vh on desktop (accent-tinted fade in dark mode, no parallax background attachment) with the avatar overlapping its bottom edge and the name centred beneath; the resume as the one filled accent pill with LinkedIn and GitHub as labelled icons; About and Toolbox side by side from 1024 px; five image cards in a grid of one, two, then six columns where three cards take two columns and two take three; the experience timeline on a single left rail with round year badges below 1024 px and on a centre rail above it, cards alternating sides and interleaving so each starts at the previous card's vertical midpoint (explicit grid rows from `src/lib/timeline.ts`); hairlines between sections, 64 px apart on phones and 96 px from 1024 px; a one-line centred footer. A slim fixed header (name, section links from 768 px, the resume pill) on a solid background fades in as the hero scrolls out, opacity only, so it is always in the tab order and shows itself on focus. The availability line is gone (About covers it), "15+ yrs" became "15+ years", the tagline and footer-line slots are empty strings, every card is one link to its primary proof with the secondary link separate, and the homebrew screenshot fills its frame like the others; card images ship a 640 px variant for the narrow slots.
- **Motion policy:** a load-time stagger on the hero (six children, 70 ms apart, settled within 600 ms, may start at opacity 0); scroll-driven effects that never start below 0.4 opacity or move more than 24 px (cover drift, timeline cards sliding in from their side with the year badge scaling from 0.8, project cards rising 8 px, the header fade), all inside `@supports (animation-timeline: scroll())` and `prefers-reduced-motion: no-preference`. Reveals fill forwards only, so an element waiting below the fold keeps its natural state and axe sees full contrast. Without support or with reduced motion, everything is simply visible and static, header included.
- **Consequences:** Section order on the page is hero, About beside Toolbox, Selected work, Experience; the e2e suite pins that order along with the header, the whole-card link, the interleave at 1024+ and the reduced-motion state. `visual-check` gained `--file`, `--widths` and `--browser firefox` so mockups and the no-scroll-driven fallback are screenshotted the same way. Supersedes the card-grid, timeline-breakpoint and hero-button lines of D14 and spec §3.
