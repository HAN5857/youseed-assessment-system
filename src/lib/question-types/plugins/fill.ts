import type { QuestionTypePlugin } from "../types";
import { normaliseAnswer } from "@/lib/cjk";

// content: { caseSensitive?: boolean }
// answer:  { accepted: ["color", "colour"] }   // any match counts
// response:{ text: "colour" }
//
// normaliseAnswer is CJK-aware: English answers collapse internal
// whitespace, Chinese answers strip ALL whitespace so「我 是 学 生」
// (student spaced each 字 out) matches the canonical「我是学生」.

const norm = (s: string, cs: boolean) => normaliseAnswer(cs ? s : s.toLowerCase());

export const fillPlugin: QuestionTypePlugin = {
  type: "FILL",
  label: "Fill in the blank",
  description: "One short text input. List all acceptable answers.",
  defaultContent: () => ({ caseSensitive: false }),
  defaultAnswer: () => ({ accepted: [""] }),
  score(answer, response, maxScore, content) {
    const cs = !!content?.caseSensitive;
    const r = norm(String(response?.text ?? ""), cs);
    if (!r) return { score: 0, correct: false };
    const accepted = (answer?.accepted ?? []).map((a: string) => norm(String(a), cs));
    const ok = accepted.includes(r);
    return { score: ok ? maxScore : 0, correct: ok };
  },
};
