// Dynamic-workflow demo (spec §6, tier 3): the script that produced src/lib/webmcp/tools/*.ts and
// their tests. Eight Sonnet workers ran in parallel, one tool file and test each, against the
// shared contract in tools/types.ts; one Opus review then read all eight. The run, its findings
// and the per-agent token counts are recorded in docs/demos/workflow-webmcp-tools.md. Written for
// the Workflow tool's script API (agent, parallel, phase, log); plain JavaScript by design.
export const meta = {
  name: 'webmcp-tools',
  description: 'Write the eight WebMCP tool handlers and their tests in parallel, then one review',
  phases: [
    {
      title: 'Implement',
      detail: 'one Sonnet worker per tool: test first, then the handler',
      model: 'sonnet'
    },
    {
      title: 'Review',
      detail: 'one Opus review of all eight files against AGENTS.md',
      model: 'opus'
    }
  ]
};

const TOOLS = [
  {
    name: 'get_profile',
    file: 'get-profile',
    input: 'none',
    description:
      'Identity and summary: name, title, headline, location, site url, summary, the About paragraphs and the structured availability.',
    output:
      '{ name, title, headline, location, url, summary, about, availability } copied from the data'
  },
  {
    name: 'list_experience',
    file: 'list-experience',
    input: 'none',
    description:
      'Every role newest first, without bullets: id, employer, title, name, years, desc. Use get_experience with an id for the full detail.',
    output: '{ experience: [{ id, employer, title, name, years, desc }] } in data order'
  },
  {
    name: 'get_experience',
    file: 'get-experience',
    input: 'id',
    description:
      'One role by id (from list_experience) with every bullet, the era line, dates and its public link where one exists.',
    output:
      'the full experience entry as { experience: entry }; unknown id => failure("Unknown experience id \\"X\\". Valid ids: RV, SM, ...") listing data.experience ids'
  },
  {
    name: 'list_projects',
    file: 'list-projects',
    input: 'none',
    description:
      'The selected projects in page order, without descriptions: slug, title, era, blurb. Use get_project with a slug for the detail and links.',
    output: '{ projects: [{ slug, title, era, blurb }] }'
  },
  {
    name: 'get_project',
    file: 'get-project',
    input: 'slug',
    description: 'One project by slug (from list_projects) with its description and proof links.',
    output:
      'the full project entry as { project: entry }; unknown slug => failure listing the valid slugs'
  },
  {
    name: 'get_skills',
    file: 'get-skills',
    input: 'none',
    description: 'The five skill groups with their terms, as the Toolbox section lists them.',
    output: '{ skills: data.skills }'
  },
  {
    name: 'get_contact',
    file: 'get-contact',
    input: 'none',
    description: 'Public contact only: email, LinkedIn, GitHub, npm and the location line.',
    output: '{ contact: data.contact }'
  },
  {
    name: 'get_resume_url',
    file: 'get-resume-url',
    input: 'none',
    description: 'The absolute URL of the current resume PDF.',
    output: '{ resumeUrl: data.resumeUrl }'
  }
];

const WORKER_SCHEMA = {
  type: 'object',
  properties: {
    file: { type: 'string' },
    testFile: { type: 'string' },
    testsPassed: { type: 'boolean' },
    testCount: { type: 'number' },
    notes: { type: 'string' }
  },
  required: ['file', 'testFile', 'testsPassed', 'testCount', 'notes']
};

const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    verdict: { type: 'string', enum: ['ship', 'fix first'] },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          file: { type: 'string' },
          line: { type: 'number' },
          problem: { type: 'string' },
          why: { type: 'string' },
          fix: { type: 'string' }
        },
        required: ['file', 'problem', 'why', 'fix']
      }
    }
  },
  required: ['verdict', 'findings']
};

const workerPrompt =
  t => `You are implementing one read-only WebMCP tool for this repository, test first (the repo's tdd rule for src/lib). Work ONLY in these two files; other workers are writing sibling files at the same time, so touch nothing else:

- src/lib/webmcp/tools/${t.file}.ts
- src/lib/webmcp/tools/${t.file}.test.ts

Read first: src/lib/webmcp/tools/types.ts (the contract: ToolDefinition, success, failure, EMPTY_INPUT, JsonSchema) and src/lib/webmcp/profile-data.ts (ProfileData shape; buildProfileData() returns the real content for tests). Look at src/lib/webmcp/profile-data.test.ts for the test style (vitest, describe/it, '@/..' imports).

Tool spec:
- name: '${t.name}'
- description (use exactly): '${t.description}'
- input: ${t.input === 'none' ? 'no properties; use EMPTY_INPUT and ToolDefinition with the default Input type' : `one required string property "${t.input}" with a description; inputSchema { type: 'object', properties: { ${t.input}: { type: 'string', description: '...' } }, required: ['${t.input}'], additionalProperties: false }; ToolDefinition<{ ${t.input}: string }>`}
- output: ${t.output}
- export: a single named export \`export const ${t.name.replace(/_([a-z])/g, (m, c) => c.toUpperCase())}: ToolDefinition<...> = { name, description, inputSchema, handler }\`.
- handler(data, input) is pure and synchronous: returns success(value) (value must be a plain object) or failure(message). Never throw. Never mutate data. Copy only the listed fields.

Rules: no zod import, no React, no fetch, no DOM; no imports except from './types' and type-only imports from '@/lib/webmcp/profile-data'; file under 80 lines; a short header comment saying what the tool returns; named exports only; TypeScript strict with noUncheckedIndexedAccess (so index access is possibly undefined). Do not touch any other file, do not run the full test suite, do not commit.

Steps: 1) write the test file with 3 to 5 cases against buildProfileData() (shape, exact field copy, text equals JSON of structuredContent${t.input === 'none' ? '' : ', unknown ' + t.input + ' returns isError with the valid values listed, and the input property is required in the schema'}); 2) run \`npx vitest run src/lib/webmcp/tools/${t.file}.test.ts\` and confirm it fails; 3) write the implementation; 4) run the same command and confirm it passes; 5) run \`npx eslint src/lib/webmcp/tools/${t.file}.ts src/lib/webmcp/tools/${t.file}.test.ts\` and fix anything it reports. Report the test count and anything you were unsure about in notes.`;

phase('Implement');
const results = await parallel(
  TOOLS.map(
    t => () =>
      agent(workerPrompt(t), {
        label: `tool:${t.name}`,
        phase: 'Implement',
        model: 'sonnet',
        schema: WORKER_SCHEMA
      })
  )
);
const done = results.filter(Boolean);
log(
  `${done.length}/${TOOLS.length} workers returned; ${done.filter(r => r.testsPassed).length} green`
);

phase('Review');
const review = await agent(
  `Adversarial review of eight new files under src/lib/webmcp/tools/ (every *.ts except types.ts, index.ts and *.test.ts, plus their tests). Read AGENTS.md's engineering rules, src/lib/webmcp/tools/types.ts and src/lib/webmcp/profile-data.ts first, then every tool file and test. Assume the authors missed something: a throw instead of failure(), a field copied that the spec did not list, a mutable reference to the data returned as structured content, a test that asserts nothing, an unknown-id path that is not tested, index access without the undefined guard, a description that overpromises, an import that would pull zod or the content files into the browser bundle, a file over 80 lines. Do not edit files. Return the verdict and findings as path, line, problem, why it matters, fix. Worker notes for context: ${JSON.stringify(done.map(r => ({ file: r.file, notes: r.notes })))}`,
  { label: 'review', phase: 'Review', model: 'opus', schema: REVIEW_SCHEMA }
);

return { workers: done, review };
