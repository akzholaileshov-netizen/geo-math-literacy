/** Seconds allowed for each quiz question. Do not change for tests. */
export const QUESTION_SECONDS = 300;

export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/** Hours included when the total is at least one hour. */
export function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  if (hours <= 0) return formatClock(safe);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
