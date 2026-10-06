---
version: alpha
name: jrobitaille.dev
description: Slate and white with one Ultraviolet accent, Geist and Geist Mono, system dark mode. Describes what src/styles/globals.css and the components render; a unit test keeps the tokens equal.
colors:
  background: 'oklch(1 0 0)'
  foreground: 'oklch(0.21 0.03 265)'
  card: 'oklch(0.985 0.003 250)'
  muted: 'oklch(0.967 0.005 250)'
  muted-foreground: 'oklch(0.52 0.03 260)'
  border: 'oklch(0.91 0.01 255)'
  primary: 'oklch(0.21 0.03 265)'
  primary-foreground: 'oklch(0.985 0.003 250)'
  accent: 'oklch(0.56 0.2 300)'
  accent-foreground: 'oklch(0.985 0 0)'
  accent-text: 'oklch(0.47 0.19 300)'
  accent-soft: 'oklch(0.56 0.2 300 / 12%)'
  ring: '{colors.accent}'
  background-dark: 'oklch(0.15 0.02 265)'
  foreground-dark: 'oklch(0.95 0.01 250)'
  card-dark: 'oklch(0.2 0.025 265)'
  muted-dark: 'oklch(0.27 0.03 262)'
  muted-foreground-dark: 'oklch(0.72 0.02 255)'
  border-dark: 'oklch(1 0 0 / 12%)'
  primary-dark: 'oklch(0.93 0.01 250)'
  primary-foreground-dark: 'oklch(0.2 0.025 265)'
  accent-dark: 'oklch(0.76 0.14 300)'
  accent-foreground-dark: 'oklch(0.2 0.03 300)'
  accent-text-dark: 'oklch(0.82 0.12 300)'
  accent-soft-dark: 'oklch(0.76 0.14 300 / 14%)'
typography:
  display:
    fontFamily: Geist
    fontSize: 2rem
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: -0.025em
  h2:
    fontFamily: Geist
    fontSize: 1.5rem
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.025em
  body:
    fontFamily: Geist
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.65
  small:
    fontFamily: Geist
    fontSize: 0.9375rem
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: Geist Mono
    fontSize: 0.75rem
    fontWeight: 500
    lineHeight: 1.4
fluid:
  display: clamp(2rem, 1.3rem + 3vw, 3.25rem)
  h2: clamp(1.5rem, 1.15rem + 1.5vw, 2rem)
  label: clamp(0.75rem, 0.72rem + 0.15vw, 0.8125rem)
rounded:
  sm: 0.375rem
  md: 0.5rem
  lg: 0.625rem
  xl: 0.875rem
  2xl: 1.125rem
  3xl: 1.375rem
  4xl: 1.625rem
  full: 9999px
spacing:
  base: 0.25rem
  gutter: 1rem
  gutter-sm: 1.5rem
  section-sm: 4rem
  section: 6rem
  frame: 72rem
breakpoints:
  phone: 390
  tablet: 768
  desktop: 1024
  wide: 1440
  ultrawide: 2560
components:
  button-resume:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.accent-foreground}'
    rounded: '{rounded.full}'
    height: 36px
  button-resume-dark:
    backgroundColor: '{colors.accent-dark}'
    textColor: '{colors.accent-foreground-dark}'
  button-outline:
    backgroundColor: '{colors.background}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.lg}'
    height: 36px
  button-outline-dark:
    backgroundColor: '{colors.background-dark}'
    textColor: '{colors.foreground-dark}'
  button-default:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.primary-foreground}'
    rounded: '{rounded.lg}'
  button-default-dark:
    backgroundColor: '{colors.primary-dark}'
    textColor: '{colors.primary-foreground-dark}'
  project-card:
    backgroundColor: '{colors.card}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.xl}'
    padding: 16px
  project-card-dark:
    backgroundColor: '{colors.card-dark}'
    textColor: '{colors.foreground-dark}'
  timeline-card:
    backgroundColor: '{colors.card}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.xl}'
    padding: 16px
  timeline-card-dark:
    backgroundColor: '{colors.card-dark}'
    textColor: '{colors.foreground-dark}'
  chip-link:
    backgroundColor: '{colors.accent-soft}'
    textColor: '{colors.accent-text}'
    typography: '{typography.label}'
    rounded: '{rounded.4xl}'
    height: 24px
  chip-link-dark:
    backgroundColor: '{colors.accent-soft-dark}'
    textColor: '{colors.accent-text-dark}'
  tag:
    backgroundColor: '{colors.muted}'
    textColor: '{colors.foreground}'
    typography: '{typography.label}'
    rounded: '{rounded.4xl}'
    height: 24px
  tag-dark:
    backgroundColor: '{colors.muted-dark}'
    textColor: '{colors.foreground-dark}'
  agent-badge:
    backgroundColor: '{colors.muted}'
    textColor: '{colors.foreground}'
    typography: '{typography.label}'
    rounded: '{rounded.4xl}'
    height: 24px
  agent-badge-dark:
    backgroundColor: '{colors.muted-dark}'
    textColor: '{colors.foreground-dark}'
  year-badge:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.accent-foreground}'
    rounded: '{rounded.full}'
    size: 48px
  header:
    backgroundColor: '{colors.background}'
    textColor: '{colors.muted-foreground}'
    height: 48px
  header-dark:
    backgroundColor: '{colors.background-dark}'
    textColor: '{colors.muted-foreground-dark}'
  divider:
    backgroundColor: '{colors.border}'
  divider-dark:
    backgroundColor: '{colors.border-dark}'
  focus-ring:
    backgroundColor: '{colors.ring}'
---

# DESIGN.md

Read this before writing any UI. Every line here should change what you build.

This file describes the design that ships from `main` (D15). It does not get ahead of the code: a rule that would change rendering is a design change and ships as code with screenshots (see Do's and Don'ts), then lands here.

## Overview

A personal site that confirms a resume. Crisp where recruiters scan (hero facts, cards, timeline legibility), personality where they linger (headings with voice, the 404).

One page, one primary action: the resume. Dark is the primary canvas; light is fully supported through `prefers-color-scheme`. There is no toggle.

Technical and quiet. Nothing on the page is worth a week, and nothing should look like it was.

## Colors

Tokens only. No hex or oklch values inside components: use the Tailwind utilities that map to `src/styles/globals.css`, where the same values live under their CSS names. Merge classes with `cn` from `src/lib/utils.ts`, which knows the four type tokens as font sizes; a generic merge drops `text-label` whenever a text colour follows it. The `accent*` tokens here are `--brand*` there, because shadcn reserves `--accent` for hover surfaces; `primary` is shadcn's slate button fill, not the brand.

The accent carries the primary action (the resume pill), the link chips, the timeline rail with its dots and year badges, the short rule before each section heading, the bullet markers and the title rungs, and link text on hover. Everything else is slate.

`accent-text` is the accent at a contrast-safe lightness for text on the page background; `accent` is for fills and rings. Text passes 4.5:1 on its background in both schemes, and axe checks the rendered page.

## Typography

Geist for body and headings. Geist Mono for labels, dates, the timeline rungs, chips, the header nav and the footer.

Both faces are self-hosted through `next/font`, preloaded, with the default swap, and paired with a hand-written metric-adjusted fallback face that resolves the closest local face each platform has (Arial, Liberation Sans, Arimo, Roboto, in that order) under one set of overrides, with `size-adjust` calibrated on this site's own text (103.34% sans, 126% mono). A font that lands after first paint is swapped in, and the centred hero text re-centres by a few pixels when it does: a measured, sub-perceptual shift (0.0003 at 1280px, up to 0.0008 and rare at 390px) that is accepted, and that the e2e holds under 0.005 with every source a hero re-centre. `font-display: optional` was rejected: it reaches zero by never swapping a late font in, which costs a slow first-load visitor the typeface for the whole visit (D15 amendment). Every row that could wrap differently between the two faces has a fixed line count instead (the headline is two explicit lines on phones and one from 640px, the actions row never wraps, the timeline labels are one line), so a late font moves nothing else; the delayed-font e2e holds that on whatever face the machine resolves, with the About prose the one block allowed to reflow.

Four weights are in use: 400 for body text, 500 for the title line under the name, chips, tags, group labels and the header nav (shadcn's badge and button defaults), 600 for the name, headings and card titles, 700 for the year badge.

`body` is fixed at 16px for prose at every width; `small` is the 15px secondary step for card text (project blurbs, timeline descriptors and highlights, the 404 line). The fluid scale (`fluid` above) covers `display` for the name, `h2` for section headings and `label` for mono labels; each of those `typography` tokens holds the level's floor at 390px; `label` bottoms out at 12px and reaches 13px by 1024px. Inside a card the hierarchy is title 16px at 600, text 15px at 400, labels and dates at the label scale; the year badge is 12px (13px from 1024px).

Section headings carry the voice ("Hello", "Things I've built", "Where I've been", "Toolbox"); nothing else is written with voice.

## Layout

Prose runs at 62ch. Everything else sits in a 72rem frame (`max-w-6xl`) with 1rem side gutters on phones and 1.5rem from 640px; the cover band is the one full-bleed element. The cover itself is a fixed layer behind the band, so the page scrolls over it and every block after the band carries the page background. Each section targeted by the header links has a 56px scroll margin (the 48px header plus 8px), so a nav click lands the heading below the header.

Spacing is Tailwind's 0.25rem step. Sections are `section-sm` (4rem) apart on phones and `section` (6rem) from 1024px, separated by hairlines; cards are 1.25rem apart, timeline rows 1.5rem on the single rail and 2rem on the centre rail.

About sits beside Toolbox from 1024px, 7 to 5. Below the Toolbox heading is one reserved box whose height is the larger of the chip block and a square of the column width (a container query, so it holds at 390px and above); the chips render inside it at first paint, and the cloud, when it mounts, overlays them inside the same box, so the box never changes size. The six cards are one column, two from 640px and three equal columns from 1024px, two rows of three. The timeline runs on a single left rail below 1024px and an interleaved centre rail above it, each card starting at the previous card's midpoint; a title rung with a single era sits a third closer to its neighbours.

Build for 390 first, then check 1024, 1440 and 2560; the e2e suite also runs 768 and 1280.

## Elevation & Depth

Hierarchy comes from the card surface against the page and a 1px edge: project cards carry a `ring-1` at 10% foreground, timeline cards a border. Hairlines divide sections; the header has a bottom border.

Shadows are small and few: timeline cards rest on `shadow-xs`, project cards gain `shadow-md` and a 2px lift on hover, the avatar sits on `shadow-lg` inside a 6px ring of the page background. Nothing else casts a shadow.

## Shapes

The base radius is 0.625rem; the scale is multiples of it (`rounded` above). Cards use `xl` (0.875rem), outline buttons `lg`, chips and tags the `4xl` pill, the resume pill, avatar and year badges `full`. The cover band and the timeline rail are square; the rail is 1px.

## Components

Reuse an existing component before creating one. The page is built from: the fixed header (name, the resume pill at its 28px small size and the section links at that height, on one line), the hero (a fixed cover cropped to its top with a bottom fade and an accent tint in dark, a transparent band over it, overlapping avatar, name, title, the headline as two explicit lines on phones and one from 640px, location, the resume pill at its 36px button size with the two links at the same height and their icons on the label's x-height, the three on one 36px row that never wraps, with a 1rem gap and a 0.75rem pill padding on phones and 1.5rem and 1rem from 640px, so a wider fallback face cannot add a second line), six project cards, timeline nodes with year badges, chip groups, and the one-line footer.

A project card is, top to bottom, the image, the year span as a mono label, the title, the one-line blurb and a row of proof chips only, so the row wraps freely. The card is one link to its primary proof: the title anchor stretches over the card, and both proof chips are anchors above it, the primary to the same destination. Hover lifts the card 2px and brightens its ring.

One chip shape, 24px tall with a 16px line height, mono label, pill radius, nothing clipped or transitioned: every proof link is an accent chip (accent soft fill, accent text) and a real anchor, and the card chips are the only proof links on the page; the grey tag with the muted fill is for Toolbox terms and for the one button chip, the agent-tools badge. Prose links are underlined with a muted underline and take the accent on hover.

Toolbox (D18): the cloud is the primary view and the chips are the fallback. The cloud is the same terms as sprites on a slowly turning sphere in Geist Mono, slate by depth (foreground at the front to muted-foreground at the back, no new colour), never below 13px and at most 16px; hover pauses it. The chips are the view at first paint, without JavaScript, under reduced motion or reduced data, without WebGL and after any load error. Once the cloud has mounted the chips fade to opacity 0 and ignore the pointer but stay in the DOM and the accessibility tree, and a mono control appears right-aligned in the heading row, two buttons at the label scale, "List" and "Cloud", each a real button with `aria-pressed`; List fades the chips back and pauses the cloud, and nothing is persisted.

The footer keeps a reserved 24px row under its line for the agent-tools badge (D17): empty in the exported HTML, filled after the page is idle and the WebMCP tools have registered, so nothing shifts. The badge is a grey tag that is a button; it opens a native popover toggletip, a card-surfaced note at the small size with the hairline border and the medium shadow, in the top layer so it moves nothing either. The badge takes the accent soft fill and accent text on hover, like a proof chip.

A timeline node is a bordered card with the era name, years in mono, descriptor and one or two highlights with accent markers, and no links, since the cards carry the proof and the timeline carries the chronology; its year badge sits on the rail, 48px (56px from 1024px), accent fill, bold start year only; the card beside it carries the full range. A 1px hairline in the rail's colour joins the card's rail-facing edge to the badge, level with the badge's centre and exactly the gap long, under the badge; it is part of the card, so it slides in with the card and is static under reduced motion.

Every interactive element has a hover state and a visible `focus-visible` ring. Every image has a sized slot: explicit width and height, AVIF with WebP fallback. The six card images are one 800×500 file each, since every card slot is the same width and at most 355px wide; the cover and 404 backdrops keep their 640 and 1280 variants.

The header fades in once the hero has fully scrolled out: a 200ms fade that plays forwards at that threshold and backwards when the hero returns where animation triggers exist, a scroll-linked fade over the last 15% of the hero's exit where only scroll-driven animation exists, and simply visible otherwise. Opacity only, so it is always in the tab order and shows itself on focus.

## Do's and Don'ts

- Do open the page and compare it to this file before a PR: `npm run visual-check` at 390, 1024, 1440 and 2560 in both schemes, and `--motion` after any motion change.
- Do ship a change to this file that alters rendering as its own PR: before and after visual-check runs are taken on `main` and on the branch, kept under `.visual/`, and the PR body states what differs per pair. Screenshots are never attached or committed. A documentation PR changes no pixels.
- Do keep motion as texture: scroll-driven only inside `@supports (animation-timeline: scroll())` and `prefers-reduced-motion: no-preference`, reveals fill forwards and never start below 0.4 opacity, a load-time stagger on the hero only, and the header's threshold fade inside its own `@supports`. Nothing is invisible without motion support, and the cover does not drift: it is a fixed layer the page scrolls over.
- Do keep the cloud lazy and optional (D18): it loads only when the page has gone idle after load, the Toolbox box is within 200px of the viewport, and the visitor has given one input event after load (wheel, touchstart, touchmove, keydown, pointerdown or pointermove, attached once with passive listeners). Intent means an input event, never a scroll event: hash arrivals, scroll restoration and anchor navigation all dispatch `scroll` without the visitor doing anything. Never under `prefers-reduced-motion`, `prefers-reduced-data` or `saveData`, and never without WebGL. The 13px type floor applies inside the cloud at every depth. The chip list stays visible in every state the cloud does not reach.
- Do run `npm run design:lint` after editing the front matter; `src/styles/tokens.test.ts` fails if a token here drifts from `globals.css` or the page's spacing utilities.
- Don't add gradients, emoji icons or a new colour to make it pop. The cover band's bottom fade is the one named exception.
- Don't add client components for decoration. Every component is a Server Component unless a feature needs the browser.
- Don't put a hex value in a component. The manifest and the Open Graph image are built outside the stylesheet and are the only files allowed one.
