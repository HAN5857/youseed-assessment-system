"use client";

// Shared kid-friendly option card — theme + tier aware.
//   playful + primary: full rainbow palette + sparkle burst + hover lift/rotate + bounce on select.
//   calm + primary:    green palette family (S1-S3).
//   calm + upper:      single-accent academic style — white card, hover lift,
//                      green ring + checkmark on select, no sparkle burst,
//                      no rotation. Used for S4-S6 to feel less childish.
// Used by SINGLE, MULTI, LISTENING, and sub-questions in READING.

import { sound } from "@/lib/sounds";
import clsx from "clsx";
import { useState } from "react";
import { useUiTheme, useUiTier } from "@/lib/ui-theme";

const COLORS_PLAYFUL = [
  { bg: "bg-pink-400",   hover: "hover:bg-pink-500",   ring: "ring-pink-300",   badge: "bg-pink-500",   spark: "#ec4899" },
  { bg: "bg-sky-400",    hover: "hover:bg-sky-500",    ring: "ring-sky-300",    badge: "bg-sky-500",    spark: "#0ea5e9" },
  { bg: "bg-yellow-400", hover: "hover:bg-yellow-500", ring: "ring-yellow-300", badge: "bg-yellow-500", spark: "#eab308" },
  { bg: "bg-emerald-400",hover: "hover:bg-emerald-500",ring: "ring-emerald-300",badge: "bg-emerald-500",spark: "#10b981" },
  { bg: "bg-violet-400", hover: "hover:bg-violet-500", ring: "ring-violet-300", badge: "bg-violet-500", spark: "#a855f7" },
  { bg: "bg-orange-400", hover: "hover:bg-orange-500", ring: "ring-orange-300", badge: "bg-orange-500", spark: "#f97316" },
];

const COLORS_CALM = [
  { bg: "bg-emerald-400", hover: "hover:bg-emerald-500", ring: "ring-emerald-300", badge: "bg-emerald-500", spark: "#10b981" },
  { bg: "bg-teal-400",    hover: "hover:bg-teal-500",    ring: "ring-teal-300",    badge: "bg-teal-500",    spark: "#14b8a6" },
  { bg: "bg-lime-400",    hover: "hover:bg-lime-500",    ring: "ring-lime-300",    badge: "bg-lime-500",    spark: "#84cc16" },
  { bg: "bg-green-400",   hover: "hover:bg-green-500",   ring: "ring-green-300",   badge: "bg-green-500",   spark: "#22c55e" },
  { bg: "bg-emerald-500", hover: "hover:bg-emerald-600", ring: "ring-emerald-400", badge: "bg-emerald-600", spark: "#059669" },
  { bg: "bg-teal-500",    hover: "hover:bg-teal-600",    ring: "ring-teal-400",    badge: "bg-teal-600",    spark: "#0d9488" },
];

export function OptionCard({
  index,
  badge,
  text,
  selected,
  onSelect,
  multi = false,
}: {
  index: number;
  badge: string;
  text: string;
  selected: boolean;
  onSelect: () => void;
  multi?: boolean;
}) {
  const theme = useUiTheme();
  const tier = useUiTier();
  const upper = theme === "calm" && tier === "upper-primary";
  const palette = theme === "calm" ? COLORS_CALM : COLORS_PLAYFUL;
  const c = palette[index % palette.length];
  const [burstKey, setBurstKey] = useState(0);

  const handleClick = () => {
    sound().play("select");
    if (!upper) setBurstKey((k) => k + 1);
    onSelect();
  };

  // ── Upper-primary: clean academic card ────────────────────────────────
  if (upper) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={clsx(
          "group relative flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all duration-200 sm:gap-4 sm:p-5",
          "hover:-translate-y-0.5 active:translate-y-0",
          selected
            ? "border-[#18A65B] bg-[#EAF8F0] text-[#1F2937] shadow-[0_4px_14px_rgba(24,166,91,0.18)] ring-2 ring-[#18A65B]/30"
            : "border-[#DDEFE4] bg-white text-[#1F2937] hover:border-[#18A65B]/60 hover:bg-[#F7FBF8]"
        )}
        aria-pressed={selected}
      >
        <span
          className={clsx(
            "grid h-10 w-10 flex-none place-items-center rounded-lg text-base font-bold transition-colors sm:h-11 sm:w-11 sm:text-lg",
            selected ? "bg-[#18A65B] text-white" : "bg-[#F7FBF8] text-[#138a4a] border border-[#DDEFE4]"
          )}
        >
          {badge}
        </span>
        <span className="flex-1 text-[15px] font-medium leading-snug sm:text-base">{text}</span>
        {selected && (
          <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-[#18A65B] text-white shadow-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              {multi ? <path d="M20 6 9 17l-5-5" /> : <path d="M20 6 9 17l-5-5" />}
            </svg>
          </span>
        )}
      </button>
    );
  }

  // ── Primary tier (S1-S3 calm, or any playful): unchanged behaviour ────
  const checkColor = theme === "calm" ? "text-emerald-600" : "text-emerald-500";

  return (
    <button
      type="button"
      onClick={handleClick}
      className={clsx(
        "group relative flex w-full items-center gap-3 overflow-visible rounded-2xl border-4 p-4 text-left transition-all duration-200 sm:gap-4 sm:p-5",
        "hover:-translate-y-1 hover:rotate-[-0.5deg] active:translate-y-0 active:scale-95",
        selected
          ? `${c.bg} border-white text-white shadow-xl scale-[1.02] kid-bounce-in`
          : "bg-white border-slate-100 text-slate-800 hover:border-slate-300 hover:shadow-md"
      )}
      aria-pressed={selected}
    >
      {/* Sparkle burst on select */}
      {selected && burstKey > 0 && (
        <span key={burstKey} className="kid-sparkle-burst">
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * 2 * Math.PI;
            const dx = Math.cos(angle) * 60;
            const dy = Math.sin(angle) * 60;
            return (
              <span
                key={i}
                style={{
                  background: c.spark,
                  ["--dx" as any]: `${dx}px`,
                  ["--dy" as any]: `${dy}px`,
                  animationDelay: `${i * 0.02}s`,
                }}
              />
            );
          })}
        </span>
      )}

      <span
        className={clsx(
          "grid h-10 w-10 flex-none place-items-center rounded-xl text-lg font-black text-white shadow-sm transition-transform sm:h-12 sm:w-12 sm:text-xl",
          selected ? "bg-white/30 text-white scale-110" : c.badge + " group-hover:scale-110 group-hover:rotate-3"
        )}
      >
        {badge}
      </span>
      <span className="flex-1 text-base font-semibold leading-snug sm:text-lg">{text}</span>
      {selected && (
        <span className={`grid h-9 w-9 flex-none place-items-center rounded-full bg-white ${checkColor} shadow kid-star-pop`}>
          {multi ? "✓" : "★"}
        </span>
      )}
    </button>
  );
}
