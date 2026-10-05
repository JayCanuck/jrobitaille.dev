---
name: visual-check
description: Screenshot the built site at 390, 1280 and 2560 px in light and dark color schemes (and optionally per accent candidate) so a human can review it before a PR. Use after UI changes, at design checkpoints, and before opening a PR that touches src/components, src/app or src/styles.
---

# Visual check

Deterministic, no model: Playwright captures the static export served by `wrangler dev`, the same way e2e runs.

1. Build first: `npm run build` (the script serves `./out`).
2. Run `npm run visual-check` (optionally `-- --accent ultraviolet` to flip the `data-accent` switch, `-- --path /nope` for the 404, `-- --full` for full-page captures, `-- --widths 390,1024,1440,2560` for other widths, `-- --scheme dark` for one scheme, `-- --browser firefox` for the no-scroll-driven fallback, `-- --file .visual/mockups/x.html` for a static mockup with no server).
3. Screenshots land in `.visual/<label>/<path>-<width>-<scheme>.png` (gitignored). Open each one with the Read tool and look at: contrast in both schemes, cover band fade and the avatar overlapping it (never clipped), balanced headline, card grid shape at each width (1, 2, then 2+3 columns from 1024 px), timeline rail with the interleaved alternation from 1024 px, chip wrapping, footer line.
4. Motion review: `npm run visual-check -- --motion --widths 1440 --scheme dark` keeps motion on and writes the hero at 0, 300 and 700 ms after load (`-0ms`, `-300ms`, `-700ms`: the stagger in progress, then settled) and each section 400 ms after an instant scroll to it (`-about`, `-work`, `-experience`, `-skills`: reveals complete, header visible, nothing dim). Include these in the review set after any motion change.
5. Show the person the screenshots that matter for the decision at hand; never describe a screenshot you did not open.

The script starts its own `wrangler dev` on port 8788 so it never collides with a running e2e server.
