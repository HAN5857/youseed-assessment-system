"use client";
import type { RendererProps } from "./index";
import { sound } from "@/lib/sounds";

const EMOJIS = ["🐶", "🐱", "🐻", "🐼", "🦁", "🐵", "🦊", "🐰"];
const COLOURS = [
  "bg-pink-100 border-pink-300",
  "bg-sky-100 border-sky-300",
  "bg-yellow-100 border-yellow-300",
  "bg-emerald-100 border-emerald-300",
  "bg-violet-100 border-violet-300",
  "bg-orange-100 border-orange-300",
];

export function MatchingRenderer({ prompt, content, value, onChange }: RendererProps) {
  const left: string[] = content?.left ?? [];
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
        {left.map((item, i) => (
          <div key={i} className={`flex flex-wrap items-center gap-3 rounded-2xl border-4 p-4 ${COLOURS[i % COLOURS.length]}`}>
            <span className="text-3xl">{EMOJIS[i % EMOJIS.length]}</span>
            <span className="text-lg font-bold text-slate-800">{item}</span>
            <span className="text-2xl text-slate-400">→</span>
            <select
              value={pairs[i] ?? ""}
              onChange={(e) => setPair(i, Number(e.target.value))}
              className="flex-1 min-w-40 rounded-xl border-4 border-white bg-white px-4 py-3 text-base font-bold text-slate-700 outline-none focus:border-indigo-400 shadow-sm"
            >
              <option value="">— choose —</option>
              {right.map((r, ri) => (
                <option key={ri} value={ri}>{r}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
