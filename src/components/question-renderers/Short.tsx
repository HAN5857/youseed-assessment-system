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

import type { RendererProps } from "./index";
import { useUiTheme, useUiTier } from "@/lib/ui-theme";
import { PassageCard } from "@/components/kids/PassageCard";

export function ShortRenderer({ prompt, content, value, onChange }: RendererProps) {
  const theme = useUiTheme();
  const tier = useUiTier();
  const calm = theme === "calm";
  const upper = calm && tier === "upper-primary";
  const minWords: number = content?.minWords ?? 30;
  const maxWords: number = content?.maxWords ?? 50;
  const template: string | undefined = content?.template;
  const passage: string | undefined = content?.passage;

  const text: string = value?.text ?? "";
  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

  // Word count state: under / on-target / over.
  const state =
    wordCount === 0 ? "empty"
    : wordCount < minWords ? "under"
    : wordCount > maxWords ? "over"
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
            <PassageCard text={passage} />
          </div>
        )}

        <StructuredPrompt prompt={prompt} />

        <div className="mb-2 mt-6 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#6B7280]">
            Target: {minWords}–{maxWords} words
          </span>
          <span className={`rounded-full border px-4 py-1 text-sm font-bold tabular-nums ${counterStyle}`}>
            {wordCount} word{wordCount === 1 ? "" : "s"}
          </span>
        </div>

        {/* Slim live progress bar — fills from 0% (empty) → 100% at minWords,
            then slides into amber zone if you go past maxWords. Reassures
            the student that the counter is actually responding. */}
        <WordProgress wordCount={wordCount} minWords={minWords} maxWords={maxWords} state={state} />

        <textarea
          value={text}
          onChange={(e) => onChange({ text: e.target.value })}
          rows={9}
          className={textareaClass}
          placeholder={template ?? "Write your answer here…"}
          spellCheck
        />

        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[#6B7280]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
          Tip: write in full sentences. Spelling and grammar count.
        </p>
      </div>
    );
  }

  // ── Default (primary calm + playful) ────────────────────────────────────
  return (
    <div>
      {passage && (
        <div className="mb-5">
          <PassageCard text={passage} />
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
          Write about {minWords}–{maxWords} words
        </span>
        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${counterStyle}`}>
          {wordCount} word{wordCount === 1 ? "" : "s"}
        </span>
      </div>

      <textarea
        value={text}
        onChange={(e) => onChange({ text: e.target.value })}
        rows={9}
        className={textareaClass}
        placeholder={template ?? "Write your answer here…"}
        spellCheck
      />

      <p className={calm
        ? "mt-2 text-xs font-medium text-[#6B7280]"
        : "mt-2 text-xs font-medium text-slate-500"
      }>
        Tip: write in full sentences. Spelling and grammar count.
      </p>
    </div>
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
    | { kind: "include"; text: string }
    | { kind: "bullet"; text: string }
    | { kind: "meta"; text: string }
    | { kind: "para"; text: string };

  const blocks: Block[] = [];
  let headlineShown = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    // Skip the "Write about N-M words" line — the counter UI below the
    // textarea already shows this, and rendering it twice made the live
    // counter look like it wasn't updating.
    if (/^Write about\s+[\d\-–]+\s+words\.?$/i.test(line)) continue;
    if (/^Include:?$/i.test(line)) {
      blocks.push({ kind: "include", text: line.replace(/:$/, "") });
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
}: {
  wordCount: number;
  minWords: number;
  maxWords: number;
  state: "empty" | "under" | "ontarget" | "over";
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
        aria-valuemax={maxWords}
        aria-valuenow={wordCount}
        aria-label={`${wordCount} of ${minWords}–${maxWords} words`}
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
