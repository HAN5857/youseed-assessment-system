"use client";

// Shared kid-friendly option card — big, color-coded, animated.
// Used by SINGLE, MULTI, LISTENING, and sub-questions in READING.

import { sound } from "@/lib/sounds";
import clsx from "clsx";
import { useState } from "react";

const COLORS = [
  { bg: "bg-pink-400",   hover: "hover:bg-pink-500",   ring: "ring-pink-300",   badge: "bg-pink-500",   spark: "#ec4899" },
  { bg: "bg-sky-400",    hover: "hover:bg-sky-500",    ring: "ring-sky-300",    badge: "bg-sky-500",    spark: "#0ea5e9" },
  { bg: "bg-yellow-400", hover: "hover:bg-yellow-500", ring: "ring-yellow-300", badge: "bg-yellow-500", spark: "#eab308" },
  { bg: "bg-emerald-400",hover: "hover:bg-emerald-500",ring: "ring-emerald-300",badge: "bg-emerald-500",spark: "#10b981" },
  { bg: "bg-violet-400", hover: "hover:bg-violet-500", ring: "ring-violet-300", badge: "bg-violet-500", spark: "#a855f7" },
  { bg: "bg-orange-400", hover: "hover:bg-orange-500", ring: "ring-orange-300", badge: "bg-orange-500", spark: "#f97316" },
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
  const c = COLORS[index % COLORS.length];
  const [burstKey, setBurstKey] = useState(0);

  const handleClick = () => {
    sound().play("select");
    setBurstKey((k) => k + 1);
    onSelect();
  };

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
        <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-white text-emerald-500 shadow kid-star-pop">
          {multi ? "✓" : "★"}
        </span>
      )}
    </button>
  );
}
