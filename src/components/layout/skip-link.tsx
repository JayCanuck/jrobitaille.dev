// First focusable element in body (a11y.md); visually hidden until focused.
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-2 focus-visible:left-2 focus-visible:z-50 focus-visible:rounded-md focus-visible:bg-background focus-visible:px-3 focus-visible:py-2 focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      Skip to content
    </a>
  );
}
