"use client";

// Shared kid-friendly option card — big, color-coded, animated.
// Used by SINGLE, MULTI, LISTENING, and sub-questions in READING.

import { sound } from "@/lib/sounds";
import clsx from "clsx";

const COLORS = [
  { bg: "bg-pink-400",   hover: "hover:bg-pink-500",   ring: "ring-pink-300",   badge: "bg-pink-500" },
  { bg: "bg-sky-400",    hover: "hover:bg-sky-500",    ring: "ring-sky-300",    badge: "bg-sky-500" },
  { bg: "bg-yellow-400", hover: "hover:bg-yellow-500", ring: "ring-yellow-300", badge: "bg-yellow-500" },
  { bg: "bg-emerald-400",hover: "hover:bg-emerald-500",ring: "ring-emerald-300",badge: "bg-emerald-500" },
  { bg: "bg-violet-400", hover: "hover:bg-violet-500", ring: "ring-violet-300", badge: "bg-violet-500" },
  { bg: "bg-orange-400", hover: "hover:bg-orange-500", ring: "ring-orange-300", badge: "bg-orange-500" },
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
  badge: string;      // "A", "B", "C"...
  text: string;
  selected: boolean;
  onSelect: () => void;
  multi?: boolean;
}) {
  const c = COLORS[index % COLORS.length];
  return (
    <button
      type="button"
      onClick={() => {
        sound().play("select");
        onSelect();
      }}
      className={clsx(
        "group relative flex w-full items-center gap-3 rounded-2xl border-4 p-4 text-left transition-all sm:gap-4 sm:p-5",
        selected
          ? `${c.bg} border-white text-white shadow-xl scale-[1.02] kid-bounce-in`
          : `bg-white border-slate-100 text-slate-800 hover:border-slate-300 hover:-translate-y-0.5 hover:shadow-md`
      )}
      aria-pressed={selected}
    >
      <span
        className={clsx(
          "grid h-10 w-10 flex-none place-items-center rounded-xl text-lg font-black text-white sm:h-12 sm:w-12 sm:text-xl transition",
          selected ? "bg-white/30 text-white" : c.badge
        )}
      >
        {badge}
      </span>
      <span className="flex-1 text-base font-semibold leading-snug sm:text-lg">{text}</span>
      {selected && (
        <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-white text-emerald-500 shadow">
          {multi ? "✓" : "★"}
        </span>
      )}
    </button>
  );
}
