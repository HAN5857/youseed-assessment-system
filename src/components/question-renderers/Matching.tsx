"use client";
import type { RendererProps } from "./index";
import { sound } from "@/lib/sounds";

// Per-row colour rotation (visual variety, doesn't hint at answer).
const COLOURS = [
  "bg-pink-100 border-pink-300",
  "bg-sky-100 border-sky-300",
  "bg-yellow-100 border-yellow-300",
  "bg-emerald-100 border-emerald-300",
  "bg-violet-100 border-violet-300",
  "bg-orange-100 border-orange-300",
];

type LeftItem = string | { text: string; icon?: string };

export function MatchingRenderer({ prompt, content, value, onChange }: RendererProps) {
  const rawLeft: LeftItem[] = content?.left ?? [];
  const right: string[] = content?.right ?? [];
  const pairs: Record<string, number> = value?.pairs ?? {};

  const setPair = (leftIdx: number, rightIdx: number) => {
    sound().play("select");
    const next = { ...pairs, [leftIdx]: rightIdx };
    onChange({ pairs: next });
  };

  return (
    <div>
      <p className="mb-6 whitespace-pre-wrap text-2xl font-bold leading-snug text-slate-800 sm:text-3xl">
        {prompt}
      </p>
      <div className="space-y-3">
        {rawLeft.map((raw, i) => {
          const item = typeof raw === "string" ? { text: raw, icon: undefined } : raw;
          const hasIcon = !!item.icon;
          return (
            <div
              key={i}
              className={`flex flex-wrap items-center gap-3 rounded-2xl border-4 p-4 ${COLOURS[i % COLOURS.length]}`}
            >
              {/* Always show row number — anchors visual identity */}
              <span
                className="grid h-9 w-9 flex-none place-items-center rounded-full bg-white text-sm font-black text-slate-700 shadow-sm"
                aria-hidden
              >
                {i + 1}
              </span>

              {/* Content-relevant icon if provided (decoration only, never reveals the answer) */}
              {hasIcon && (
                <span
                  className="flex-none text-3xl kid-float"
                  aria-hidden
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  {item.icon}
                </span>
              )}

              {/* Sentence — flex-1 + min-w-0 so it never gets clipped */}
              <span className="min-w-0 flex-1 break-words text-base font-bold text-slate-800 sm:text-lg">
                {item.text}
              </span>

              {/* Arrow only on wider rows */}
              <span className="hidden text-2xl text-slate-400 sm:inline" aria-hidden>→</span>

              {/* Selector — full width on small screens, fixed-ish on larger */}
              <select
                value={pairs[i] ?? ""}
                onChange={(e) => setPair(i, Number(e.target.value))}
                className="w-full min-w-40 flex-none rounded-xl border-4 border-white bg-white px-4 py-3 text-base font-bold text-slate-700 shadow-sm outline-none focus:border-indigo-400 sm:w-auto sm:flex-1"
              >
                <option value="">— choose —</option>
                {right.map((r, ri) => (
                  <option key={ri} value={ri}>{r}</option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
