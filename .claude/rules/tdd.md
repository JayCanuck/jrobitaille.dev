---
paths:
  - 'src/lib/**'
  - 'src/content/**'
---

# Test-first for lib/ and content/

- Write the failing test first (`*.test.ts` beside the file), then the minimum implementation, then refactor.
- `lib/` holds pure functions: no React, no fetch, no DOM. If it needs any of those it does not belong here.
- Content edits must keep the zod schema test green; when the schema grows, add a case for the new field.
- Tests run on every Stop through the hook, so keep them in the seconds range: node environment, no browser.
- E2E and axe live in `e2e/`; add a page there when a route is added, not here.
