import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'ghost' | 'soft';

const base =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass disabled:cursor-not-allowed disabled:opacity-45';

const variants: Record<Variant, string> = {
  primary: 'bg-brass text-onbrass shadow-glow hover:brightness-105',
  ghost: 'surface text-ink hover:border-brass/70 hover:shadow-glow',
  soft: 'border border-line bg-brass/12 text-ink backdrop-blur-md hover:bg-brass/20',
};

export function buttonClass(variant: Variant = 'ghost', className = ''): string {
  return `${base} ${variants[variant]} ${className}`.trim();
}

export function Button({
  variant = 'ghost',
  className = '',
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type={type} className={buttonClass(variant, className)} {...props} />;
}

export function choiceClass(state: 'idle' | 'selected' | 'correct' | 'wrong'): string {
  const shared =
    'flex min-h-11 w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left backdrop-blur-md transition disabled:cursor-default';
  if (state === 'selected') return `${shared} border-brass bg-brass/15 shadow-glow`;
  if (state === 'correct') return `${shared} border-good bg-good/12 text-ink`;
  if (state === 'wrong') return `${shared} border-bad bg-bad/12 text-ink`;
  return `${shared} surface hover:-translate-y-0.5 hover:border-brass/50`;
}
