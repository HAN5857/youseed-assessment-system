import type { QuestionTypePlugin } from "../types";

// Arrange items in correct sequence.
// content: { items: ["First","Second","Third","Fourth"] }   // displayed shuffled in UI
// answer:  { order: [0,1,2,3] }                              // canonical order = indices into content.items
// response:{ order: [1,0,2,3] }
// Score: position-accuracy partial credit (Kendall-tau-like, simplified).

export const orderingPlugin: QuestionTypePlugin = {
  type: "ORDERING",
  label: "Ordering / sequencing",
  description: "Arrange items into the correct sequence.",
  defaultContent: () => ({ items: ["", "", ""] }),
  defaultAnswer: () => ({ order: [0, 1, 2] }),
  score(answer, response, maxScore) {
    const correct: number[] = answer?.order ?? [];
    const user: number[] = response?.order ?? [];
    if (correct.length === 0) return { score: 0, correct: false };
    let hits = 0;
    for (let i = 0; i < correct.length; i++) if (user[i] === correct[i]) hits++;
    const ratio = hits / correct.length;
    const allCorrect = hits === correct.length;
    return { score: Math.round(maxScore * ratio * 100) / 100, correct: allCorrect };
  },
};
