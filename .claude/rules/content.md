---
paths:
  - 'src/content/**'
  - 'src/app/**'
---

# Public content rules

Every public string is a claim about a real person's career. Wording is approved upstream; agents do not improve it.

- Single source: `src/content/*.ts`. Pages import content; never inline copy in components.
- No personal contact details beyond the public email `jason.aj.robitaille@gmail.com` (D8). LinkedIn is `linkedin.com/in/jasonrobitaille`. GitHub is `github.com/JayCanuck`.
- Attribute company outcomes to the company's own public statements. Describe internal work functionally and label it internal.
- No unpublished internal product, project or system names, and no internal metrics, ratings or figures.
- No commentary about the job search or the owner's circumstances beyond the approved About text.
- Links only to public, live proof. When there is no proof link, the card says so.
- The availability line and the About wording are deliberate (D5); change them only when told.
- Do not add, reword or "polish" copy without being asked. Flag anything that reads like a claim you cannot source.
- The content guard test (`src/content/content.test.ts`) enforces the generic rules; a gitignored `content-guard.local.json` and `content.local.md` hold the specific term list and never enter the repository.
