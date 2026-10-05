import Link from 'next/link';

// Root not-found: also served for every unmatched URL (out/404.html via wrangler's 404-page handling).
// not-found.tsx cannot export metadata; the title falls back to the layout default.
export default function NotFound() {
  return (
    <main id="main" className="mx-auto flex w-full max-w-prose flex-1 flex-col gap-4 px-6 py-24">
      <h1 className="text-4xl font-semibold tracking-tight">Page not found</h1>
      <p>There is nothing at this address.</p>
      <Link
        href="/"
        className="w-fit underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        Back to the home page
      </Link>
    </main>
  );
}
