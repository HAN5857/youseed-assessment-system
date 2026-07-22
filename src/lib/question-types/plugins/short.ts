import type { QuestionTypePlugin } from "../types";

// Short-answer / writing plugin (S4–6 Q25).
//
// Writing responses cannot be reliably auto-scored — a tutor reviews them
// during the follow-up call. To keep the existing scoring pipeline whole,
// we award an effort-based score:
//   • 0 words            → 0
//   • 1..minWords-1      → 30% (attempted)
//   • minWords..maxWords → 70% (on-target effort, tutor confirms quality)
//   • > maxWords         → 60% (over-target, tutor confirms quality)
// The tutor can manually adjust in the admin UI before publishing the score.
//
// content: { minWords?: number, maxWords?: number, template?: string, passage?: string }
// answer:  unused at score time (tutor grades). Stored as { rubric?: string } for reference.
// response: { text: string }

// CJK-aware word counter. Chinese has no spaces between words, so each
// CJK character IS a word/字. When the text contains any CJK codepoint,
// switch to character counting (and still add each latin whitespace chunk).
// Otherwise fall back to standard English word-split. Must stay in sync
// with the counter shown in src/components/question-renderers/Short.tsx.
const CJK_RE = /[㐀-鿿豈-﫿]/;
const CJK_GLOBAL = /[㐀-鿿豈-﫿]/g;
const CJK_PUNCT = /[　-〿＀-￯]/g;

function countWords(s: string): number {
  const t = String(s ?? "").trim();
  if (t === "") return 0;
  if (CJK_RE.test(t)) {
    const cjkChars = (t.match(CJK_GLOBAL) ?? []).length;
    const latin = t.replace(CJK_GLOBAL, " ").replace(CJK_PUNCT, " ").trim();
    const latinChunks = latin === "" ? 0 : latin.split(/\s+/).length;
    return cjkChars + latinChunks;
  }
  return t.split(/\s+/).length;
}

const shortPlugin: QuestionTypePlugin = {
  type: "SHORT",
  label: "Short writing",
  description: "Open-ended writing response. Effort-scored automatically; tutor reviews quality.",
  defaultContent: () => ({ minWords: 30, maxWords: 50 }),
  defaultAnswer: () => ({ rubric: "" }),
  score(_answer, response, maxScore, content) {
    const text = String(response?.text ?? "");
    const words = countWords(text);
    const min = Number(content?.minWords ?? 30);
    const max = Number(content?.maxWords ?? 50);

    if (words === 0) return { score: 0, correct: false, detail: { words, status: "empty" } };
    if (words < min)
      return { score: Math.round(maxScore * 0.3), correct: false, detail: { words, status: "under" } };
    if (words > max)
      return { score: Math.round(maxScore * 0.6), correct: false, detail: { words, status: "over" } };
    return { score: Math.round(maxScore * 0.7), correct: true, detail: { words, status: "on-target" } };
  },
};

export { shortPlugin };
