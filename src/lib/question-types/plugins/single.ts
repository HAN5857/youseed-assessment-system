import type { QuestionTypePlugin } from "../types";

// content: { options: [{ key: "A", text: "..." }, ...] }
// answer:  { key: "A" }
// response: { key: "B" }

export const singlePlugin: QuestionTypePlugin = {
  type: "SINGLE",
  label: "Single choice",
  description: "One correct answer from a list of options.",
  defaultContent: () => ({
    options: [
      { key: "A", text: "" },
      { key: "B", text: "" },
      { key: "C", text: "" },
      { key: "D", text: "" },
    ],
  }),
  defaultAnswer: () => ({ key: "A" }),
  score(answer, response, maxScore) {
    const correct = response?.key === answer?.key;
    return { score: correct ? maxScore : 0, correct };
  },
};
