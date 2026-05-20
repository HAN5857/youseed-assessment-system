"use client";

// Reusable passage card for reading passages — theme + tier aware.
//   playful (default):       warm amber/yellow notebook with rose margin + pink bookmark.
//   calm + primary:          same notebook look, retinted green (S1-S3).
//   calm + upper-primary:    cleaner "academic paper" card — no spiral binding,
//                            no doodle, no bookmark, ruled lines kept subtle so
//                            older students can focus on text. (S4-S6)

import { useUiTheme, useUiTier } from "@/lib/ui-theme";

export function PassageCard({
  text,
  hint = "📚 Take your time — read it twice!",
}: {
  text: string;
  hint?: string;
}) {
  const theme = useUiTheme();
  const tier = useUiTier();

  if (theme === "calm" && tier === "upper-primary") {
    return (
      <div className="relative">
        <div className="relative overflow-hidden rounded-xl border border-[#DDEFE4] bg-white p-6 shadow-[0_2px_8px_rgba(15,23,42,0.04)] sm:p-7">
          {/* Slim left accent — green wash, no spiral binding */}
          <div className="pointer-events-none absolute bottom-0 left-0 top-0 w-1 bg-[#18A65B]" aria-hidden />
          <SmartPassage text={text} />
        </div>
        {hint && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#DDEFE4] bg-[#F7FBF8] px-3 py-1 text-xs font-medium text-[#138a4a]">
            Read carefully — you can scroll back to the passage at any time.
          </div>
        )}
      </div>
    );
  }

  if (theme === "calm") {
    return (
      <div className="relative">
        <div
          className="relative overflow-hidden rounded-3xl border-4 border-emerald-200 bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 py-6 pl-12 pr-5 shadow-[0_10px_25px_rgba(16,185,129,0.15)] sm:py-7 sm:pl-14 sm:pr-7"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent 0, transparent 33px, rgba(16, 185, 129, 0.22) 33px, rgba(16, 185, 129, 0.22) 34px)",
            backgroundAttachment: "local",
          }}
        >
          {/* Left margin line */}
          <div
            className="pointer-events-none absolute bottom-0 top-0 w-[2px] bg-emerald-400/70"
            style={{ left: "40px" }}
            aria-hidden
          />

          {/* Spiral-binding dots down the left edge */}
          <div className="pointer-events-none absolute bottom-3 left-2 top-3 flex flex-col justify-around" aria-hidden>
            {Array.from({ length: 8 }).map((_, i) => (
              <span
                key={i}
                className="block h-3.5 w-3.5 rounded-full bg-white shadow-[inset_0_2px_3px_rgba(0,0,0,0.2)] ring-2 ring-emerald-300"
              />
            ))}
          </div>

          {/* Corner doodle */}
          <span className="pointer-events-none absolute right-3 top-3 text-2xl opacity-70" aria-hidden>
            ✏️
          </span>

          {/* Passage text */}
          <p
            className="relative whitespace-pre-wrap text-[17px] font-medium leading-[34px] tracking-wide text-slate-800 sm:text-lg sm:leading-[36px]"
            style={{ fontFamily: "'Comic Sans MS', 'Fredoka', 'Nunito', system-ui, sans-serif" }}
          >
            {text}
          </p>
        </div>

        {/* Bookmark ribbon */}
        <div
          className="pointer-events-none absolute -top-2 right-10 h-16 w-8 bg-gradient-to-b from-emerald-500 to-green-600 shadow-md"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 75%, 0 100%)" }}
          aria-hidden
        />

        {hint && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
            {hint}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        className="relative overflow-hidden rounded-3xl border-4 border-amber-200 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 py-6 pl-12 pr-5 shadow-[0_10px_25px_rgba(161,98,7,0.15)] sm:py-7 sm:pl-14 sm:pr-7"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent 0, transparent 33px, rgba(251, 191, 36, 0.22) 33px, rgba(251, 191, 36, 0.22) 34px)",
          backgroundAttachment: "local",
        }}
      >
        {/* Red margin line */}
        <div
          className="pointer-events-none absolute bottom-0 top-0 w-[2px] bg-rose-300/70"
          style={{ left: "40px" }}
          aria-hidden
        />

        {/* Spiral-binding dots down the left edge */}
        <div className="pointer-events-none absolute bottom-3 left-2 top-3 flex flex-col justify-around" aria-hidden>
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="block h-3.5 w-3.5 rounded-full bg-white shadow-[inset_0_2px_3px_rgba(0,0,0,0.2)] ring-2 ring-amber-300"
            />
          ))}
        </div>

        {/* Corner doodle */}
        <span className="pointer-events-none absolute right-3 top-3 text-2xl opacity-70" aria-hidden>
          ✏️
        </span>

        {/* Passage text */}
        <p
          className="relative whitespace-pre-wrap text-[17px] font-medium leading-[34px] tracking-wide text-slate-800 sm:text-lg sm:leading-[36px]"
          style={{ fontFamily: "'Comic Sans MS', 'Fredoka', 'Nunito', system-ui, sans-serif" }}
        >
          {text}
        </p>
      </div>

      {/* Bookmark ribbon */}
      <div
        className="pointer-events-none absolute -top-2 right-10 h-16 w-8 bg-gradient-to-b from-pink-500 to-rose-600 shadow-md"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 75%, 0 100%)" }}
        aria-hidden
      />

      {hint && (
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
          {hint}
        </div>
      )}
    </div>
  );
}

// ─── Smart line-by-line passage renderer (upper-primary calm tier) ────────
// Parses each line of a passage and styles structured patterns with the
// brand green so older students can scan tickets, dialogues, schedules and
// emails without losing the reading flow.
//   • Title heading line                  → green uppercase block
//   • "Day → action" schedule row         → green day + arrow + text
//   • "Header: value" email field         → green label + value
//   • "Speaker: utterance" dialogue       → green speaker name + utterance
//   • "Label:  RM xx" ticket/price row    → green label + value (multi-space)
//   • "Label — RM xx" em-dash price row   → green label + value (S6 museum)
//   • "Label:" standalone section header  → green section label
//   • "Field: short value" inline field   → green label + value (Opening hours)
//   • Bulleted line (•/-)                 → green bullet + text
//   • Plain text                          → slate paragraph
const EMAIL_HEADER_KEYS = new Set(["To", "From", "Subject", "Date", "Re", "Cc", "Bcc"]);
const SHORT_NAME_WORDS = /^[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){0,2}$/; // up to 3-word names

function SmartPassage({ text }: { text: string }) {
  const rawLines = text.split("\n");
  let headerSeen = false;

  const nodes = rawLines.map((raw, i) => {
    const line = raw.replace(/\s+$/u, "");
    if (line.trim() === "") return <div key={i} className="h-2" />;

    // ── Title detection (only valid on the first non-empty line) ──
    if (!headerSeen) {
      const looksAllCaps = /^[A-Z0-9\s—\-':()]+$/.test(line) && line.length > 4;
      const looksTitleCase =
        /^[A-Z]/.test(line) &&
        !/^\w+:/.test(line) &&         // not "To:" etc
        !/→/.test(line) &&             // not a schedule line
        line.length <= 70;
      if (looksAllCaps || looksTitleCase) {
        headerSeen = true;
        return (
          <h3 key={i} className="mb-3 text-[15px] font-bold uppercase tracking-wider text-[#138a4a] sm:text-base">
            {line.trim()}
          </h3>
        );
      }
    }

    // ── Schedule day with arrow ──
    const schedule = line.match(/^\s*([A-Z][a-zA-Z]+(?:day)?)\s+→\s+(.+)$/);
    if (schedule) {
      return (
        <div key={i} className="flex flex-wrap gap-x-3 gap-y-1 py-0.5">
          <span className="min-w-[90px] font-semibold text-[#138a4a]">{schedule[1]}</span>
          <span className="text-[#9CA3AF]" aria-hidden>→</span>
          <span className="flex-1 text-[#1F2937]">{schedule[2]}</span>
        </div>
      );
    }

    // ── Email header line — may have multiple "Header: value" pairs split by ≥2 spaces ──
    const lineParts = line.split(/\s{2,}/);
    const allEmailHeaders =
      lineParts.length > 0 &&
      lineParts.every((p) => {
        const m = p.match(/^(\w+):\s*(.*)$/);
        return m && EMAIL_HEADER_KEYS.has(m[1]);
      });
    if (allEmailHeaders) {
      headerSeen = true;
      return (
        <div key={i} className="mb-1 flex flex-wrap gap-x-6 gap-y-1 text-sm">
          {lineParts.map((p, j) => {
            const m = p.match(/^(\w+):\s*(.*)$/)!;
            return (
              <span key={j} className="inline-flex gap-2">
                <span className="font-semibold text-[#138a4a]">{m[1]}:</span>
                <span className="text-[#1F2937]">{m[2]}</span>
              </span>
            );
          })}
        </div>
      );
    }

    // ── Em-dash label-value row ("Adults — RM 25", "Children (under 12) — RM 15") ──
    const dashLabel = line.match(/^\s*([A-Z][\w\s\-()/+'']+?)\s+—\s+(.+)$/);
    if (dashLabel && !SHORT_NAME_WORDS.test(dashLabel[1].trim()) && dashLabel[1].trim().length < 50) {
      return (
        <div key={i} className="flex flex-wrap items-baseline gap-x-3 py-0.5">
          <span className="font-semibold text-[#138a4a]">{dashLabel[1].trim()}</span>
          <span className="text-[#9CA3AF]" aria-hidden>—</span>
          <span className="text-[#1F2937]">{dashLabel[2]}</span>
        </div>
      );
    }

    // ── Ticket / label row (label, multiple spaces, value) ──
    const labelVal = line.match(/^\s*([A-Z][\w\s\-()/+]+?):\s{2,}(.+)$/);
    if (labelVal && !SHORT_NAME_WORDS.test(labelVal[1].trim())) {
      // Label with multi-space value AND label isn't a short name → treat as label/value
      return (
        <div key={i} className="flex flex-wrap items-baseline gap-x-3 py-0.5">
          <span className="font-semibold text-[#138a4a]">{labelVal[1].trim()}:</span>
          <span className="text-[#1F2937]">{labelVal[2]}</span>
        </div>
      );
    }

    // ── Standalone section label ("Entry:" with nothing after — S6 museum) ──
    const sectionLabel = line.trim().match(/^([A-Z][\w\s]+):$/);
    if (sectionLabel && sectionLabel[1].length < 30 && !SHORT_NAME_WORDS.test(sectionLabel[1])) {
      return (
        <p key={i} className="mt-1 text-[13px] font-semibold uppercase tracking-wider text-[#138a4a]">
          {sectionLabel[1]}
        </p>
      );
    }

    // ── Inline field-style label ("Opening hours: 9:00 a.m. – 5:00 p.m.") ──
    // Looks like a field when: label is multi-word (has space), value is short or starts with a digit/time.
    const inlineField = line.match(/^\s*([A-Z][a-zA-Z]+(?:\s+[a-z]+){0,3}):\s+(.+)$/);
    if (
      inlineField &&
      /\s/.test(inlineField[1]) &&            // label has at least one space → multi-word field, not a single-name speaker
      !SHORT_NAME_WORDS.test(inlineField[1])  // not a dialogue speaker
    ) {
      return (
        <div key={i} className="flex flex-wrap items-baseline gap-x-2 py-0.5">
          <span className="font-semibold text-[#138a4a]">{inlineField[1]}:</span>
          <span className="text-[#1F2937]">{inlineField[2]}</span>
        </div>
      );
    }

    // ── Dialogue speaker — "Hana: ..." or "Dr Lim: ..." ──
    const speaker = line.match(/^([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){0,2}):\s+(.+)$/);
    if (speaker && SHORT_NAME_WORDS.test(speaker[1]) && !EMAIL_HEADER_KEYS.has(speaker[1])) {
      return (
        <p key={i} className="py-0.5">
          <span className="font-semibold text-[#138a4a]">{speaker[1]}:</span>{" "}
          <span className="text-[#1F2937]">{speaker[2]}</span>
        </p>
      );
    }

    // ── Bulleted line ──
    const bullet = line.match(/^\s*[•\-\*]\s+(.+)$/);
    if (bullet) {
      return (
        <div key={i} className="flex gap-2 py-0.5">
          <span className="mt-0.5 text-[#18A65B]" aria-hidden>•</span>
          <span className="flex-1 text-[#1F2937]">{bullet[1]}</span>
        </div>
      );
    }

    // ── Plain paragraph ──
    return (
      <p key={i} className="text-[16px] leading-[28px] text-[#1F2937] sm:text-[17px] sm:leading-[30px]">
        {line}
      </p>
    );
  });

  return <div className="space-y-1">{nodes}</div>;
}
