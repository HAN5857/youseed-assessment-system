"use client";
import type { RendererProps } from "./index";
import { useMemo } from "react";

export function ClozeRenderer({ prompt, content, value, onChange }: RendererProps) {
  const passage: string = content?.passage ?? "";
  const blankCount: number = content?.blanks ?? (passage.match(/___/g)?.length ?? 1);

  const blanks: string[] = useMemo(
    () => value?.blanks ?? Array(blankCount).fill(""),
    [value?.blanks, blankCount]
  );

  const update = (idx: number, text: string) => {
    const next = [...blanks];
    next[idx] = text;
    onChange({ blanks: next });
  };

  const parts = passage.split("___");

  return (
    <div>
      {prompt && <p className="mb-4 text-lg font-bold text-violet-600">📖 {prompt}</p>}
      <div className="rounded-3xl border-4 border-sky-200 bg-sky-50 p-6 text-xl font-semibold leading-relaxed text-slate-800 sm:text-2xl sm:leading-loose">
        {parts.map((part, i) => (
          <span key={i}>
            <span className="whitespace-pre-wrap">{part}</span>
            {i < parts.length - 1 && (
              <input
                type="text"
                value={blanks[i] ?? ""}
                onChange={(e) => update(i, e.target.value)}
                className="mx-1 inline-block w-32 rounded-xl border-b-4 border-pink-400 bg-white px-3 py-1.5 text-center text-xl font-bold text-pink-600 outline-none focus:border-pink-600 focus:ring-2 focus:ring-pink-200 shadow-sm"
                placeholder={`#${i + 1}`}
              />
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
