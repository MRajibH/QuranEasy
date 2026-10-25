/** Rub el Hizb–inspired mark: eight-pointed star over an open book. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" rx="16" fill="var(--primary)" />
      <g transform="translate(32 30)">
        <rect x="-13" y="-13" width="26" height="26" fill="none" stroke="var(--accent-soft)" strokeWidth="3" />
        <rect x="-13" y="-13" width="26" height="26" fill="none" stroke="var(--accent-soft)" strokeWidth="3" transform="rotate(45)" />
        <circle r="5" fill="var(--accent-soft)" />
      </g>
      <path d="M14 50 Q23 45 32 50 Q41 45 50 50" fill="none" stroke="var(--accent-soft)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
