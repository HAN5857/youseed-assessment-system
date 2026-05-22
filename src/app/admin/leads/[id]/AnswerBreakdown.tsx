"use client";

// Renders each question the student answered with:
//   • The original prompt (from the Question table — not from the lead JSON)
//   • The student's response (formatted per question type)
//   • The correct answer (formatted per question type)
//   • A correctness badge + score / max
//
// Plus a search box (filter to incorrect / by dimension / by keyword) and a
// summary of where the student stumbled. Tutors use this to review answers
// and design follow-up coaching.

import { useMemo, useState } from "react";

export type EnrichedAnswer = {
  index: number;
  questionId: string;
  type: string;
  dimension: string;
  prompt: string;
  content: any;
  correctAnswer: any;
  response: any;
  score: number;
  max: number;
  correct: boolean;
};

const DIM_COLOR: Record<string, string> = {
  VOCAB:     "bg-pink-100 text-pink-800",
  PHONICS:   "bg-cyan-100 text-cyan-800",
  GRAMMAR:   "bg-blue-100 text-blue-800",
  READING:   "bg-amber-100 text-amber-800",
  LISTENING: "bg-violet-100 text-violet-800",
  WRITING:   "bg-emerald-100 text-emerald-800",
  SPEAKING:  "bg-orange-100 text-orange-800",
};

export function AnswerBreakdown({ items }: { items: EnrichedAnswer[] }) {
  const [filter, setFilter] = useState<"all" | "incorrect" | "correct">("all");
  const [q, setQ] = useState("");
  const [openAll, setOpenAll] = useState(true);

  const visible = useMemo(() => {
    const lower = q.trim().toLowerCase();
    return items.filter((it) => {
      if (filter === "incorrect" && it.correct) return false;
      if (filter === "correct" && !it.correct) return false;
      if (lower) {
        const hay = `${it.prompt} ${it.dimension} ${it.type} ${JSON.stringify(it.response)} ${JSON.stringify(it.correctAnswer)}`.toLowerCase();
        if (!hay.includes(lower)) return false;
      }
      return true;
    });
  }, [items, filter, q]);

  const totalCorrect = items.filter((i) => i.correct).length;
  const totalIncorrect = items.length - totalCorrect;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-3">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Per-question breakdown</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {items.length} questions · {totalCorrect} correct · {totalIncorrect} incorrect
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search prompt or answer…"
              className="w-56 rounded-lg border border-slate-300 bg-white px-3 py-1.5 pl-8 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5 text-xs font-medium">
            {(["all", "incorrect", "correct"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setFilter(k)}
                className={`rounded-md px-2.5 py-1 ${
                  filter === k ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {k === "all" ? "All" : k === "incorrect" ? `Incorrect (${totalIncorrect})` : `Correct (${totalCorrect})`}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setOpenAll((v) => !v)}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            {openAll ? "Collapse all" : "Expand all"}
          </button>
        </div>
      </div>

      <ol className="divide-y divide-slate-100">
        {visible.map((it) => (
          <li key={it.questionId + it.index} className="px-5 py-4">
            <details open={openAll} className="group">
              <summary className="flex cursor-pointer items-start justify-between gap-3 list-none">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <span className="grid h-7 w-7 flex-none place-items-center rounded-md bg-slate-100 text-sm font-semibold text-slate-700">
                    {it.index}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${DIM_COLOR[it.dimension] ?? "bg-slate-100 text-slate-700"}`}>
                        {it.dimension}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-mono text-slate-600">
                        {it.type}
                      </span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-sm text-slate-800">
                      {it.prompt}
                    </p>
                  </div>
                </div>
                <div className="flex flex-none items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      it.correct ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {it.score} / {it.max}
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-slate-400 transition-transform group-open:rotate-180"
                    aria-hidden
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </summary>

              <div className="mt-3 ml-10 grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Student response
                  </div>
                  <div className="mt-1 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
                    {formatAnswer(it.type, it.response, it.content)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                    Correct answer
                  </div>
                  <div className="mt-1 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                    {formatAnswer(it.type, it.correctAnswer, it.content, "correct")}
                  </div>
                </div>
              </div>

              {/* Full prompt (since the summary truncates to 2 lines) */}
              {it.prompt && it.prompt.length > 140 && (
                <div className="mt-3 ml-10 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Full prompt</div>
                  <p className="mt-1 whitespace-pre-wrap">{it.prompt}</p>
                </div>
              )}
            </details>
          </li>
        ))}
        {visible.length === 0 && (
          <li className="px-5 py-10 text-center text-sm text-slate-500">
            No questions match the current filter.
          </li>
        )}
      </ol>
    </div>
  );
}

// ─── Answer formatting helpers ───────────────────────────────────────────
function formatAnswer(type: string, value: any, content: any, mode: "student" | "correct" = "student"): string {
  if (value == null) return "(blank)";
  try {
    switch (type) {
      case "SINGLE": {
        const key = value.key ?? value;
        if (!key) return "(blank)";
        // Look up the option text from content.options for clarity
        const opt = content?.options?.find((o: any) => o.key === key);
        return opt ? `${key} — ${opt.text}` : String(key);
      }
      case "MULTI": {
        const keys: string[] = value.keys ?? value ?? [];
        if (!keys.length) return "(blank)";
        const opts = content?.options ?? [];
        return keys
          .map((k) => {
            const o = opts.find((x: any) => x.key === k);
            return o ? `${k} — ${o.text}` : k;
          })
          .join(", ");
      }
      case "FILL":
      case "SHORT":
      case "WRITING": {
        if (mode === "correct") {
          const accepted: string[] = value.accepted ?? [];
          if (accepted.length) return accepted.join("  /  ");
          if (value.rubric) return value.rubric;
          return value.text ?? JSON.stringify(value);
        }
        return value.text ?? "(blank)";
      }
      case "TRUE_FALSE": {
        return value.value === true ? "TRUE" : value.value === false ? "FALSE" : "(blank)";
      }
      case "MATCHING": {
        const pairs: Record<string, number> = value.pairs ?? {};
        const left = content?.left ?? [];
        const right = content?.right ?? [];
        if (!Object.keys(pairs).length) return "(blank)";
        const lines = Object.entries(pairs)
          .sort((a, b) => Number(a[0]) - Number(b[0]))
          .map(([li, ri]) => {
            const lText = typeof left[Number(li)] === "string" ? left[Number(li)] : left[Number(li)]?.text;
            const rText = right[Number(ri)];
            return `${lText} → ${rText}`;
          });
        return lines.join("\n");
      }
      case "ORDERING": {
        const order: number[] = value.order ?? [];
        const items: string[] = content?.items ?? [];
        if (!order.length) return "(blank)";
        return order.map((i) => items[i]).join("  ");
      }
      case "CLOZE":
      case "READING": {
        const keys: string[] = value.keys ?? [];
        if (!keys.length) return "(blank)";
        return keys.map((k, i) => `(${i + 1}) ${k}`).join("  ");
      }
      case "LISTEN_FILL":
      case "LISTENING": {
        return value.text ?? JSON.stringify(value);
      }
      default:
        return typeof value === "string" ? value : JSON.stringify(value);
    }
  } catch {
    return JSON.stringify(value);
  }
}
