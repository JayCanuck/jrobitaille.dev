# Dynamic-workflow demo: the eight WebMCP tool handlers

One-shot method demo (spec §6, tier 3). The script is `docs/workflows/webmcp-tools.mjs`; it ran once, on 2026-10-05, during the WebMCP pull request (D17), and produced `src/lib/webmcp/tools/*.ts` with their tests.

## Shape

- Eight workers on Claude Sonnet 5.5 in parallel, one per tool. Each got the shared contract (`tools/types.ts`), the data shape (`profile-data.ts`), the tool's name, description, input and output spec, and the instruction to write the failing test first, then the handler, then run that test file and ESLint on the two files it owned.
- One review on Claude Opus 5.5 after all eight returned: an adversarial read of every file and test against the engineering rules, returning a verdict and findings as path, problem, why, fix. It did not edit.
- The main thread applied the findings by hand and re-ran the full suite.

## Result

All eight workers returned green (test failed first, then passed; ESLint clean). The review returned `fix first` with eleven findings. The systemic one: every tool returned references into the shared profile data, so a caller that mutated a result would have changed every later answer. The rest: an untested missing-id path in the two lookup tools, a try/catch that could never run, a description that promised a field two roles do not have, an untested branch in `get_project`, an ordering claim no test checked, and an import guard that matched only one spelling. Every finding was applied: a deep copy in the shared `success` helper, input guards, the description fix, the extra tests, a stricter guard, and one wording fix in `docs/SPEC.md` §7.

## Token usage

Tokens are the measured unit. Two sources reported them, and they disagree:

- **Workflow summary.** The run's own summary reported one undifferentiated `tokens` figure per agent, 485,836 in total.
- **Agent transcripts.** Each agent's transcript carries the API `usage` object of every call it made (`input_tokens`, `output_tokens`, `cache_read_input_tokens`, `cache_creation_input_tokens`). Summed per agent, deduplicated by message id, the run used 1,655,365 tokens across the four fields: 64 input, 8,609 output, 1,330,979 cache read, 315,713 cache write (all 5-minute writes; no 1-hour writes).

**Cause of the discrepancy, identified:** the summary figure matches the context size of each agent's final API call (that call's input plus cache read plus cache write), within about 24 tokens on every agent. It is a snapshot of how large the context had grown, not usage summed across the agent's calls, and it excludes output tokens. Across the nine agents it comes to 29% of the transcript total. The record below therefore uses the transcript counts; the summary figure is kept only as this finding, so no later record mistakes a context size for a usage total.

Per agent, from the transcripts. "Calls" is the number of API calls the agent made; every call re-read the shared prefix (the repository instructions, the contract and the data shape) from the cache, which is why cache reads dominate.

| Agent                | Model      | Calls | Input | Output | Cache read | Cache write (5 min) | Wall time | List-price equivalent |
| -------------------- | ---------- | ----: | ----: | -----: | ---------: | ------------------: | --------: | --------------------: |
| tool:get_profile     | Sonnet 5.5 |     3 |     6 |    592 |     94,152 |              50,979 |    28.0 s |               $0.1522 |
| tool:list_experience | Sonnet 5.5 |     3 |     6 |    708 |    120,236 |              28,651 |    29.7 s |               $0.1028 |
| tool:get_experience  | Sonnet 5.5 |     3 |     6 |    696 |    120,430 |              28,884 |    35.3 s |               $0.1033 |
| tool:list_projects   | Sonnet 5.5 |     3 |     6 |    716 |    118,427 |              26,796 |    29.7 s |               $0.0978 |
| tool:get_project     | Sonnet 5.5 |     4 |     8 |    737 |    169,891 |              27,376 |    48.3 s |               $0.1098 |
| tool:get_skills      | Sonnet 5.5 |     3 |     6 |    695 |    120,166 |              28,241 |    28.9 s |               $0.1016 |
| tool:get_contact     | Sonnet 5.5 |     3 |     6 |    588 |    120,172 |              28,341 |    28.6 s |               $0.1008 |
| tool:get_resume_url  | Sonnet 5.5 |     3 |     6 |    710 |    119,260 |              27,348 |    29.0 s |               $0.0993 |
| review               | Opus 5.5   |     7 |    14 |  3,167 |    348,245 |              69,097 |    97.3 s |               $0.4785 |
| **Sonnet 5.5 total** |            |    25 |    50 |  5,442 |    982,734 |             246,616 |           |           **$0.8676** |
| **Opus 5.5 total**   |            |     7 |    14 |  3,167 |    348,245 |              69,097 |           |           **$0.4785** |
| **Run total**        |            |    32 |    64 |  8,609 |  1,330,979 |             315,713 |   150.4 s |           **$1.3461** |

Wall times are from the workflow summary (each agent's start to finish); the whole run took 150.4 s because the eight workers overlapped (the slowest took 48.3 s) and the review ran after them.

**List-price equivalent.** A derived figure, computed from the transcript counts at the published Claude API rates on platform.claude.com/docs/en/about-claude/pricing as read on 2026-10-05: Claude Sonnet 5.5 at $2 input, $10 output, $0.20 cache read, $2.50 five-minute cache write per million tokens; Claude Opus 5.5 at $4 input, $20 output, $0.20 cache read, $5 five-minute cache write per million tokens. The run was made on a subscription plan, so this is a reference figure, not a bill.

## What this one run showed

Both points are observations from this single run, not general claims.

- **The review tier earned its place here.** The one finding that mattered most, every handler returning references into the shared data, was present in all eight files and invisible to each worker's own tests, which compared values with `toEqual`. One Opus review (36% of the run's list-price equivalent, 65% of its wall time) found it, and it was fixed once in the shared helper. In this run, a review after parallel workers caught what parallel workers could not.
- **The fan-out bought wall time; the transcripts say nothing about token efficiency.** Eight files landed in 48 s of wall time instead of eight sequential writes. Per worker the transcripts show about 150,000 tokens for a 20-to-40-line file and its test, 80% of them cache reads of the same shared prefix at the cache-read rate. Whether one agent writing the eight files in sequence would have used fewer tokens was not measured, so this record makes no claim either way; what it can say is that the cost of the parallel part was dominated by re-reading shared context, not by the files written.
