import type { QuestionTypePlugin } from "../types";

// content: {} (no options needed; UI shows True/False)
// answer:  { value: true }
// response:{ value: false }

export const trueFalsePlugin: QuestionTypePlugin = {
  type: "TRUE_FALSE",
  label: "True / False",
  description: "Statement is either true or false.",
  defaultContent: () => ({}),
  defaultAnswer: () => ({ value: true }),
  score(answer, response, maxScore) {
    const correct = typeof response?.value === "boolean" && response.value === answer?.value;
    return { score: correct ? maxScore : 0, correct };
  },
};
