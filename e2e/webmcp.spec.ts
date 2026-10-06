// WebMCP registration over the served export (spec §7, D17), asserted from inside the page: after
// load and idle, (document.modelContext ?? navigator.modelContext).getTools() lists the eight tools
// with the input schemas the tool modules declare. The default projects exercise the polyfill
// branch; the desktop-1280-webmcp project launches Chromium with the native API, so both branches
// of the feature detection are covered. Native getTools() returns inputSchema as a JSON string and
// the polyfill as an object; the test normalises both.
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import { siteCopy } from '../src/content/site';
import { tools } from '../src/lib/webmcp/tools';

interface ListedTool {
  name: string;
  description: string;
  inputSchema: unknown;
}

interface ModelContextLike {
  getTools(): Promise<ListedTool[]>;
  executeTool(tool: ListedTool, input: string): Promise<unknown>;
}

const isNativeProject = () => test.info().project.name.endsWith('-webmcp');

const badge = (page: Page) => page.getByRole('button', { name: siteCopy.agentTools.badge });

const listTools = (page: Page) =>
  page.evaluate(async () => {
    const context =
      (document as { modelContext?: ModelContextLike }).modelContext ??
      (navigator as { modelContext?: ModelContextLike }).modelContext;
    if (!context) throw new Error('no modelContext');
    const listed = await context.getTools();
    return listed.map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema:
        typeof tool.inputSchema === 'string'
          ? (JSON.parse(tool.inputSchema) as unknown)
          : tool.inputSchema
    }));
  });

const callTool = (page: Page, name: string, input: object) =>
  page.evaluate(
    async ([toolName, json]) => {
      const context =
        (document as { modelContext?: ModelContextLike }).modelContext ??
        (navigator as { modelContext?: ModelContextLike }).modelContext;
      if (!context) throw new Error('no modelContext');
      const tool = (await context.getTools()).find(candidate => candidate.name === toolName);
      if (!tool) throw new Error(`no tool ${toolName}`);
      const result = await context.executeTool(tool, json);
      return typeof result === 'string' ? (JSON.parse(result) as unknown) : result;
    },
    [name, JSON.stringify(input)] as const
  );

test('the exported HTML carries the reserved slot and no badge', async ({ request }) => {
  const html = await (await request.get('/')).text();
  expect(html).toContain('data-island="webmcp"');
  expect(html).not.toContain(siteCopy.agentTools.badge);
});

test('after idle the eight tools are registered with the declared input schemas', async ({
  page
}) => {
  await page.goto('/');
  await expect(badge(page)).toBeVisible({ timeout: 10_000 });

  const listed = await listTools(page);
  // The polyfill lists tools by name; the native API in registration order. Compare as sets.
  expect(listed.map(tool => tool.name).sort()).toEqual(tools.map(tool => tool.name).sort());
  for (const tool of tools) {
    const registered = listed.find(candidate => candidate.name === tool.name);
    expect(registered?.description, tool.name).toBe(tool.description);
    expect(registered?.inputSchema, tool.name).toEqual(tool.inputSchema);
  }
});

test('the feature detection takes the branch the browser offers', async ({ page }) => {
  await page.goto('/');
  await expect(badge(page)).toBeVisible({ timeout: 10_000 });
  const shape = await page.evaluate(() => ({
    native: typeof (globalThis as { ModelContext?: unknown }).ModelContext === 'function',
    polyfilled: Boolean(
      (document as { modelContext?: { __isWebMCPPolyfill?: boolean } }).modelContext
        ?.__isWebMCPPolyfill
    ),
    onDocument: 'modelContext' in document
  }));
  expect(shape.onDocument).toBe(true);
  if (isNativeProject()) expect(shape).toMatchObject({ native: true, polyfilled: false });
  else expect(shape.polyfilled).toBe(true);
});

test('tools answer from the content: a project by slug, an unknown id as a readable failure', async ({
  page
}) => {
  await page.goto('/');
  await expect(badge(page)).toBeVisible({ timeout: 10_000 });

  const project = (await callTool(page, 'get_project', { slug: 'enact-cli' })) as {
    content: { text: string }[];
    structuredContent?: { project: { title: string; blurb: string } };
    isError?: boolean;
  };
  expect(project.isError).toBeFalsy();
  expect(JSON.parse(project.content[0]?.text ?? '')).toEqual(project.structuredContent);
  expect(project.structuredContent?.project.title).toBe('Enact framework');

  const unknown = (await callTool(page, 'get_experience', { id: 'nope' })) as {
    content: { text: string }[];
    isError?: boolean;
  };
  expect(unknown.isError).toBe(true);
  expect(unknown.content[0]?.text).toContain('Valid ids: RV, SM, SW, SR, SE, EXP, CC');
});

test('the badge opens an explanatory popover and stays axe clean', async ({ page }) => {
  await page.goto('/');
  const button = badge(page);
  await expect(button).toBeVisible({ timeout: 10_000 });
  const popover = page.locator('#agent-tools-help');
  await expect(popover).toBeHidden();
  await button.click();
  await expect(popover).toBeVisible();
  await expect(popover).toHaveText(siteCopy.agentTools.explain);

  // The click scrolled the footer into view, so the header's 200 ms fade is mid-flight; axe would
  // otherwise read its links at a blended colour. Let every time-based animation finish first.
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter(
          animation =>
            !(animation.timeline instanceof ScrollTimeline) && animation.playState === 'running'
        )
        .map(animation => animation.finished)
    )
  );
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'])
    .analyze();
  expect(results.violations).toEqual([]);

  await page.keyboard.press('Escape');
  await expect(popover).toBeHidden();
});
