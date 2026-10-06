import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { Picture } from '@/components/ui/picture';
import { images } from '@/content/images';
import { siteCopy } from '@/content/site';

// Root not-found: also served for every unmatched URL (out/404.html via wrangler's 404-page handling).
// The previous site's UFO and cow return over the 404 backdrop; the drift respects reduced motion.
// not-found.tsx cannot export metadata; the title falls back to the layout default.
export default function NotFound() {
  return (
    <main
      id="main"
      className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 pt-4 pb-16 sm:px-6"
    >
      <div className="relative aspect-[16/5] w-full overflow-hidden rounded-2xl bg-muted">
        <Picture
          image={images['not-found']}
          priority
          sizes="(min-width: 1184px) 1120px, calc(100vw - 2rem)"
          className="block h-full w-full"
          imgClassName="h-full w-full object-cover"
        />
        <Picture
          image={images['ufo-and-cow']}
          priority
          className="float absolute top-[6%] left-[22%] block w-[30%] max-w-3xs -translate-x-1/2 sm:max-w-2xs"
          imgClassName="h-auto w-full"
        />
      </div>
      <div className="flex max-w-[72ch] flex-col gap-4 px-1">
        <h1 className="text-display font-semibold tracking-tight">{siteCopy.notFound.title}</h1>
        <p className="text-small text-muted-foreground">
          {siteCopy.notFound.body} {siteCopy.notFound.cow}
        </p>
        <Link
          href="/"
          className={buttonVariants({
            variant: 'outline',
            size: 'lg',
            className: 'w-fit hover:border-brand hover:text-brand-text'
          })}
        >
          {siteCopy.notFound.home}
        </Link>
      </div>
    </main>
  );
}
