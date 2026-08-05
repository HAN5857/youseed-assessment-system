import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { title?: string };

function Svg({ title, children, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true} role={title ? "img" : undefined} {...props}>
      {title && <title>{title}</title>}
      {children}
    </svg>
  );
}

export function SealGlyph(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.25" y="3.25" width="17.5" height="17.5" rx="4" fill="currentColor" />
      <path d="M7.2 8.1h3.2m3.2 0h3.2M9 6.4v4.2m6-4.2v4.2M7.1 13.2h9.8M8.5 13.2v4.2m7-4.2v4.2m-7 0h7" stroke="white" strokeWidth="1.45" strokeLinecap="round" />
    </Svg>
  );
}

export function ScrollGlyph(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7 5.25h10a2.25 2.25 0 0 1 0 4.5H8.5A2.5 2.5 0 0 0 6 12.25v5.5A2.25 2.25 0 0 0 8.25 20H17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 9.75v8a2.25 2.25 0 0 0 4.5 0V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9.5 13h4.75M9.5 16h3" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
    </Svg>
  );
}

export function BambooGlyph(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9.5 21 11 3m3.5 18L13 3M9.8 17h4.4M10.15 12h3.7M10.55 7h2.9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M10.4 8.6C7 8.3 5.1 6.8 4.4 4.6c3.4.05 5.55 1.4 6.25 3.9M13.6 13.6c3.4-.3 5.3-1.8 6-4-3.4.05-5.55 1.4-6.25 3.9" fill="currentColor" opacity=".85" />
    </Svg>
  );
}

export function CompassGlyph(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.75" stroke="currentColor" strokeWidth="1.7" />
      <path d="m14.9 9.1-1.45 4.35L9.1 14.9l1.45-4.35L14.9 9.1Z" fill="currentColor" />
      <circle cx="12" cy="12" r="1.1" fill="white" />
    </Svg>
  );
}

export function InkBrushGlyph(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m14.6 4.1 5.3 5.3-8.55 8.55-5.3.85.85-5.3L14.6 4.1Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="m13.25 5.7 5.05 5.05M6.3 18.25c-.65 1.3-1.75 2.05-3.3 2.25 1.2-1 1.75-2.15 1.65-3.45" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
    </Svg>
  );
}

export function SoundWavesGlyph(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 10v4h3l4 3.5v-11L7 10H4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M14.2 9a4.25 4.25 0 0 1 0 6M16.7 6.6a7.5 7.5 0 0 1 0 10.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </Svg>
  );
}

export function CheckGlyph(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" fill="currentColor" />
      <path d="m7.75 12.1 2.65 2.65 5.85-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ArrowGlyph({ direction = "right", ...props }: IconProps & { direction?: "left" | "right" }) {
  return (
    <Svg {...props} style={{ transform: direction === "left" ? "rotate(180deg)" : undefined, ...props.style }}>
      <path d="M5 12h13m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function MandarinCompanion({ mood = "welcome", className = "" }: { mood?: "welcome" | "ready" | "celebrate"; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 150 126" role="img" aria-label={mood === "celebrate" ? "小墨为你庆祝" : "小墨陪你探索华文"}>
      <defs>
        <linearGradient id="mo-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2F8F68" />
          <stop offset="1" stopColor="#176348" />
        </linearGradient>
        <linearGradient id="mo-page" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFDF7" />
          <stop offset="1" stopColor="#F8E9C8" />
        </linearGradient>
      </defs>
      <path d="M68 27c-6-13-1-23 12-27 3 12-1 21-12 27Z" fill="#53AA78" />
      <path d="M67 27C57 16 46 18 39 29c11 5 20 4 28-2Z" fill="#83C99A" />
      <rect x="35" y="24" width="78" height="78" rx="28" fill="url(#mo-body)" />
      <circle cx="61" cy="57" r="4" fill="#152A24" />
      <circle cx="87" cy="57" r="4" fill="#152A24" />
      <circle cx="60" cy="56" r="1.2" fill="white" />
      <circle cx="86" cy="56" r="1.2" fill="white" />
      <path d={mood === "ready" ? "M67 70h15" : "M66 68c5 6 12 6 17 0"} fill="none" stroke="#FFF8EA" strokeWidth="3" strokeLinecap="round" />
      <path d="M46 90c-4 8-4 17 0 27M103 90c4 8 4 17 0 27" stroke="#176348" strokeWidth="9" strokeLinecap="round" />
      <path d="M55 85c12-5 26-5 39 0v33c-13-5-27-5-39 0V85Z" fill="url(#mo-page)" stroke="#D9B76D" strokeWidth="2" />
      <path d="M74.5 84v34M61 94h8m11 0h8M61 101h7m12 0h6" stroke="#C94A43" strokeWidth="2" strokeLinecap="round" />
      {mood === "celebrate" && (
        <g fill="#D9A12E">
          <path d="m24 22 2.2 5.3 5.8.5-4.4 3.8 1.3 5.6-4.9-3-5 3 1.4-5.6-4.4-3.8 5.8-.5L24 22Z" />
          <path d="m126 15 1.7 4.2 4.6.4-3.5 3 1.1 4.5-3.9-2.4-4 2.4 1.1-4.5-3.5-3 4.6-.4 1.8-4.2Z" />
        </g>
      )}
    </svg>
  );
}
