"use client";

// Short-answer / writing renderer.
// Used by Year 4-6 Q25 (30-50 word email writing prompt).
// content options:
//   minWords  — soft minimum (default 30)
//   maxWords  — soft maximum (default 50)
//   template  — optional placeholder shown above the textarea (e.g. email skeleton)
//   passage   — optional context displayed in a calm passage card
// Theme-aware via useUiTheme. Functionality untouched — value is stored as
// { text: string } so the existing autosave + submit pipeline picks it up.

import { useEffect, useRef } from "react";
import type { RendererProps } from "./index";
import { useUiTheme, useUiTier } from "@/lib/ui-theme";
import { PassageCard } from "@/components/kids/PassageCard";
import { hasCJK, countWordsSmart } from "@/lib/cjk";
import Image from "next/image";

// Reserve only as much writing space as the answer actually needs, so a
// single-sentence 造句 doesn't present an essay-sized empty box — which can
// psychologically signal "I must write a whole essay". The box then
// auto-grows as the student types (see AutoGrowTextarea).
//
// Sizing is driven by the SHAPE of the task, not maxWords — many 造句
// questions use `countOnly` with maxWords:1000 (no cap), so maxWords is a
// poor signal. Count-only / sentence tasks start at ~2 lines; targeted
// essays (minWords ≥ ~20) start a little taller. Everything auto-grows.
function writingBoxHeights(minWords: number, countOnly: boolean, cjk: boolean): { min: number; max: number } {
  const perLine = cjk ? 20 : 12;      // approx 字 / words that fit on one line
  const lineHeight = cjk ? 40 : 32;   // px per line (matches the CSS line-height)
  const lines = countOnly
    ? 2
    : Math.min(6, Math.max(2, Math.ceil((minWords || 0) / perLine) + 1));
  return { min: lines * lineHeight + 28, max: 480 };
}

export function ShortRenderer({ prompt, content, value, onChange }: RendererProps) {
  const theme = useUiTheme();
  const tier = useUiTier();
  const calm = theme === "calm";
  const upper = calm && tier === "upper-primary";
  const minWords: number = content?.minWords ?? 30;
  const maxWords: number = content?.maxWords ?? 50;
  const countOnly = content?.countOnly === true;
  const minimumOnly = content?.minimumOnly === true;
  const template: string | undefined = content?.template;
  const passage: string | undefined = content?.passage;
  const passageImage: string | undefined = content?.passageImage;
  const passageImageAlt: string | undefined = content?.passageImageAlt;
  const writingChoices: Array<{ key: string; title: string; description?: string; icon?: string; genre?: string }> = content?.writingChoices ?? [];

  const text: string = value?.text ?? "";
  const isCJK = hasCJK(text) || hasCJK(prompt || "");
  const wordCount = countWordsSmart(text);
  const charCount = text.length;
  // Sentence-vs-essay sizing for the writing box (see writingBoxHeights).
  const box = writingBoxHeights(minWords, countOnly, isCJK);
  const unitLabel = (n: number) => isCJK ? `${n} 字` : `${n} word${n === 1 ? "" : "s"}`;

  // Word count state: under / on-target / over.
  const state =
    wordCount === 0 ? "empty"
    : countOnly ? "ontarget"
    : wordCount < minWords ? "under"
    : !minimumOnly && wordCount > maxWords ? "over"
    : "ontarget";

  const counterStyle = calm
    ? {
        empty:    "border-[#DDEFE4] bg-white text-[#6B7280]",
        under:    "border-amber-200 bg-amber-50 text-amber-800",
        ontarget: "border-emerald-300 bg-emerald-50 text-emerald-800",
        over:     "border-amber-300 bg-amber-50 text-amber-800",
      }[state]
    : {
        empty:    "border-slate-200 bg-white text-slate-500",
        under:    "border-amber-200 bg-amber-50 text-amber-800",
        ontarget: "border-emerald-300 bg-emerald-50 text-emerald-800",
        over:     "border-amber-300 bg-amber-50 text-amber-800",
      }[state];

  const textareaClass = calm
    ? "w-full rounded-2xl border-2 border-[#DDEFE4] bg-white px-5 py-4 text-base font-medium leading-relaxed text-slate-800 outline-none transition focus:border-[#18A65B] focus:ring-4 focus:ring-emerald-100 sm:text-[17px]"
    : "w-full rounded-2xl border-4 border-violet-200 bg-white px-5 py-4 text-base font-medium leading-relaxed text-slate-800 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100 sm:text-[17px]";

  if (isCJK) {
    const imageUrl: string | undefined = content?.imageUrl;
    const progressLabel = wordCount === 0
      ? "等待起笔"
      : countOnly
        ? "字数已记录"
        : wordCount < minWords
          ? "灵感正在成形"
          : minimumOnly || wordCount <= maxWords
            ? "表达完整"
            : "可以稍微精简";
    return (
      <div className="mandarin-writing-studio">
        {passage && (
          <div className="mb-5">
            <PassageCard text={passage} imageUrl={passageImage} imageAlt={passageImageAlt} table={content?.passageTable} />
          </div>
        )}
        {imageUrl && (
          <figure className="mandarin-writing-image">
            <Image src={imageUrl} alt="写作题的观察图片" width={900} height={600} sizes="(max-width: 640px) 100vw, 620px" />
            <figcaption>先观察细节，再把看见的变成句子。</figcaption>
          </figure>
        )}

        <StructuredPrompt prompt={prompt} />

        {writingChoices.length > 0 && (
          <MandarinWritingChoices
            choices={writingChoices}
            selectedKey={value?.selectedTopic}
            onSelect={(selectedTopic) => onChange({ ...(value ?? {}), selectedTopic })}
          />
        )}

        <div className="mandarin-writing-toolbar">
          <div><span>写作足迹</span><strong>{progressLabel}</strong></div>
          <div className={`mandarin-character-count state-${state}`} aria-live="polite">
            <b>{wordCount}</b><span>字</span>
            <small>{countOnly ? "实时字数" : minimumOnly ? `至少 ${minWords} 字` : `目标 ${minWords}–${maxWords} 字`}</small>
          </div>
        </div>

        {!countOnly && <WordProgress wordCount={wordCount} minWords={minWords} maxWords={maxWords} state={state} cjk minimumOnly={minimumOnly} />}

        {template && <div className="mandarin-writing-starter"><span>起笔小帮手</span><p>{template}</p></div>}
        <AutoGrowTextarea
          value={text}
          onChange={(v) => onChange({ ...(value ?? {}), text: v })}
          className="mandarin-writing-textarea"
          placeholder="把你的观察和想法写在这里…"
          minHeight={box.min}
          maxHeight={box.max}
        />
        <div className="mandarin-writing-tips">
          <span>一</span><p>先写完整的一句，再补上人物、地点、动作或原因。</p>
          <span>二</span><p>每一个汉字都会即时计数，标点不算在字数里。</p>
        </div>
      </div>
    );
  }

  // ── Upper-primary: structured writing card ──────────────────────────────
  if (upper) {
    return (
      <div className="relative">
        {/* Decorative writing illustration (envelope + pencil), top-right, gentle float */}
        <div className="pointer-events-none absolute right-1 top-1 select-none kid-float" aria-hidden>
          <WritingDecor />
        </div>

        {passage && (
          <div className="mb-5">
            <PassageCard text={passage} imageUrl={passageImage} imageAlt={passageImageAlt} table={content?.passageTable} />
          </div>
        )}

        <StructuredPrompt prompt={prompt} />

        <div className="mb-2 mt-6 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#6B7280]">
            {isCJK ? `目标：${minWords}–${maxWords} 字` : `Target: ${minWords}–${maxWords} words`}
          </span>
          {/* Pair of live counters: words (primary, colour-coded against the target)
              + characters (secondary, always neutral). The char chip updates on every
              keystroke even mid-word, so students can immediately see the system is
              receiving their input — fixes the "looks frozen at 1 word" perception. */}
          <div className="flex items-center gap-2" aria-live="polite">
            <span className={`rounded-full border px-4 py-1 text-sm font-bold tabular-nums ${counterStyle}`}>
              {unitLabel(wordCount)}
            </span>
            {!isCJK && (
              <span className="rounded-full border border-[#DDEFE4] bg-white px-3 py-1 text-[11px] font-semibold tabular-nums text-[#6B7280]">
                {charCount} char{charCount === 1 ? "" : "s"}
              </span>
            )}
          </div>
        </div>

        {/* Slim live progress bar — fills from 0% (empty) → 100% at minWords,
            then slides into amber zone if you go past maxWords. Reassures
            the student that the counter is actually responding. */}
        <WordProgress wordCount={wordCount} minWords={minWords} maxWords={maxWords} state={state} />

        <AutoGrowTextarea
          value={text}
          onChange={(v) => onChange({ ...(value ?? {}), text: v })}
          className={textareaClass}
          placeholder={template ?? "Write your answer here…"}
          minHeight={box.min}
          maxHeight={box.max}
        />

        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs font-medium text-[#6B7280]">
          <p className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
            {isCJK ? "小贴士：写完整的句子，用词准确、语法正确。" : "Tip: write in full sentences. Spelling and grammar count."}
          </p>
          <p className="text-[11px] italic text-[#9CA3AF]">
            {isCJK ? "系统按字数计算 —— 每一个汉字算一字。" : "Words are counted by spaces — separate each word with a space."}
          </p>
        </div>
      </div>
    );
  }

  // ── Default (primary calm + playful) ────────────────────────────────────
  return (
    <div>
      {passage && (
        <div className="mb-5">
          <PassageCard text={passage} imageUrl={passageImage} imageAlt={passageImageAlt} table={content?.passageTable} />
        </div>
      )}

      <p className="mb-4 whitespace-pre-wrap text-xl font-bold leading-snug text-slate-800 sm:text-2xl">
        {prompt}
      </p>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className={calm
          ? "text-xs font-semibold uppercase tracking-wider text-[#6B7280]"
          : "text-xs font-semibold uppercase tracking-wider text-slate-500"
        }>
          {isCJK ? `写 ${minWords}–${maxWords} 字` : `Write about ${minWords}–${maxWords} words`}
        </span>
        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${counterStyle}`} aria-live="polite">
          {unitLabel(wordCount)}
        </span>
      </div>

      <AutoGrowTextarea
        value={text}
        onChange={(v) => onChange({ ...(value ?? {}), text: v })}
        className={textareaClass}
        placeholder={template ?? (isCJK ? "在这里写你的答案…" : "Write your answer here…")}
        minHeight={box.min}
        maxHeight={box.max}
      />

      <p className={calm
        ? "mt-2 text-xs font-medium text-[#6B7280]"
        : "mt-2 text-xs font-medium text-slate-500"
      }>
        {isCJK ? "小贴士：写完整的句子，用词准确、语法正确。" : "Tip: write in full sentences. Spelling and grammar count."}
      </p>
    </div>
  );
}

// ─── Auto-growing writing box ─────────────────────────────────────────────
// Starts at `minHeight` (sized to the target answer length by
// writingBoxHeights) so a one-sentence 造句 shows a sentence-sized box, not
// an essay-sized one. Grows to fit the student's text up to `maxHeight`,
// then scrolls. The inline min-height also overrides the CSS 230px default
// on `.mandarin-writing-textarea`.
function AutoGrowTextarea({
  value, onChange, className, placeholder, minHeight, maxHeight,
}: {
  value: string;
  onChange: (v: string) => void;
  className: string;
  placeholder?: string;
  minHeight: number;
  maxHeight: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(maxHeight, Math.max(minHeight, el.scrollHeight))}px`;
  }, [value, minHeight, maxHeight]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      placeholder={placeholder}
      spellCheck
      style={{ minHeight, maxHeight, overflowY: "auto" }}
    />
  );
}

function MandarinWritingChoices({
  choices,
  selectedKey,
  onSelect,
}: {
  choices: Array<{ key: string; title: string; description?: string; icon?: string; genre?: string }>;
  selectedKey?: string;
  onSelect: (key: string) => void;
}) {
  return (
    <fieldset className="mandarin-writing-choices">
      <legend>
        <span>先选择你的创作方向</span>
        <small>Choose one writing topic</small>
      </legend>
      <div className="mandarin-writing-choice-grid">
        {choices.map((choice, index) => {
          const selected = selectedKey === choice.key;
          return (
            <button
              key={choice.key}
              type="button"
              className={selected ? "is-selected" : ""}
              aria-pressed={selected}
              onClick={() => onSelect(choice.key)}
            >
              <span className="mandarin-writing-choice-number" aria-hidden>
                {choice.icon ?? ["一", "二", "三"][index] ?? "文"}
              </span>
              <span className="mandarin-writing-choice-copy">
                {choice.genre && <em>{choice.genre}</em>}
                <strong>{choice.title}</strong>
                {choice.description && <small>{choice.description}</small>}
              </span>
              <span className="mandarin-writing-choice-check" aria-hidden>{selected ? "✓" : ""}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

// ─── Structured writing prompt ────────────────────────────────────────────
// Parses lines in the Q25 prompt and renders:
//   • headline (first non-empty line) — big, dominant
//   • "Include:" — small green label
//   • "• xxx" bullets — green bullet chips
//   • "Write about N–M words" — small uppercase meta
function StructuredPrompt({ prompt }: { prompt: string }) {
  const lines = prompt.split("\n").map((l) => l.replace(/\s+$/u, ""));
  type Block =
    | { kind: "headline"; text: string }
    | { kind: "focus"; text: string }
    | { kind: "include"; text: string }
    | { kind: "bullet"; text: string }
    | { kind: "meta"; text: string }
    | { kind: "para"; text: string };

  const blocks: Block[] = [];
  let headlineShown = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    // Skip lines that duplicate what the live counter chip already shows.
    // Match both English ("Write about 30-50 words") and Chinese variants
    // (写 30–50 字 / 目标 30–50 字 / 4–30 字). Rendering it twice made the
    // counter look like it wasn't updating.
    if (/^Write about\s+[\d\-–]+\s+words\.?$/i.test(line)) continue;
    if (/^(?:写|目标[:：]?\s*|请写)?\s*[\d]+\s*[-–]\s*[\d]+\s*字\.?$/.test(line)) continue;
    if (/^Include:?$/i.test(line)) {
      blocks.push({ kind: "include", text: line.replace(/:$/, "") });
      continue;
    }
    if (/^(?:重点字|关键词|题目)[:：]/.test(line)) {
      blocks.push({ kind: "focus", text: line });
      continue;
    }
    const bullet = line.match(/^[•\-\*]\s+(.+)$/);
    if (bullet) {
      blocks.push({ kind: "bullet", text: bullet[1] });
      continue;
    }
    if (!headlineShown) {
      blocks.push({ kind: "headline", text: line });
      headlineShown = true;
      continue;
    }
    blocks.push({ kind: "para", text: line });
  }

  // Group consecutive bullets together so we can render them as a list.
  const grouped: Array<Block | { kind: "bullets"; items: string[] }> = [];
  let buf: string[] = [];
  for (const b of blocks) {
    if (b.kind === "bullet") {
      buf.push(b.text);
    } else {
      if (buf.length) {
        grouped.push({ kind: "bullets", items: buf });
        buf = [];
      }
      grouped.push(b);
    }
  }
  if (buf.length) grouped.push({ kind: "bullets", items: buf });

  return (
    <div className="space-y-3">
      {grouped.map((b, i) => {
        if (b.kind === "headline") {
          return (
            <h2 key={i} className="whitespace-pre-wrap text-[22px] font-semibold leading-snug text-[#1F2937] sm:text-[26px]">
              {b.text}
            </h2>
          );
        }
        if (b.kind === "include") {
          return (
            <p key={i} className="text-xs font-semibold uppercase tracking-[0.12em] text-[#138a4a] sm:text-[13px]">
              {b.text}
            </p>
          );
        }
        if (b.kind === "focus") {
          return <p key={i} className="mandarin-writing-focus-line">{b.text}</p>;
        }
        if (b.kind === "bullets") {
          return (
            <ul key={i} className="space-y-1.5">
              {b.items.map((it, j) => (
                <li
                  key={j}
                  className="flex items-start gap-3 rounded-lg border border-[#DDEFE4] bg-[#F7FBF8] px-4 py-2 text-[15px] font-medium text-[#1F2937] sm:text-base"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#18A65B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mt-1 flex-none" aria-hidden>
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span className="flex-1">{it}</span>
                </li>
              ))}
            </ul>
          );
        }
        if (b.kind === "meta") {
          return (
            <p key={i} className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
              {b.text}
            </p>
          );
        }
        return (
          <p key={i} className="text-base font-medium text-[#1F2937]">
            {b.text}
          </p>
        );
      })}
    </div>
  );
}

// ─── Word-count progress bar ──────────────────────────────────────────────
// Visualises wordCount against the [minWords, maxWords] target.
//   0 → minWords     fills 0%–100% in green
//   > maxWords       overflows in amber (still 100% width)
function WordProgress({
  wordCount,
  minWords,
  maxWords,
  state,
  cjk = false,
  minimumOnly = false,
}: {
  wordCount: number;
  minWords: number;
  maxWords: number;
  state: "empty" | "under" | "ontarget" | "over";
  cjk?: boolean;
  minimumOnly?: boolean;
}) {
  // Cap visual fill at 100%; once you hit minWords the bar is full.
  const pct = Math.min(100, (wordCount / minWords) * 100);
  const fillColor =
    state === "empty" ? "bg-[#DDEFE4]"
    : state === "under" ? "bg-amber-400"
    : state === "over" ? "bg-amber-500"
    : "bg-[#18A65B]";

  return (
    <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-[#F1F5F4]">
      <div
        className={`h-1.5 rounded-full transition-all duration-200 ${fillColor}`}
        style={{ width: `${pct}%` }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={minimumOnly ? minWords : maxWords}
        aria-valuenow={wordCount}
        aria-label={cjk
          ? minimumOnly ? `已写 ${wordCount} 字，至少 ${minWords} 字` : `已写 ${wordCount} 字，目标 ${minWords} 至 ${maxWords} 字`
          : minimumOnly ? `${wordCount} words, at least ${minWords}` : `${wordCount} of ${minWords}–${maxWords} words`}
      />
    </div>
  );
}

// ─── Writing decoration ───────────────────────────────────────────────────
// Pencil + envelope SVG group used as a subtle floating illustration on Q25.
function WritingDecor() {
  return (
    <div className="relative flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24">
      <span className="absolute inset-0 rounded-full bg-[#EAF8F0] opacity-80" />
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="relative" aria-hidden>
        {/* Envelope body */}
        <rect x="6" y="14" width="30" height="22" rx="3" fill="white" stroke="#18A65B" strokeWidth="2" />
        {/* Envelope flap */}
        <path d="M6 16 L21 27 L36 16" stroke="#18A65B" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* Pencil */}
        <g transform="rotate(35 32 22)">
          <rect x="29" y="6" width="6" height="22" rx="1.5" fill="#18A65B" />
          <rect x="29" y="6" width="6" height="3" fill="#138a4a" />
          <path d="M29 28 L32 33 L35 28 Z" fill="#fbbf24" />
          <path d="M30.5 28 L32 30.5 L33.5 28 Z" fill="#1F2937" />
        </g>
      </svg>
    </div>
  );
}
