"use client";
import type { RendererProps } from "./index";
import { sound } from "@/lib/sounds";
import { MatchingDndRenderer } from "./MatchingDnd";
import { useUiTheme, useUiTier } from "@/lib/ui-theme";
import { InstructionHint } from "@/components/kids/InstructionHint";
import { QuestionBody } from "@/components/kids/QuestionBody";
import { splitPrompt } from "@/lib/prompt-format";

const COLOURS_PLAYFUL = [
  "bg-pink-100 border-pink-300",
  "bg-sky-100 border-sky-300",
  "bg-yellow-100 border-yellow-300",
  "bg-emerald-100 border-emerald-300",
  "bg-violet-100 border-violet-300",
  "bg-orange-100 border-orange-300",
];

const COLOURS_CALM = [
  "bg-emerald-100 border-emerald-300",
  "bg-teal-100 border-teal-300",
  "bg-lime-100 border-lime-300",
  "bg-green-100 border-green-300",
  "bg-emerald-50 border-emerald-200",
  "bg-teal-50 border-teal-200",
];

type LeftItem = string | { text: string; icon?: string };

/**
 * Dispatcher: opt-in to drag-drop via content.dragDrop = true.
 * Otherwise falls back to the legacy dropdown UI (zero behaviour change).
 */
export function MatchingRenderer(props: RendererProps) {
  if (props.content?.dragDrop === true) {
    return <MatchingDndRenderer {...props} />;
  }
  return <MatchingLegacyRenderer {...props} />;
}

function MatchingLegacyRenderer({ prompt, content, value, onChange }: RendererProps) {
  const theme = useUiTheme();
  const tier = useUiTier();
  const upper = theme === "calm" && tier === "upper-primary";

  const rawLeft: LeftItem[] = content?.left ?? [];
  const right: string[] = content?.right ?? [];
  const pairs: Record<string, number> = value?.pairs ?? {};

  const setPair = (leftIdx: number, rightIdx: number) => {
    sound().play("select");
    const next = { ...pairs, [leftIdx]: rightIdx };
    onChange({ pairs: next });
  };

  // ── Upper-primary: academic letter-picker layout ────────────────────────
  // Shows the meanings as an A/B/C key at the top, then each word row with
  // letter buttons on the right. Matches the DOCX printed-test format more
  // closely than the legacy dropdown UI.
  if (upper) {
    const { instruction, body } = splitPrompt(prompt);
    const LETTERS = ["A", "B", "C", "D", "E", "F"];
    return (
      <div>
        {instruction && <InstructionHint text={instruction} />}
        <QuestionBody text={body} />

        {/* Meanings key (right-hand options) */}
        <div className="mb-5 mt-5 rounded-xl border border-[#DDEFE4] bg-[#F7FBF8] p-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#138a4a]">
            Meanings
          </p>
          <ul className="space-y-2">
            {right.map((r, i) => (
              <li key={i} className="flex items-start gap-3 text-[15px] leading-snug text-[#1F2937] sm:text-base">
                <span className="grid h-7 w-7 flex-none place-items-center rounded-md bg-white text-sm font-bold text-[#138a4a] ring-1 ring-[#DDEFE4]">
                  {LETTERS[i]}
                </span>
                <span className="flex-1">{r}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Words to match */}
        <div className="space-y-3">
          {rawLeft.map((raw, i) => {
            const item = typeof raw === "string" ? { text: raw, icon: undefined } : raw;
            const selectedIdx = pairs[i];
            return (
              <div
                key={i}
                className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 transition sm:p-4 ${
                  selectedIdx != null
                    ? "border-[#18A65B] bg-[#F7FBF8]"
                    : "border-[#DDEFE4] bg-white"
                }`}
              >
                <span className="grid h-9 w-9 flex-none place-items-center rounded-lg bg-[#EAF8F0] text-sm font-bold text-[#138a4a]" aria-hidden>
                  {i + 1}
                </span>
                {item.icon && (
                  <span className="flex-none text-2xl select-none" aria-hidden>
                    {item.icon}
                  </span>
                )}
                <span className="min-w-0 flex-1 break-words text-[17px] font-semibold text-[#1F2937] sm:text-[19px]">
                  {item.text}
                </span>
                <div className="flex gap-2" role="group" aria-label={`Pick the meaning for ${item.text}`}>
                  {right.map((_, ri) => {
                    const isSelected = selectedIdx === ri;
                    return (
                      <button
                        key={ri}
                        type="button"
                        onClick={() => setPair(i, ri)}
                        aria-pressed={isSelected}
                        aria-label={`Match ${item.text} to meaning ${LETTERS[ri]}`}
                        className={
                          isSelected
                            ? "h-10 w-10 rounded-lg bg-[#18A65B] text-base font-bold text-white shadow-md ring-2 ring-[#18A65B]/30 transition active:translate-y-px"
                            : "h-10 w-10 rounded-lg border border-[#DDEFE4] bg-white text-base font-semibold text-[#138a4a] transition hover:-translate-y-0.5 hover:border-[#18A65B] hover:bg-[#F7FBF8]"
                        }
                      >
                        {LETTERS[ri]}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Default (primary calm + playful): unchanged dropdown layout ─────────
  const colours = theme === "calm" ? COLOURS_CALM : COLOURS_PLAYFUL;
  const focusBorder = theme === "calm" ? "focus:border-emerald-400" : "focus:border-indigo-400";

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
              className={`flex flex-wrap items-center gap-3 rounded-2xl border-4 p-4 ${colours[i % colours.length]}`}
            >
              <span
                className="grid h-9 w-9 flex-none place-items-center rounded-full bg-white text-sm font-black text-slate-700 shadow-sm"
                aria-hidden
              >
                {i + 1}
              </span>
              {hasIcon && (
                <span
                  className="flex-none text-3xl kid-float"
                  aria-hidden
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  {item.icon}
                </span>
              )}
              <span className="min-w-0 flex-1 break-words text-base font-bold text-slate-800 sm:text-lg">
                {item.text}
              </span>
              <span className="hidden text-2xl text-slate-400 sm:inline" aria-hidden>→</span>
              <select
                value={pairs[i] ?? ""}
                onChange={(e) => setPair(i, Number(e.target.value))}
                className={`w-full min-w-40 flex-none rounded-xl border-4 border-white bg-white px-4 py-3 text-base font-bold text-slate-700 shadow-sm outline-none ${focusBorder} sm:w-auto sm:flex-1`}
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
