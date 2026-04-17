"use client";
import type { RendererProps } from "./index";
import { sound } from "@/lib/sounds";
import clsx from "clsx";

export function TrueFalseRenderer({ prompt, value, onChange }: RendererProps) {
  const v = value?.value as boolean | undefined;
  const pick = (val: boolean) => { sound().play("select"); onChange({ value: val }); };
  return (
    <div>
      <p className="mb-8 whitespace-pre-wrap text-2xl font-bold leading-snug text-slate-800 sm:text-3xl">
        {prompt}
      </p>
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => pick(true)}
          className={clsx(
            "rounded-3xl border-4 p-8 text-2xl font-black shadow-lg transition-all",
            v === true
              ? "bg-emerald-400 border-white text-white scale-105 kid-bounce-in"
              : "bg-white border-emerald-200 text-emerald-600 hover:-translate-y-1 hover:shadow-xl"
          )}
        >
          <div className="text-5xl mb-2">👍</div>
          True
        </button>
        <button
          type="button"
          onClick={() => pick(false)}
          className={clsx(
            "rounded-3xl border-4 p-8 text-2xl font-black shadow-lg transition-all",
            v === false
              ? "bg-rose-400 border-white text-white scale-105 kid-bounce-in"
              : "bg-white border-rose-200 text-rose-500 hover:-translate-y-1 hover:shadow-xl"
          )}
        >
          <div className="text-5xl mb-2">👎</div>
          False
        </button>
      </div>
    </div>
  );
}
