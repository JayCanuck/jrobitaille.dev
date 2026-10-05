// Build-output checks over the served out/index.html (D12): the page renders the highlights and
// blurbs and nothing from the agent-facing detail, and no public string appears twice.
import { expect, test } from '@playwright/test';

import { earlier, employer } from '../src/content/experience';
import { projects } from '../src/content/projects';
import { education, openSource, summary } from '../src/content/resume';

const timelineNodes = [...employer.titles.flatMap(title => title.eras), ...earlier];

test('home renders every highlight and blurb and none of the hidden dataset', async ({ page }) => {
  await page.goto('/');
  const text = await page.locator('body').innerText();

  for (const highlight of timelineNodes.flatMap(node => node.highlights)) {
    expect(text).toContain(highlight);
  }
  for (const project of projects) expect(text).toContain(project.blurb);

  for (const bullet of timelineNodes.flatMap(node => node.bullets)) {
    expect(text).not.toContain(bullet);
  }
  expect(text).not.toContain(summary);
  for (const entry of openSource) expect(text).not.toContain(entry);
  expect(text).not.toContain(education);
});

test('no public string of 20 or more characters appears twice on the page', async ({ page }) => {
  await page.goto('/');

  // Short labels (link names, year ranges, chips) legitimately recur; sentences and titles must not.
  const texts = await page.evaluate(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const found: string[] = [];
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (node.parentElement?.closest('script, style')) continue;
      const value = node.textContent?.trim() ?? '';
      if (value.length >= 20) found.push(value);
    }
    return found;
  });

  const duplicates = texts.filter((value, index) => texts.indexOf(value) !== index);
  expect(duplicates).toEqual([]);
});
