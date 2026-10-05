interface SectionHeadingProps {
  id: string;
  children: string;
}

// Section h2 with a short brand rule: the one consistent mark of the accent across the page.
export function SectionHeading({ id, children }: SectionHeadingProps) {
  return (
    <h2 id={id} className="flex items-center gap-3 text-h2 font-semibold tracking-tight">
      <span aria-hidden="true" className="inline-block h-0.5 w-6 shrink-0 rounded-full bg-brand" />
      {children}
    </h2>
  );
}
