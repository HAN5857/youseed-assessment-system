// Server-side question-type plugin contract.
// To add a new type: create a file in ./plugins, export a QuestionTypePlugin, and import it in ./index.ts.
// No DB migration is needed — Question.content + Question.answer are JSON.

export type ScoreResult = {
  score: number;        // points awarded (0..maxScore)
  correct: boolean;     // true if fully correct
  detail?: any;         // optional per-question breakdown for the report
};

export type QuestionTypePlugin = {
  /** Unique type code, stored verbatim in Question.type */
  type: string;
  /** Human-friendly label for the admin editor */
  label: string;
  /** Short hint for question authors */
  description: string;
  /** Default content shape returned to the editor when creating a new question */
  defaultContent: () => any;
  /** Default answer shape */
  defaultAnswer: () => any;
  /**
   * Score a single response.
   * @param correctAnswer parsed Question.answer
   * @param response the student's parsed response (may be undefined / empty)
   * @param maxScore the question's max score
   * @param content parsed Question.content (sometimes scoring needs to know the option set)
   */
  score: (correctAnswer: any, response: any, maxScore: number, content: any) => ScoreResult;
  /** Optional: validate authoring input */
  validateContent?: (content: any) => string | null;
  validateAnswer?: (answer: any, content: any) => string | null;
};
