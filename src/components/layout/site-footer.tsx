import { Island } from '@/components/islands/island';
import { profile } from '@/content/resume';
import { siteCopy } from '@/content/site';
import { buildYear, sourceUrl } from '@/lib/site';

const linkClass =
  'underline-offset-4 hover:text-brand-text hover:underline focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none';

// One centred line: copyright with the build year, the public email, and the source repository
// (D13), plus the playful slot line when it has copy (D14).
export function SiteFooter() {
  return (
    <footer className="relative z-10 flex w-full flex-col items-center gap-2 bg-background px-4 py-12 text-center font-mono text-label text-muted-foreground sm:px-6">
      <p>
        © {buildYear} {profile.name} ·{' '}
        <a href={`mailto:${profile.email}`} className={linkClass}>
          {profile.email}
        </a>{' '}
        ·{' '}
        <a href={sourceUrl} rel="noopener noreferrer" className={linkClass}>
          Source
        </a>
      </p>
      {siteCopy.footerLine && <p>{siteCopy.footerLine}</p>}
      {/* Reserved 24 px row for the agent-tools badge, so its arrival after idle shifts nothing. */}
      <div className="flex h-6 items-center justify-center">
        <Island name="webmcp" />
      </div>
    </footer>
  );
}
