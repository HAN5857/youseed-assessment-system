// Bahasa Melayu identity glyphs — Sang Kancil (the folklore mouse-deer) plus
// wau (moon kite) and bunga raya (hibiscus) motifs. Pure inline SVG so they
// theme with the surrounding CSS and need no assets.

export function SangKancil({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" role="img" aria-label="Sang Kancil, pemandu Bahasa Melayu">
      {/* soft shadow */}
      <ellipse cx="100" cy="182" rx="58" ry="10" fill="#2a2118" opacity=".10" />
      {/* legs */}
      <rect x="74" y="150" width="12" height="28" rx="6" fill="#a9713b" />
      <rect x="114" y="150" width="12" height="28" rx="6" fill="#a9713b" />
      {/* body */}
      <ellipse cx="100" cy="128" rx="52" ry="42" fill="#c88a4a" />
      <ellipse cx="100" cy="140" rx="34" ry="26" fill="#f4e3c8" />
      {/* tail */}
      <path d="M150 120 q22 -6 20 14 q-14 4 -20 -14z" fill="#a9713b" />
      {/* head */}
      <ellipse cx="100" cy="74" rx="40" ry="36" fill="#c88a4a" />
      {/* ears */}
      <ellipse cx="66" cy="46" rx="12" ry="20" fill="#c88a4a" transform="rotate(-24 66 46)" />
      <ellipse cx="134" cy="46" rx="12" ry="20" fill="#c88a4a" transform="rotate(24 134 46)" />
      <ellipse cx="67" cy="48" rx="6" ry="12" fill="#eab99a" transform="rotate(-24 67 48)" />
      <ellipse cx="133" cy="48" rx="6" ry="12" fill="#eab99a" transform="rotate(24 133 48)" />
      {/* muzzle */}
      <ellipse cx="100" cy="90" rx="24" ry="18" fill="#f4e3c8" />
      {/* eyes */}
      <circle cx="84" cy="72" r="8" fill="#2a2118" /><circle cx="116" cy="72" r="8" fill="#2a2118" />
      <circle cx="86.5" cy="69.5" r="2.6" fill="#fff" /><circle cx="118.5" cy="69.5" r="2.6" fill="#fff" />
      {/* nose + smile */}
      <ellipse cx="100" cy="86" rx="6" ry="4.4" fill="#7a4a2a" />
      <path d="M100 90 v6 M88 98 q12 10 24 0" stroke="#7a4a2a" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* cheeks */}
      <circle cx="72" cy="90" r="6" fill="#e8896f" opacity=".55" /><circle cx="128" cy="90" r="6" fill="#e8896f" opacity=".55" />
      {/* songket sash accent */}
      <path d="M62 132 q38 20 76 0" stroke="#c99a2e" strokeWidth="6" fill="none" strokeLinecap="round" opacity=".9" />
      <path d="M62 132 q38 20 76 0" stroke="#d63a34" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="2 6" />
    </svg>
  );
}

export function WauGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 160" role="img" aria-hidden="true">
      <g stroke="#c99a2e" strokeWidth="2" fill="none">
        <path d="M60 8 C30 34 22 56 34 72 C46 56 74 56 86 72 C98 56 90 34 60 8 Z" fill="#d63a34" opacity=".18" />
        <path d="M34 72 C22 92 34 112 60 120 C86 112 98 92 86 72 C74 88 46 88 34 72 Z" fill="#1f8a70" opacity=".18" />
        <line x1="60" y1="8" x2="60" y2="120" />
        <path d="M60 120 q-8 22 -18 32 M60 120 q8 22 18 32 M60 120 v34" />
      </g>
    </svg>
  );
}

export function BungaRaya({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" role="img" aria-hidden="true">
      <g fill="#d63a34">
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="50" cy="26" rx="16" ry="24" transform={`rotate(${a} 50 50)`} opacity=".9" />
        ))}
      </g>
      <circle cx="50" cy="50" r="10" fill="#e0a93b" />
      <line x1="50" y1="50" x2="50" y2="14" stroke="#c99a2e" strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="14" r="3.5" fill="#c99a2e" />
    </svg>
  );
}
