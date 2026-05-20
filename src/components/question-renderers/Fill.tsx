"use client";
import type { RendererProps } from "./index";
import { sound } from "@/lib/sounds";
import { useUiTheme, useUiTier } from "@/lib/ui-theme";
import { splitPrompt } from "@/lib/prompt-format";
import { InstructionHint } from "@/components/kids/InstructionHint";
import { QuestionBody } from "@/components/kids/QuestionBody";

export function FillRenderer({ prompt, value, onChange }: RendererProps) {
  const theme = useUiTheme();
  const tier = useUiTier();
  const upper = theme === "calm" && tier === "upper-primary";

  if (upper) {
    const { instruction, body } = splitPrompt(prompt);
    // The body contains the description + a "Hint: C _ _ _" line.
    // Split body again on "Hint:" so the hint can render on its own row.
    const hintSplit = body.split(/\n+Hint:\s*/);
    const description = hintSplit[0].trim();
    const hint = hintSplit[1]?.trim();
    return (
      <div>
        {instruction && <InstructionHint text={instruction} />}
        <div className="mb-5">
          <QuestionBody text={description} />
        </div>
        {hint && (
          <div className="mb-5 inline-flex items-baseline gap-3 rounded-xl border border-[#DDEFE4] bg-[#F7FBF8] px-4 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#138a4a]">Hint</span>
            <span className="font-mono text-xl font-semibold tracking-[0.4em] text-[#1F2937]">{hint}</span>
          </div>
        )}
        <input
          type="text"
          autoComplete="off"
          value={value?.text ?? ""}
          onChange={(e) => {
            if ((value?.text ?? "").length === 0 && e.target.value.length > 0) sound().play("click");
            onChange({ text: e.target.value });
          }}
          className="w-full rounded-xl border border-[#DDEFE4] bg-white px-5 py-4 text-lg font-medium text-[#1F2937] outline-none transition focus:border-[#18A65B] focus:ring-4 focus:ring-emerald-100 sm:text-xl"
          placeholder="Type your answer here"
        />
      </div>
    );
  }

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
