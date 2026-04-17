"use client";

// Friendly SVG mascot — a little fox/cat hybrid. Pure CSS animations, no deps.
// Props let you change mood for different contexts.

import clsx from "clsx";

export type MascotMood = "happy" | "cheer" | "think" | "wave";

export function Mascot({
  mood = "happy",
  size = 120,
  className,
}: {
  mood?: MascotMood;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "inline-block",
        mood === "cheer" && "kid-wiggle",
        mood === "wave" && "kid-bounce",
        mood === "think" && "kid-float",
        className
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg viewBox="0 0 120 120" width={size} height={size}>
        {/* Body */}
        <ellipse cx="60" cy="78" rx="34" ry="30" fill="#fb923c" />
        <ellipse cx="60" cy="82" rx="22" ry="18" fill="#fde68a" />
        {/* Ears */}
        <path d="M30 40 L36 18 L48 34 Z" fill="#fb923c" />
        <path d="M90 40 L84 18 L72 34 Z" fill="#fb923c" />
        <path d="M34 35 L38 22 L44 32 Z" fill="#ec4899" />
        <path d="M86 35 L82 22 L76 32 Z" fill="#ec4899" />
        {/* Head */}
        <circle cx="60" cy="52" r="28" fill="#fb923c" />
        <ellipse cx="60" cy="60" rx="18" ry="14" fill="#fde68a" />
        {/* Eyes */}
        <circle cx="48" cy="48" r="5" fill="#1f2937" />
        <circle cx="72" cy="48" r="5" fill="#1f2937" />
        <circle cx="50" cy="46" r="1.5" fill="#fff" />
        <circle cx="74" cy="46" r="1.5" fill="#fff" />
        {/* Cheeks */}
        <circle cx="42" cy="58" r="4" fill="#ff99c8" opacity="0.8" />
        <circle cx="78" cy="58" r="4" fill="#ff99c8" opacity="0.8" />
        {/* Mouth */}
        {mood === "cheer" ? (
          <path d="M50 62 Q60 74 70 62" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" fill="none" />
        ) : mood === "think" ? (
          <circle cx="60" cy="64" r="2.5" fill="#1f2937" />
        ) : mood === "wave" ? (
          <path d="M54 64 Q60 70 66 64" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" fill="none" />
        ) : (
          <path d="M54 62 Q60 68 66 62" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" fill="none" />
        )}
        {/* Nose */}
        <ellipse cx="60" cy="56" rx="2.5" ry="2" fill="#1f2937" />
      </svg>
    </div>
  );
}
