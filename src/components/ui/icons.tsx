export function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden className="shrink-0">
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M12 2.5v2.2M12 19.3v2.2M4.8 4.8l1.6 1.6M17.6 17.6l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.8 19.2l1.6-1.6M17.6 6.4l1.6-1.6" />
    </svg>
  );
}

export function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden className="shrink-0">
      <path fill="currentColor" d="M15.5 2.5a8.8 8.8 0 1 0 6 14.2A8 8 0 0 1 15.5 2.5Z" />
    </svg>
  );
}

export function HintIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden className="shrink-0">
      <path
        fill="currentColor"
        d="M9 21h6v-1.2H9V21Zm3-19a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2Zm2.2 11.2-.2.2V15h-4v-1.6l-.2-.2A5 5 0 1 1 14.2 13.2Z"
      />
    </svg>
  );
}

export function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden className="shrink-0">
      <path
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        d="M7 3.5h10a1 1 0 0 1 1 1V21l-6-3.4L6 21V4.5a1 1 0 0 1 1-1Z"
      />
    </svg>
  );
}
