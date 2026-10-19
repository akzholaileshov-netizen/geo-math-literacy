export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div
      className="h-2.5 overflow-hidden rounded-full bg-ink/10 dark:bg-white/10"
      role={label ? 'progressbar' : undefined}
      aria-label={label}
      aria-valuemin={label ? 0 : undefined}
      aria-valuemax={label ? 100 : undefined}
      aria-valuenow={label ? Math.round(width) : undefined}
    >
      <div className="h-full rounded-full bg-brass shadow-glow" style={{ width: `${width}%` }} />
    </div>
  );
}

type Stage = 'calm' | 'warn' | 'urgent';

export function timerStage(secondsLeft: number): Stage {
  if (secondsLeft <= 20) return 'urgent';
  if (secondsLeft <= 60) return 'warn';
  return 'calm';
}

export function ProgressRing({
  secondsLeft,
  total,
  caption,
  label,
}: {
  secondsLeft: number;
  total: number;
  caption: string;
  label: string;
}) {
  const stage = timerStage(secondsLeft);
  const size = 92;
  const stroke = 7;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = total <= 0 ? 0 : Math.max(0, Math.min(1, secondsLeft / total));
  const color = stage === 'urgent' ? 'var(--urgent)' : stage === 'warn' ? 'var(--warn)' : 'var(--brass)';
  return (
    <div
      className={`relative grid h-[92px] w-[92px] place-items-center rounded-full ${stage === 'urgent' ? 'timer-urgent' : ''}`}
      role="timer"
      aria-label={label}
      data-stage={stage}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-ink/10 dark:text-white/15" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
        />
      </svg>
      <span className="absolute font-serif text-2xl leading-none tabular" style={{ color }}>
        {caption}
      </span>
    </div>
  );
}
