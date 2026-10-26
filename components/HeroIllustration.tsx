/** Golden-hour arched window with mosque silhouettes, a wooden rehal and an ornamented mus'haf. */
export function HeroIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 560 600" className={className} role="img" aria-label="Qur'an on a wooden stand by a mosque window">
      <defs>
        <linearGradient id="hi-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a3a4a" />
          <stop offset="38%" stopColor="#c9893f" />
          <stop offset="70%" stopColor="#f0c274" />
          <stop offset="100%" stopColor="#8a5a2e" />
        </linearGradient>
        <radialGradient id="hi-sun" cx="0.5" cy="0.62" r="0.45">
          <stop offset="0%" stopColor="#ffe3a3" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffe3a3" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hi-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#f3c672" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#f3c672" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hi-wood" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9a6234" />
          <stop offset="100%" stopColor="#4a2914" />
        </linearGradient>
        <linearGradient id="hi-wood-dark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6e4021" />
          <stop offset="100%" stopColor="#331b0c" />
        </linearGradient>
        <linearGradient id="hi-cover" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#167a5c" />
          <stop offset="100%" stopColor="#0a3d2f" />
        </linearGradient>
        <linearGradient id="hi-table" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a2c17" />
          <stop offset="100%" stopColor="#1c0f07" />
        </linearGradient>
        <clipPath id="hi-arch">
          <path d="M150 470 V230 A130 130 0 0 1 410 230 V470 Z" />
        </clipPath>
      </defs>

      {/* window */}
      <g clipPath="url(#hi-arch)">
        <rect x="140" y="90" width="280" height="390" fill="url(#hi-sky)" />
        <circle cx="280" cy="380" r="150" fill="url(#hi-sun)" />
        <g fill="#3b2617" opacity="0.8">
          <rect x="182" y="300" width="9" height="170" />
          <path d="M178 300 L186.5 270 L195 300 Z" />
          <rect x="368" y="290" width="9" height="180" />
          <path d="M364 290 L372.5 258 L381 290 Z" />
          <path d="M215 470 V400 A65 65 0 0 1 345 400 V470 Z" />
          <rect x="276" y="318" width="8" height="22" />
          <path d="M150 470 V430 A30 30 0 0 1 210 430 V470 Z" />
          <path d="M350 470 V425 A32 32 0 0 1 414 425 V470 Z" />
        </g>
      </g>
      <path d="M150 470 V230 A130 130 0 0 1 410 230 V470" fill="none" stroke="#e0b65c" strokeOpacity="0.45" strokeWidth="10" />
      <path d="M128 476 V228 A152 152 0 0 1 432 228 V476" fill="none" stroke="#e0b65c" strokeOpacity="0.18" strokeWidth="4" />
      <rect x="118" y="470" width="324" height="14" rx="4" fill="#5a3a22" />

      {/* table */}
      <rect x="0" y="540" width="560" height="60" fill="url(#hi-table)" />
      <ellipse cx="300" cy="470" rx="230" ry="120" fill="url(#hi-glow)" />

      {/* rehal (folding stand) */}
      <polygon points="150,560 182,570 420,445 392,433" fill="url(#hi-wood-dark)" />
      <polygon points="420,565 452,553 222,433 196,446" fill="url(#hi-wood)" />
      <path d="M268 520 Q300 495 332 520" fill="none" stroke="#2b1709" strokeWidth="5" />

      {/* mus'haf */}
      <polygon points="185,452 392,382 424,432 214,505" fill="#efe3c4" />
      <polygon points="214,505 424,432 427,444 217,518" fill="#d9c79c" />
      <polygon points="180,440 390,370 422,420 210,494" fill="url(#hi-cover)" />
      <polygon points="196,442 386,379 408,416 218,481" fill="none" stroke="#e0b65c" strokeWidth="3" />
      <g transform="translate(301 431) rotate(-18) scale(1 0.62)">
        <circle r="36" fill="none" stroke="#e0b65c" strokeWidth="4" />
        <rect x="-22" y="-22" width="44" height="44" fill="none" stroke="#e0b65c" strokeWidth="3" />
        <rect x="-22" y="-22" width="44" height="44" fill="none" stroke="#e0b65c" strokeWidth="3" transform="rotate(45)" />
        <circle r="9" fill="#e0b65c" />
      </g>
    </svg>
  );
}
