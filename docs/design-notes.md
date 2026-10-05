> This is the Phase 3b composition study that produced D15, kept as the evidence behind that decision.
> `DESIGN.md` at the repo root is the current design authority and wins wherever the two differ.

# Design notes: composition study for Phase 3b

Pattern rules extracted from three reference sites and the previous site, measured in a browser at 1440 px (and 1000 px for the collapse) on 2026-10-05. Rules only: no CSS, markup or wording is reproduced from any site. The sites studied: Site A, a split-layout developer portfolio with a sticky identity column (the layout archetype); Site B, a blog-first personal site known for motion restraint (microcopy and motion restraint); Site C, a dense single-column personal site (density and typography); and the previous jrobitaille.dev (Gatsby, for mockup C).

## 1. What the Phase 3 page got wrong, in pattern terms

- One 72ch column for everything, so hero, prose, cards and timeline all share a width that only suits prose.
- Vertical rhythm of roughly 160 px between sections with no change of texture between them: the eye reads a stack of equal blocks, not a page.
- The three hero links are outline buttons in a row; nothing says "this is how you move around the page".
- Cards stretched to equal height put the image, title and chips in different places on each card.
- The reveal animation starts content at opacity 0, which reads as missing content while scrolling.

## 2. Grid and column widths

| Site               | Outer frame                                                | Content columns                                                                    |
| ------------------ | ---------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Site A, 1440       | 1184 px frame, 128 px side gutters                         | Left 560 px sticky (full viewport height), 16 px gap, right 607 px scrolling       |
| Site A, below 1024 | 48 px side gutters, 888 px single column                   | Header becomes a static block (208 px tall); main starts 96 px below it            |
| Site B, 1440       | 1036 px frame, 194 px side gutters                         | 627 px article column, 96 px gap, 313 px aside with chips and a ranked list        |
| Site C, 1440       | 1332 px frame, 48 px gutters                               | 600 px text column at the left edge, the rest given to one illustration            |
| Previous site      | 960 px card overlapping a full-bleed 70 vh cover by 100 px | Two equal columns at 768+ for About and Skills; timeline cards at 40 % of the card |

Rules:

- **Two widths, not one.** Prose lives at 600 to 630 px (about 65 to 72ch at 16 to 17 px). Everything else (identity column, rows, grids) gets a different, wider or narrower measure. The page needs at least two measures to read as composed.
- **Split layout: 48/52 at 1440.** The identity column is slightly narrower than the content column. The split holds from 1024 (Site A switches at `lg`, 1024 px); below it the identity column becomes a static header block.
- **Side gutters scale with the viewport:** 24 px on phones, 48 px from tablet, 96 to 128 px at 1440. Content never touches the viewport edge and never sits in the middle of a 2560 px canvas with nothing around it; the frame caps at about 1184 to 1332 px.
- **Sticky column is `position: sticky; top: 0; max-height: 100vh`** with space-between so name sits at the top, nav in the middle, social links at the bottom. No JavaScript.

## 3. Spacing scale

Measured distances, rounded to the 4 px grid:

| Role                                | Site A   | Site B | Site C   | Rule for this site                              |
| ----------------------------------- | -------- | ------ | -------- | ----------------------------------------------- |
| Frame top padding                   | 96       | 48     | 48       | 48 on phones, 96 at 1024+                       |
| Between sections (wide)             | 144      | ~96    | ~104     | 96 at 1024+, 64 below (half of current 160)     |
| Between sections (narrow)           | 96       |        |          | 64                                              |
| Section heading to first row        | 16 to 24 | 36     | 19       | 24                                              |
| Between rows in a list              | 48       | 48     | 0 + rule | 40 for work rows, 0 with hairlines for the rail |
| Inside a row (title to description) | 8        | 8      |          | 8                                               |
| Description to chip row             | 8 + 8    |        |          | 12                                              |
| Hero name to title                  | 12       |        | 23       | 12                                              |
| Title to headline                   | 16       |        |          | 16                                              |
| Headline to nav                     | 64       |        | 40       | 48                                              |
| Nav item height                     | 48       |        |          | 44 (12 px padding each side of a 20 px label)   |
| Nav to social row                   | pinned   |        |          | pinned to the column bottom, 32 min             |

Rules:

- **Section gaps are 96 px on the split layout, 64 px below it.** The current 160 px is the single biggest reason the page reads as a stack.
- **Rows are tighter than sections by about 2x,** and content inside a row is tighter again by 4x. Three distinct rhythms (section, row, in-row) make lists scannable.
- **Headings never float:** a heading sits 24 px above its content and at least 64 px below the previous section, so the gap above is always 2 to 3x the gap below.

## 4. Type scale

| Role                 | Site A                              | Site B                   | Site C                        | Rule                                                     |
| -------------------- | ----------------------------------- | ------------------------ | ----------------------------- | -------------------------------------------------------- |
| Name (h1)            | 48/48, 700, tracking -1.2 px        | 32/48, 700               | 42/49, 600, tracking -0.85 px | 40 to 48, 600, tracking -0.02em, line-height 1.0 to 1.1  |
| Title under the name | 20/28, 500                          |                          |                               | 20, 500, foreground                                      |
| Headline / one-liner | 16/24, muted, max-width 320         |                          | 17/27 body                    | 16, muted, max 36ch                                      |
| Section label        | 14, 700, uppercase, tracking 1.4 px | 16, 500, uppercase, 2 px | 23/32, 600, tracking -0.46 px | Mono 12 to 13, 600, uppercase, 0.08em (nav and headings) |
| Row title            | 16/22, 500                          | 22, 600                  | 17, 400 serif                 | 16, 600                                                  |
| Row description      | 14/21                               | 16/24 and 17/25.5 muted  | 17/27                         | 14 to 15 / 1.5, muted                                    |
| Date column          | 12, 600, uppercase, tracking 0.3 px |                          | 14 sans tabular-nums, muted   | Mono 12, tabular numerals, muted                         |
| Chip                 | 12, 500, pill, accent tint 10 %     | 14, square-ish, tinted   |                               | Mono 12, pill, accent tint 12 %                          |
| Body prose           | 16/26                               | 16/24                    | 17/27                         | 16 to 17 / 1.6                                           |
| Footer               | 14, muted, max-width 448            | dense, grouped           | minimal                       | 13, muted, one line                                      |

Rules:

- **Four sizes carry the page:** display name, body, row title (same size as body, heavier), and a small uppercase label. Everything else is a colour change, not a size change.
- **Section headings are labels, not display type.** On the split layout the nav is the section heading (Site A hides the in-column h2 visually and keeps it for assistive tech). Below 1024 the heading returns as a small sticky uppercase label with a translucent backdrop, so the reader always knows which section they are in.
- **Hierarchy in rows comes from weight and colour, not size:** the title is foreground at 600, the description is muted at 400, the date is muted mono. Site B's larger 22 px row titles suit a blog, not a list of seven rows.
- **Numerals are tabular** wherever dates sit in a column.

## 5. Links presented as navigation

- Site A's nav is a vertical list of three labels, each preceded by a short horizontal rule. The rule is 32 px and dim; the active and hovered item's rule grows to 64 px and brightens, and the label brightens with it. That single affordance says "list of places on this page" without a box, underline or button.
- Active state follows scroll position via JavaScript there. For this site the active indicator is CSS only: `:target` on the section drives the matching nav item through `:has()`, so clicking a nav link marks it, and a scroll-driven `animation-timeline: view()` on each section flips the indicator while scrolling where supported.
- Social links are a separate icon row at the bottom of the column, 24 px icons, 20 px apart, muted, brightening on hover. They are destinations off the page; the nav items are destinations on it. Keeping the two groups in different places and different forms is the whole trick.
- The three required links (Resume PDF, LinkedIn, GitHub) are off-page destinations, so they belong in the icon-plus-label row, not in the section nav. The section nav is About, Shipped, Where I've been, Toolbox.
- Site C shows the other extreme: no nav, only a 600 px column and underlined inline links with a 30 % opacity underline that darkens on hover. Good for prose links inside About; not a substitute for navigation.
- Site B's top bar is for a multi-page site; irrelevant to a one-page composition except for the rule that nav labels are plain words at body size, no decoration until hover.

## 6. Project rows

Structure, left to right on the split layout (Site A), measured:

1. Thumbnail, 2 of 8 grid columns (140 x 79 px at 1440, 16:9), 1.6 px border at 10 % white, radius 4 px, nudged down 4 px to align with the title baseline. Border brightens to 30 % on row hover.
2. Content, 6 of 8 columns: title as a link at 16/500 foreground with a small arrow glyph that moves up-right 4 px on hover; description 14/21 muted, 8 px below; chips 8 px below that.
3. The whole row is the hover target: an absolutely positioned backdrop at -16 to -24 px inset fades in behind the row (tinted surface at 50 %, inset top highlight 1 px), and sibling rows dim to 50 % while one is hovered, only at 1024+.

Rules for this site:

- **Fixed thumbnail, 160 x 100 (16:10), image on the left, text on the right.** The image is a glance aid, not the content; it never dictates row height.
- **The row is one link to the primary proof;** secondary links (npm, archive, live demo) are separate chips after the description so the row hover is honest.
- **Title, one-liner, chips, in that order, 8 px apart.** The year span goes in the chip row's right edge in mono.
- **Rows 40 px apart, no card border, no shadow.** The hover backdrop supplies the card shape only when needed.
- **Below 640 px the thumbnail stacks above the text at full column width,** keeping the same aspect ratio.

## 7. Experience rows

Site A, measured: an 8-column grid with the date range in columns 1 to 2 (12 px uppercase, muted, top-aligned with a 4 px nudge) and the role, employer, description and chips in columns 3 to 8. Rows 48 px apart. Multiple titles at one employer are listed as muted lines under the current title, so the ladder is visible without repeating the employer.

Rules for this site (compact rail list):

- **Mono date column left (about 7rem), employer and era right.** Dates in tabular mono at 12 px, muted.
- **A thin vertical rail between the two columns with a 8 px dot per era** replaces the center-rail timeline. The rail is a 1 px line in the border colour; dots are the accent.
- **Title ladder as small mono labels** on the first era where the title changes (the labelled non-heading element from D13 stays), not as a heading. Site A's "ladder under the title" is the same idea in a different place.
- **Employer is an h3 once per block; eras are h4 at body size, 600.** Era descriptor and one or two highlights at 14 to 15 px muted below.
- **Rows are 24 px apart inside a block and 40 px between blocks.** No cards, no borders. The rail carries the structure.
- **Proof link is a chip at the end of the era, same chip as the project rows.**

## 8. Hover behaviour

- **Rows:** backdrop fade (150 ms), sibling dim to 50 % (Site A) or title colour change only (Site C). Both are restrained; pick one. The backdrop is better for a row that is a single link because it shows the hit area.
- **Text links:** Site B underlines on hover with a 2 px accent underline offset 2 px; Site C underlines always at 30 % opacity and darkens on hover. For inline links in prose: always underlined with a muted underline, accent on hover.
- **Icons:** colour change only (muted to foreground), no movement.
- **Arrows and glyphs:** a 4 px nudge up-right on hover is the one allowed movement on links (Site A) and Site B's "read more" arrow is a fading chevron trail. One such glyph per row, never more.
- **Thumbnails:** border brightens; no scale, no lift. (The previous site lifted project images 5 px; Site B lifts cards 5 px. Both are fine at card scale; wrong at a 160 px thumbnail.)
- **Transitions:** 150 to 200 ms, ease-out, and every transition is inside `prefers-reduced-motion: no-preference` (Site B wraps every single one).

## 9. Personality without gimmick

- **Site B:** the wordmark has a small drawn flourish; a sound toggle exists but defaults off; the hero is generative art that the reader can regenerate; titles carry the occasional emoji. The page itself is dense, calm and restrained; the fun is in one or two places the reader chooses to touch.
- **Site A:** a cursor spotlight gradient on dark (subtle), and a footer that names the tools and typeface in one sentence. Nothing moves unless the reader hovers.
- **Site C:** no flourish at all; the personality is in the prose and one large illustration beside the text. A bio length toggle is the single interactive element.
- **Previous site:** the cover photo, the "Hi! I'm Jason!" hero line, the UFO and cow 404, a Konami egg.

Rules for this site:

- Voice lives in the four section headings (already in `site.ts`), one tagline slot and one footer line slot. Both slots stay empty until there is copy.
- One visual signature: the accent rail and dots on the experience list, repeated as the nav indicator rule. Same accent, same thickness, so the page has one mark.
- The avatar and cover photo are the human element; the 404 and the Konami egg are where the whimsy goes.
- No cursor effects, no sound, no emoji in headings, no parallax.

## 10. Motion restraint

- Site B: every animated property is wrapped in a reduced-motion query; hover motions are 5 px or less; scroll-in reveals are opt-in per article (`data-include-enter-animation`), default off.
- Site A: the only scroll-linked motion is the nav indicator; rows fade in once on first paint, not on scroll.
- Rule: scroll-driven reveal, if kept, starts at opacity 0.4 and rises 8 px at most, finishes within the first 25 % of the element entering the viewport, and runs only inside `@supports (animation-timeline: view())` and `prefers-reduced-motion: no-preference`. Content is always readable at every scroll position.

## 11. The previous site's skeleton (for mockup C)

Measured from the source: a 60 px fixed top bar in the primary colour with page links and a theme switch; a 70 vh cover with `background-attachment: fixed` and a centred white display line; a 960 px white card overlapping the cover by 100 px with 50 px padding and a drop shadow; a 200 px round avatar centred at the top of the card with a social icon row (32 px icons) under it; About and Skills side by side from 768 px; a hairline; a timeline on a 1 px centre rail with 60 px round date badges (month over year, uppercase) ringed by the background, cards at 40 % width alternating left and right, each sliding from ±50 % to 0 over 800 ms when it entered the viewport, card title bar in the primary colour with a pointer triangle; a hairline; latest GitHub repositories fetched at runtime; a footer with copyright and the same icon row. The projects page was 220 px rounded image cards with a caption in a centred row, lifting 5 px on hover.

What C keeps: cover band, overlapping centred avatar, centred name, icon row, About and Toolbox side by side at 1024+, the alternating centre-rail timeline with round date badges and cards that slide in from each side, image cards in a grid. What C drops: the fixed header bar, parallax, skill bars, runtime fetches, the uppercase title bars, the 100 px overlap (replaced by a 48 px avatar overlap on a flat page, no floating card).

## 12. Decisions carried into the mockups

- Dark is the primary canvas; light is fully supported through the existing tokens.
- Fonts: Geist for everything, Geist Mono for dates, labels, nav and chips.
- Accent: Ultraviolet only, used for the rail, dots, nav indicator, chip tint and link hover.
- Breakpoints: 640 (thumbnail stacks), 1024 (split layout begins; C's two-column About/Toolbox and alternating timeline begin), 1280 (frame reaches its maximum width).
- Frame: 1184 px maximum, side gutters 24 / 48 / 96 px.
