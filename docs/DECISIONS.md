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
- **Context:** SPEC §6 targets evergreen browsers (last 2 of Chrome, Edge, Firefox, Safari). Next 16.3.8 compiles against a modern default (Chrome, Edge, Firefox 111 and Safari 16.4) when no `browserslist` is set, and the Turbopack static export emits no polyfill chunk at all. Measured from a clean cache: explicit evergreen versions SWC knows (for example `chrome 150`, `safari 26`) reproduce the default output byte for byte (565,368 B raw, 170,007 B gzip), while a `last 2 versions` query resolves to releases the bundled SWC compat table does not know yet (Chrome 153 to 154, Safari 27) and makes SWC down-level everything: 608,547 B raw, 180,878 B gzip, 11 KB more over the wire. Browsers release monthly, so that query will keep outrunning the table.
- **Decision:** No `browserslist` field. The default target already matches the evergreen intent with the smallest output; a pinned explicit list would only drift. Revisit if Next changes its default or SWC starts tracking current releases.
- **Decision, CSS:** The ~30 KB Tailwind stylesheet stays an external `<link>` rather than being inlined with `experimental.inlineCss`. Inlining would recover roughly 4 mobile Lighthouse performance points on first load but requires `style-src 'unsafe-inline'`; the strict `style-src 'self'` CSP in `_headers` (Phase 3) is worth more on a site recruiters read with DevTools open, and the stylesheet is cached for returning visitors.
- **Consequences:** The performance budget in AGENTS.md is met without either change. If a future audit shows LCP over budget on throttled 4G, inlining is the first lever to re-evaluate, together with a nonce or hash-based CSP.

## D11: The site confirms the resume; five cards on home, no `/projects`

- **Date:** 2026-10-04 · **Status:** default
- **Context:** The Phase 2 plan grew a `/projects` route, six cards with `did[]` and `outcome` fields, and a sixth card that had no source in the resume or the locked LinkedIn text. That restates the resume instead of confirming it.
- **Decision:** IA is home, 404 and `/resume.pdf`. Exactly five project cards, every one with public proof, all on the home page: RetailVerse Web, @enact/cli, SVL Simulator cloud platform, webOS homebrew, gamelist-utils and muos.js (2021 to present). Card shape: title, era, one sentence (two max), one primary proof link, optional secondary link, optional fixed 16:10 image slot reserved now and filled with Phase 3 screenshots. The 3D asset platform is covered by the timeline, so its card goes (supersedes D6). Timeline nodes carry at most two bullets, one for Experis and Canuck Coding; the Canuck Coding rail label is "Software Developer (self-employed)" to match LinkedIn. `svlsimulator.com` is never linked: the domain lapsed and redirects to an unrelated site; the timeline links `github.com/lgsvl/simulator` and the never-ship test rejects the bare host. `resume.docx` is not hosted.
- **Consequences:** The never-ship "download" pattern matches download counts only, so the "Resume (PDF)" button passes. Adding a card means adding proof; there is no overflow page to hide weaker entries on.
