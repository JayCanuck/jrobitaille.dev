---
name: visual-check
description: Screenshot the built site at 390, 1280 and 2560 px in light and dark color schemes (and optionally per accent candidate) so a human can review it before a PR. Use after UI changes, at design checkpoints, and before opening a PR that touches src/components, src/app or src/styles.
---

# Visual check

Deterministic, no model: Playwright captures the static export served by `wrangler dev`, the same way e2e runs.

1. Build first: `npm run build` (the script serves `./out`).
2. Run `npm run visual-check` (optionally `-- --accent ultraviolet` to flip the `data-accent` switch, `-- --path /nope` for the 404, `-- --full` for full-page captures).
3. Screenshots land in `.visual/<label>/<path>-<width>-<scheme>.png` (gitignored). Open each one with the Read tool and look at: contrast in both schemes, hero band and avatar overlap, card grid shape at each width (1, 2, 3+featured columns), timeline rail and alternation from 768 px, chip wrapping, footer line.
4. Show the person the screenshots that matter for the decision at hand; never describe a screenshot you did not open.

The script starts its own `wrangler dev` on port 8788 so it never collides with a running e2e server.
