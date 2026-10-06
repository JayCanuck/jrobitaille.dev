# Dynamic-workflow demo: the eight WebMCP tool handlers

One-shot method demo (spec §6, tier 3). The script is `docs/workflows/webmcp-tools.mjs`; it ran once, on 2026-10-05, during the WebMCP pull request (D17), and produced `src/lib/webmcp/tools/*.ts` with their tests.

## Shape

- Eight workers on Sonnet in parallel, one per tool. Each got the shared contract (`tools/types.ts`), the data shape (`profile-data.ts`), the tool's name, description, input and output spec, and the instruction to write the failing test first, then the handler, then run that test file and ESLint on the two files it owned.
- One review on Opus after all eight returned: an adversarial read of every file and test against the engineering rules, returning a verdict and findings as path, problem, why, fix. It did not edit.
- The main thread applied the findings by hand and re-ran the full suite.

## Result

All eight workers returned green (test failed first, then passed; ESLint clean). The review returned `fix first` with eleven findings, of which the systemic one was that every tool returned references into the shared profile data; the rest were an untested missing-id path in the two lookup tools, a try/catch that could never run, a description that promised a field two roles do not have, an untested branch in `get_project`, an ordering claim no test checked, and an import guard that only matched one spelling. Every finding was applied: a deep copy in the shared `success` helper, input guards, the description fix, the extra tests, and a stricter guard. One finding was about the spec text, applied in `docs/SPEC.md` §7.

## Cost

Per agent, as the workflow run reported them (tokens are the agent's total context tokens across its turns; the harness reported no dollar figure, so none is claimed here):

| Agent                | Model  | Tokens  | Tool calls | Wall time |
| -------------------- | ------ | ------- | ---------- | --------- |
| tool:get_profile     | Sonnet | 51,005  | 5          | 28.0 s    |
| tool:list_experience | Sonnet | 52,960  | 5          | 29.7 s    |
| tool:get_experience  | Sonnet | 53,183  | 5          | 35.3 s    |
| tool:list_projects   | Sonnet | 51,095  | 5          | 29.7 s    |
| tool:get_project     | Sonnet | 51,675  | 6          | 48.3 s    |
| tool:get_skills      | Sonnet | 52,524  | 5          | 28.9 s    |
| tool:get_contact     | Sonnet | 52,640  | 5          | 28.6 s    |
| tool:get_resume_url  | Sonnet | 51,647  | 5          | 29.0 s    |
| review               | Opus   | 69,107  | 8          | 97.3 s    |
| **Total**            |        | 485,836 | 49         | 150.4 s   |

Wall time for the whole run was 150 s: the eight workers overlapped (the slowest took 48 s) and the review took 97 s after them.

## What it says

- The parallel part was cheap in wall time and the files were uniform because the contract was written first by hand. The workers' notes show the kind of drift a shared contract does not prevent: three of eight hand-copied nested objects in different ways, which is exactly what the review caught.
- The review was worth more than any single worker: the aliasing bug was in all eight files and no worker's own tests could see it, because each tested its own handler against `toEqual`.
- For eight files of 20 to 40 lines each, a workflow is more process than the code needs. The demo stays one-shot by rule (`AGENTS.md`).
