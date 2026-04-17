"use client";
import type { RendererProps } from "./index";
import { sound } from "@/lib/sounds";
import clsx from "clsx";

const BADGE_COLORS = ["bg-pink-500","bg-sky-500","bg-yellow-500","bg-emerald-500"];

export function ReadingRenderer({ prompt, content, value, onChange }: RendererProps) {
  const passage: string = content?.passage ?? "";
  const subs: { stem: string; options: { key: string; text: string }[] }[] = content?.subs ?? [];
  const keys: string[] = value?.keys ?? Array(subs.length).fill("");

  const setKey = (idx: number, key: string) => {
    sound().play("select");
    const next = [...keys];
    next[idx] = key;
    onChange({ keys: next });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        {prompt && <p className="mb-3 text-lg font-bold text-violet-600">📖 {prompt}</p>}
        <div className="rounded-3xl border-4 border-amber-200 bg-amber-50 p-5 text-base font-semibold leading-relaxed text-slate-800 sm:text-lg sm:leading-loose whitespace-pre-wrap">
          {passage}
        </div>
      </div>
      <div className="space-y-5">
        {subs.map((s, i) => (
          <div key={i} className="rounded-2xl border-2 border-slate-100 bg-white p-4 shadow-sm">
            <p className="mb-3 text-base font-bold text-slate-800 sm:text-lg">
              <span className="mr-2 rounded-lg bg-violet-500 px-2 py-0.5 text-sm text-white">Q{i + 1}</span>
              {s.stem}
            </p>
            <div className="space-y-2">
              {s.options.map((o, oi) => {
                const sel = keys[i] === o.key;
                return (
                  <button
                    key={o.key}
                    type="button"
                    onClick={() => setKey(i, o.key)}
                    className={clsx(
                      "flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left text-sm font-semibold transition-all",
                      sel
                        ? "bg-emerald-100 border-emerald-400 text-emerald-800 kid-bounce-in"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                    )}
                  >
                    <span className={`grid h-8 w-8 flex-none place-items-center rounded-lg text-sm font-black text-white ${BADGE_COLORS[oi % 4]}`}>
                      {o.key}
                    </span>
                    <span className="flex-1">{o.text}</span>
                    {sel && <span className="text-lg">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
