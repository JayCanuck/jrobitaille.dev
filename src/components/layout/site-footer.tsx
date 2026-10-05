import { profile } from '@/content/resume';
import { buildYear, sourceUrl } from '@/lib/site';

const linkClass =
  'underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none';

// One line: copyright with the build year, the public email, and the source repository (D13).
export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-prose px-6 py-12 text-sm text-muted-foreground">
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
    </footer>
  );
}
