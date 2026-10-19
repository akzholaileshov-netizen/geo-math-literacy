import type { HTMLAttributes, ReactNode } from 'react';

export function GlassPanel({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={`surface rounded-3xl ${className}`} {...props}>
      {children}
    </div>
  );
}

export function Card({
  className = '',
  children,
  lift = false,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode; lift?: boolean }) {
  return (
    <div className={`surface shimmer rounded-3xl ${lift ? 'surface-lift' : ''} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function AccordionPanel({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <div className={`accordion-panel ${open ? 'is-open' : ''}`} inert={open ? undefined : true}>
      <div className="accordion-inner">{children}</div>
    </div>
  );
}
