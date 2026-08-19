"use client";
import type { RendererProps } from "./index";
import { sound } from "@/lib/sounds";
import clsx from "clsx";
import { PassageCard } from "@/components/kids/PassageCard";
import { useUiTheme, useUiTier, useIsMalayTheme } from "@/lib/ui-theme";
import { splitPrompt } from "@/lib/prompt-format";
import { InstructionHint } from "@/components/kids/InstructionHint";
import { QuestionBody } from "@/components/kids/QuestionBody";
import { hasCJK } from "@/lib/cjk";
import Image from "next/image";

const BADGE_COLORS_PLAYFUL = ["bg-pink-500", "bg-sky-500", "bg-yellow-500", "bg-emerald-500"];
const BADGE_COLORS_CALM = ["bg-emerald-500", "bg-teal-500", "bg-lime-500", "bg-green-500"];

type Sub = {
  stem: string;
  options: { key: string; text: string }[];
  icon?: string;   // optional content-relevant emoji (decorative only — never reveals the answer)
  image?: string;  // optional picture prompt (e.g. /questions/chinese-standard-1/q09a-mother.jpg)
  imageAlt?: string;
  highlightText?: string;
};

function HighlightedStem({ text, highlight }: { text: string; highlight?: string }) {
  if (!highlight || !text.includes(highlight)) return <>{text}</>;
  const parts = text.split(highlight);
  return <>{parts.map((part, index) => <span key={index}>{part}{index < parts.length - 1 && <mark className="mandarin-focus-character">{highlight}</mark>}</span>)}</>;
}

export function ReadingRenderer({ prompt, content, value, onChange }: RendererProps) {
  const theme = useUiTheme();
  const tier = useUiTier();
  const calm = theme === "calm";
  const upper = calm && tier === "upper-primary";
  const passage: string = content?.passage ?? "";
  const subs: Sub[] = content?.subs ?? [];
  const isCJK = hasCJK(prompt) || hasCJK(passage) || subs.some((s) => hasCJK(s.stem));
  const malay = useIsMalayTheme();
  const { instruction, body } = (upper || isCJK) ? splitPrompt(prompt) : { instruction: undefined as string | undefined, body: prompt };
  const qLabel = isCJK ? "题" : malay ? "S" : "Q";
  const keys: string[] = value?.keys ?? Array(subs.length).fill("");

  const setKey = (idx: number, key: string) => {
    sound().play("select");
    const next = [...keys];
    next[idx] = key;
    onChange({ keys: next });
  };

  const badgeColors = calm ? BADGE_COLORS_CALM : BADGE_COLORS_PLAYFUL;
  const promptHeader = calm
    ? "flex items-center gap-2 text-base font-black text-emerald-700"
    : "flex items-center gap-2 text-base font-black text-amber-700";
  const qBadge = calm
    ? "mt-0.5 flex-none rounded-lg bg-emerald-500 px-2 py-0.5 text-sm text-white"
    : "mt-0.5 flex-none rounded-lg bg-violet-500 px-2 py-0.5 text-sm text-white";
  const selectedOption = calm
    ? "bg-emerald-100 border-emerald-500 text-emerald-800 kid-bounce-in"
    : "bg-emerald-100 border-emerald-400 text-emerald-800 kid-bounce-in";

  // Two-column reading layout (passage sticky on the left, sub-questions
  // scrolling on the right) is used ONLY for a substantial text/picture
  // passage. It is NOT used when:
  //   • the passage is short (a 词语库 word bank or one-line instruction for a
  //     量词 / 关联词 set) → cramming options into a half-width column looks
  //     squeezed; instead show a slim banner on top + a 2-col grid of subs.
  //   • the passage has a TABLE → a table needs full width to breathe, so the
  //     passage goes full-width on top with the sub-questions below.
  const twoColumn =
    !content?.passageTable &&
    (passage.trim().length > 80 || !!content?.passageImage);

  return (
    <div className={twoColumn ? "grid gap-6 lg:grid-cols-2" : "space-y-4"}>
      {/* Passage / word-bank column */}
      <div className={twoColumn ? "lg:sticky lg:top-28 lg:self-start" : ""}>
        {prompt && (
          (upper || isCJK) ? (
            <div className="mb-3">
              {instruction && <InstructionHint text={instruction} />}
              <QuestionBody text={body} size="medium" />
            </div>
          ) : (
            <p className={`mb-3 ${promptHeader}`}>
              <span className="text-xl" aria-hidden>📖</span> {prompt}
            </p>
          )
        )}
        {passage.trim() && (
          <PassageCard
            text={passage}
            imageUrl={content?.passageImage}
            imageAlt={content?.passageImageAlt}
            table={content?.passageTable}
          />
        )}
      </div>

      {/* Sub-questions — stacked beside a rich passage; a comfortable
          2-column grid when the passage is just a short word-bank/instruction
          (so the cards aren't squeezed into a narrow half-width column). */}
      <div className={twoColumn ? "space-y-5" : "grid gap-4 sm:grid-cols-2 lg:grid-cols-2"}>
        {subs.map((s, i) => (
          <div key={i} className={isCJK ? "mandarin-reading-question" : malay ? "malay-reading-question" : "rounded-2xl border-2 border-slate-100 bg-white p-4 shadow-sm"}>
            <p className="mb-3 flex items-start gap-2 text-base font-bold text-slate-800 sm:text-lg">
              <span className={isCJK ? "mandarin-subquestion-badge" : malay ? "malay-subquestion-badge" : qBadge} aria-hidden>
                {qLabel}{i + 1}
              </span>
              {!s.image && s.icon && (
                <span
                  className="flex-none text-2xl kid-float"
                  aria-hidden
                  style={{ animationDelay: `${i * 0.2}s` }}
                >
                  {s.icon}
                </span>
              )}
              <span className="min-w-0 flex-1 break-words"><HighlightedStem text={s.stem} highlight={s.highlightText} /></span>
            </p>
            {s.image && (
              <div className="mb-3 flex justify-center">
                <Image
                  src={s.image}
                  alt={s.imageAlt ?? s.stem}
                  width={640}
                  height={480}
                  sizes="(max-width: 640px) 92vw, 520px"
                  className="max-h-48 max-w-full w-auto rounded-xl border border-slate-200 bg-white object-contain shadow-sm sm:max-h-56"
                />
              </div>
            )}
            <div className="space-y-2">
              {s.options.map((o, oi) => {
                const sel = keys[i] === o.key;
                return (
                  <button
                    key={o.key}
                    type="button"
                    onClick={() => setKey(i, o.key)}
                    className={isCJK ? clsx("mandarin-reading-option", sel && "is-selected") : malay ? clsx("malay-reading-option", sel && "is-selected") : clsx(
                      "flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left text-sm font-semibold transition-all",
                      sel ? selectedOption : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                    )}
                  >
                    <span className={isCJK ? "mandarin-reading-option-badge" : malay ? "malay-reading-option-badge" : `grid h-8 w-8 flex-none place-items-center rounded-lg text-sm font-black text-white ${badgeColors[oi % 4]}`}>
                      {o.key}
                    </span>
                    <span className="flex-1">{o.text}</span>
                    {sel && <span className="text-lg" aria-hidden>✓</span>}
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
