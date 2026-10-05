// DESIGN.md describes the design that ships (D16) and globals.css is what ships. The format's
// exporters cannot carry the dark scheme or the fluid clamp() scale, so no stylesheet is generated;
// this test asserts instead that every front-matter token equals what globals.css (or, for the
// spacing tokens, the home page's utilities) defines, in both schemes.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

interface Typography {
  fontFamily: string;
  fontSize: string;
  lineHeight: number;
}

interface FrontMatter {
  colors: Record<string, string>;
  typography: Record<string, Typography>;
  fluid: Record<string, string>;
  rounded: Record<string, string>;
  spacing: Record<string, string>;
  breakpoints: Record<string, number>;
}

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const design = read('../../DESIGN.md');
const css = read('./globals.css');
const page = read('../app/page.tsx');

const fenceEnd = design.indexOf('\n---', 4);
const front = parse(design.slice(4, fenceEnd)) as FrontMatter;

const between = (from: string, to: string) => {
  const start = css.indexOf(from);
  const end = css.indexOf(to, start + from.length);
  if (start < 0 || end < 0) throw new Error(`globals.css: cannot find block ${from}`);
  return css.slice(start, end);
};
const theme = between('@theme {', '@theme inline');
const themeInline = between('@theme inline', ':root {');
const light = between(':root {', '@media (prefers-color-scheme: dark)');
const dark = between('@media (prefers-color-scheme: dark)', '@layer base');

const cssValue = (block: string, name: string) =>
  new RegExp(`--${name}:\\s*([^;]+);`).exec(block)?.[1]?.trim();

// The accent set is named `brand` in CSS because shadcn reserves `--accent` for hover surfaces.
const cssName = (token: string) => token.replace(/^accent/, 'brand');

const rem = (value: string) => {
  const match = /^([\d.]+)rem$/.exec(value);
  if (!match?.[1]) throw new Error(`${value} is not a rem value`);
  return Number(match[1]);
};

// A radius in globals.css is `var(--radius)` or `calc(var(--radius) * factor)`; resolve it.
const resolveRadius = (expression: string, base: number) => {
  if (expression === 'var(--radius)') return base;
  const factor = /^calc\(var\(--radius\) \* ([\d.]+)\)$/.exec(expression)?.[1];
  if (!factor) throw new Error(`cannot resolve radius ${expression}`);
  return base * Number(factor);
};

describe('DESIGN.md tokens match globals.css', () => {
  it('has front matter', () => {
    expect(fenceEnd).toBeGreaterThan(4);
    expect(Object.keys(front.colors).length).toBeGreaterThan(20);
  });

  it.each(Object.entries(front.colors))('color %s', (token, value) => {
    const isDark = token.endsWith('-dark');
    const base = isDark ? token.slice(0, -'-dark'.length) : token;
    const reference = /^\{colors\.(.+)\}$/.exec(value)?.[1];
    const expected = reference ? `var(--${cssName(reference)})` : value;
    expect(cssValue(isDark ? dark : light, cssName(base))).toBe(expected);
  });

  it.each(Object.entries(front.fluid))('fluid type %s', (level, clampValue) => {
    expect(cssValue(theme, `text-${level}`)).toBe(clampValue);
  });

  it.each(Object.entries(front.typography))('typography %s', (level, type) => {
    // The token holds the floor of the fluid level and its line height.
    const floor = /^clamp\(([^,]+),/.exec(front.fluid[level] ?? '')?.[1];
    expect(type.fontSize).toBe(floor);
    expect(cssValue(theme, `text-${level}--line-height`)).toBe(String(type.lineHeight));
    expect(['Geist', 'Geist Mono']).toContain(type.fontFamily);
  });

  it('maps both families to the self-hosted Geist variables', () => {
    expect(cssValue(themeInline, 'font-sans')).toBe('var(--font-geist-sans)');
    expect(cssValue(themeInline, 'font-mono')).toBe('var(--font-geist-mono)');
  });

  it.each(Object.entries(front.rounded))('radius %s', (level, value) => {
    // `full` is Tailwind's built-in pill radius; the rest are multiples of --radius.
    if (level === 'full') {
      expect(value).toBe('9999px');
      expect(cssValue(themeInline, 'radius-full')).toBeUndefined();
      return;
    }
    const base = rem(cssValue(light, 'radius') ?? '');
    const expression = cssValue(themeInline, `radius-${level}`);
    expect(expression).toBeDefined();
    expect(resolveRadius(expression ?? '', base)).toBeCloseTo(rem(value), 4);
  });

  it.each(Object.entries(front.spacing))('spacing %s', (level, value) => {
    // Spacing is Tailwind's 0.25rem step, which globals.css leaves alone; the named tokens are the
    // utilities the home page is built with, so each one is checked against page.tsx.
    const steps = rem(value) / 0.25;
    const utilities: Record<string, string[]> = {
      base: [],
      gutter: [`px-${String(steps)}`],
      'gutter-sm': [`sm:px-${String(steps)}`],
      'section-sm': [`pt-${String(steps)}`, `mt-${String(steps)}`],
      section: [`lg:pt-${String(steps)}`, `lg:mt-${String(steps)}`],
      frame: ['max-w-6xl']
    };
    if (level === 'base') expect(cssValue(theme, 'spacing')).toBeUndefined();
    if (level === 'frame') expect(value).toBe('72rem');
    for (const utility of utilities[level] ?? [`unknown spacing token ${level}`]) {
      expect(page, `${level}: ${utility}`).toContain(utility);
    }
  });

  it('lists the five review breakpoints', () => {
    expect(Object.values(front.breakpoints)).toEqual([390, 768, 1024, 1440, 2560]);
  });
});
