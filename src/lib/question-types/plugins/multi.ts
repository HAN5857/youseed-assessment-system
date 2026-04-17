import type { QuestionTypePlugin } from "../types";

// content: { options: [{key, text}, ...], partialCredit?: boolean }
// answer:  { keys: ["A","C"] }
// response: { keys: ["A","B"] }
// Default scoring: all-or-nothing. If partialCredit=true, use Jaccard-style partial scoring with wrong-pick penalty.

export const multiPlugin: QuestionTypePlugin = {
  type: "MULTI",
  label: "Multiple choice (multiple answers)",
  description: "More than one correct option may exist.",
  defaultContent: () => ({
    options: [
      { key: "A", text: "" },
      { key: "B", text: "" },
      { key: "C", text: "" },
      { key: "D", text: "" },
    ],
    partialCredit: false,
  }),
  defaultAnswer: () => ({ keys: [] as string[] }),
  score(answer, response, maxScore, content) {
    const correctSet = new Set<string>(answer?.keys ?? []);
    const chosenSet = new Set<string>(response?.keys ?? []);
    const allOptions = (content?.options ?? []) as { key: string }[];
    const wrongPool = allOptions.length - correctSet.size;

    const allCorrect =
      correctSet.size === chosenSet.size &&
      [...correctSet].every((k) => chosenSet.has(k));

    if (!content?.partialCredit) {
      return { score: allCorrect ? maxScore : 0, correct: allCorrect };
    }

    // Partial: + for hits, − for wrong picks
    let hits = 0;
    let wrongs = 0;
    for (const k of chosenSet) (correctSet.has(k) ? hits++ : wrongs++);
    const ratio = Math.max(
      0,
      hits / Math.max(1, correctSet.size) -
        0.5 * (wrongs / Math.max(1, wrongPool))
    );
    const partial = Math.round(maxScore * ratio * 100) / 100;
    return { score: allCorrect ? maxScore : partial, correct: allCorrect };
  },
};
