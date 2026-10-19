import type { ReactNode } from 'react';

export function Badge({ children, tone = 'brass' }: { children: ReactNode; tone?: 'brass' | 'good' | 'bad' | 'muted' }) {
  const tones = {
    brass: 'border-brass/40 bg-brass/12 text-brass-deep dark:text-brass',
    good: 'border-good/40 bg-good/12 text-good',
    bad: 'border-bad/40 bg-bad/12 text-bad',
    muted: 'border-line bg-elev/70 text-muted',
  };
  return (
    <span className={`inline-flex min-h-7 items-center rounded-full border px-2.5 text-xs font-semibold tracking-wide ${tones[tone]}`}>
      {children}
    </span>
  );
}
