import type { QuestionTypePlugin } from "../types";

// A reading passage with N sub-questions (each a SINGLE-style choice).
// content: { passage: "...", subs: [ { stem, options:[{key,text}] }, ... ] }
// answer:  { keys: ["A","C","B"] }   // one key per sub-question
// response:{ keys: ["A","B","B"] }
// Score: each sub equally weighted.

export const readingPlugin: QuestionTypePlugin = {
  type: "READING",
  label: "Reading passage (multi sub-questions)",
  description: "A passage followed by several single-choice sub-questions.",
  defaultContent: () => ({
    passage: "Paste the reading passage here.",
    subs: [
      { stem: "", options: [
        { key: "A", text: "" },
        { key: "B", text: "" },
        { key: "C", text: "" },
        { key: "D", text: "" },
      ] },
    ],
  }),
  defaultAnswer: () => ({ keys: ["A"] }),
  score(answer, response, maxScore) {
    const correctKeys: string[] = answer?.keys ?? [];
    const userKeys: string[] = response?.keys ?? [];
    if (correctKeys.length === 0) return { score: 0, correct: false };
    const each = maxScore / correctKeys.length;
    let hits = 0;
    for (let i = 0; i < correctKeys.length; i++) {
      if (userKeys[i] === correctKeys[i]) hits++;
    }
    const allCorrect = hits === correctKeys.length;
    return { score: Math.round(hits * each * 100) / 100, correct: allCorrect };
  },
};
