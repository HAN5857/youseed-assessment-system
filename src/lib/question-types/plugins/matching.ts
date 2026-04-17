import type { QuestionTypePlugin } from "../types";

// Match items in column A to items in column B.
// content: { left: ["Dog","Cat","Cow"], right: ["Bark","Meow","Moo"] }
// answer:  { pairs: { "0": 0, "1": 1, "2": 2 } }   // leftIndex → rightIndex
// response:{ pairs: { "0": 1, "1": 0, "2": 2 } }
// Score: per-pair partial credit.

export const matchingPlugin: QuestionTypePlugin = {
  type: "MATCHING",
  label: "Matching pairs",
  description: "Match items in column A with items in column B.",
  defaultContent: () => ({ left: ["", ""], right: ["", ""] }),
  defaultAnswer: () => ({ pairs: {} as Record<string, number> }),
  score(answer, response, maxScore) {
    const correctPairs: Record<string, number> = answer?.pairs ?? {};
    const userPairs: Record<string, number> = response?.pairs ?? {};
    const keys = Object.keys(correctPairs);
    if (keys.length === 0) return { score: 0, correct: false };
    const each = maxScore / keys.length;
    let total = 0;
    let allCorrect = true;
    for (const k of keys) {
      if (userPairs[k] === correctPairs[k]) total += each;
      else allCorrect = false;
    }
    return { score: Math.round(total * 100) / 100, correct: allCorrect };
  },
};
