---
paths:
  - "src/**/*.tsx"
  - "src/**/*.css"
---

# Styling rules (Tailwind v4 + shadcn)

- Tailwind utilities only; design tokens live in `src/styles/globals.css` under `@theme`. There is no `tailwind.config.js`.
- Dark mode follows `prefers-color-scheme` (D4). No `.dark` class, no toggle, no theme script.
- `src/components/ui/` is shadcn-owned source: edit in place, do not wrap. Install only components that are used.
- Base UI primitives ship client JS. When no behavior is needed, use a plain element with `cn()` or a `*Variants()` helper instead.
- No layout shift: explicit image sizes, `next/font`, reserved space for anything that hydrates.
- Fluid type with `clamp()`, content column capped near 72ch, one column under 640px, container queries for cards.
- Scroll-driven animations only behind `@supports` and `prefers-reduced-motion`; no IntersectionObserver for reveals.
- Components under ~150 lines, files under ~200, one component per file, `Props`-suffixed types, named exports except Next route files.
- Prettier sorts class names; never hand-order them.
