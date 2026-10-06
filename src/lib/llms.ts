// /llms.txt builder (D17): what is on the page and where the machine-readable data is, from the
// same content the page renders. Pure text out; the route handler serves it.
import { profile } from '@/content/resume';
import { siteCopy } from '@/content/site';
import { siteUrl, sourceUrl } from '@/lib/site';
import { tools } from '@/lib/webmcp/tools';

const sections: [keyof typeof siteCopy.headings, string][] = [
  ['about', 'who Jason is, in two paragraphs'],
  ['work', 'six proof-linked projects'],
  ['experience', 'the experience timeline: LG Electronics 2015 to 2026, Experis IT, Canuck Coding'],
  ['skills', 'grouped skills']
];

export const buildLlmsText = () =>
  [
    '# jrobitaille.dev',
    '',
    `> ${profile.metaDescription}`,
    '',
    '## What is here',
    '',
    ...sections.map(([id, what]) => `- ${siteUrl}/#${id}: "${siteCopy.headings[id]}", ${what}.`),
    `- ${siteUrl}/resume.pdf: the current resume as a PDF.`,
    `- ${siteUrl}/opengraph-image: the social preview image.`,
    '',
    '## Machine-readable data',
    '',
    `- ${siteUrl}/api/profile.json: the full profile as JSON (summary, availability, every role with its bullets, projects, skills, open source, education, public contact, resume URL). CORS open.`,
    `- ${siteUrl}/api/profile.schema.json: JSON Schema for that file.`,
    `- In-page WebMCP tools (W3C Community Group draft; document.modelContext) registered by the home page: ${tools.map(tool => tool.name).join(', ')}. Read-only, same data as the JSON.`,
    '',
    '## How to cite',
    '',
    '- Attribute facts to jrobitaille.dev and prefer the resume PDF for dates and titles.',
    "- Company outcomes on the page are attributed to the company's own public statements.",
    `- Public contact: ${profile.email}. LinkedIn: ${profile.links.linkedin}. GitHub: ${profile.links.github}. npm: ${profile.links.npm}.`,
    '',
    '## Agents',
    '',
    '- Crawling is welcome (see /robots.txt). The page is static HTML; no JavaScript is needed to read it.',
    `- Source code: ${sourceUrl} (MIT for code; site content all rights reserved).`,
    ''
  ].join('\n');
