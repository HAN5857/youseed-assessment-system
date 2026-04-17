"use client";
import type { RendererProps } from "./index";
import { sound } from "@/lib/sounds";

export function FillRenderer({ prompt, value, onChange }: RendererProps) {
  return (
    <div>
      <p className="mb-6 whitespace-pre-wrap text-2xl font-bold leading-snug text-slate-800 sm:text-3xl">
        {prompt}
      </p>
      <div className="relative">
        <input
          type="text"
          autoComplete="off"
          value={value?.text ?? ""}
          onChange={(e) => {
            if ((value?.text ?? "").length === 0 && e.target.value.length > 0) sound().play("click");
            onChange({ text: e.target.value });
          }}
          className="w-full rounded-2xl border-4 border-yellow-300 bg-yellow-50 px-5 py-5 text-2xl font-bold text-slate-800 outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-200 shadow-inner"
          placeholder="✏️ Type your answer here…"
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-2xl kid-sparkle">✨</span>
      </div>
    </div>
  );
}
