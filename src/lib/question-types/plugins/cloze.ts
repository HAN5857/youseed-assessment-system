import type { QuestionTypePlugin } from "../types";

// A passage with N blanks. Each blank has a list of acceptable answers.
// content: { passage: "I ___ to school every day. The bus ___ at 7am.", blanks: 2, caseSensitive?: boolean }
// answer:  { blanks: [["go","walk"], ["arrives","comes"]] }
// response:{ blanks: ["go", "arrives"] }
// Score: each blank worth maxScore/blanks.

const norm = (s: string, cs: boolean) => (cs ? s : s.toLowerCase()).trim().replace(/\s+/g, " ");

export const clozePlugin: QuestionTypePlugin = {
  type: "CLOZE",
  label: "Cloze (multiple blanks)",
  description: "A paragraph with several blanks; each blank scored independently.",
  defaultContent: () => ({
    passage: "Type the passage and use ___ (three underscores) to mark each blank.",
    blanks: 1,
    caseSensitive: false,
  }),
  defaultAnswer: () => ({ blanks: [[""]] as string[][] }),
  score(answer, response, maxScore, content) {
    const cs = !!content?.caseSensitive;
    const acceptedPerBlank: string[][] = answer?.blanks ?? [];
    const userBlanks: string[] = response?.blanks ?? [];
    const n = acceptedPerBlank.length || 1;
    const each = maxScore / n;
    let total = 0;
    let allCorrect = true;
    const detail: boolean[] = [];
    for (let i = 0; i < n; i++) {
      const u = norm(String(userBlanks[i] ?? ""), cs);
      const accepted = (acceptedPerBlank[i] ?? []).map((a) => norm(String(a), cs));
      const ok = !!u && accepted.includes(u);
      detail.push(ok);
      if (ok) total += each; else allCorrect = false;
    }
    return { score: Math.round(total * 100) / 100, correct: allCorrect, detail };
  },
};
