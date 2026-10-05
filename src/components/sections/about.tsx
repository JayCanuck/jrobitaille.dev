import { profile } from '@/content/resume';

// The LinkedIn About text, verbatim (D5).
export function About() {
  return (
    <section aria-labelledby="about-heading" className="flex flex-col gap-4">
      <h2 id="about-heading" className="text-2xl font-semibold tracking-tight">
        About
      </h2>
      {profile.about.map(paragraph => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </section>
  );
}
