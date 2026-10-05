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
