export function SectionHeader({
  eyebrow,
  title,
  lead,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
}) {
  return (
    <header className="measure">
      {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brass">{eyebrow}</p> : null}
      <h1 className={`${eyebrow ? 'mt-2' : ''} font-serif text-4xl leading-[1.15] text-ink sm:text-5xl`}>{title}</h1>
      {lead ? <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">{lead}</p> : null}
    </header>
  );
}
