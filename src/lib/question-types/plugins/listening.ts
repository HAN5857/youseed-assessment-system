import type { QuestionTypePlugin } from "../types";
import { singlePlugin } from "./single";

// Audio-based question. Reuses SINGLE-style scoring but the renderer plays Question.mediaUrl first.
// content: { options: [{key,text}], maxPlays?: number }
// answer:  { key: "B" }

export const listeningPlugin: QuestionTypePlugin = {
  type: "LISTENING",
  label: "Listening (audio + single choice)",
  description: "Plays an audio clip, then asks a single-choice question.",
  defaultContent: () => ({
    options: [
      { key: "A", text: "" },
      { key: "B", text: "" },
      { key: "C", text: "" },
      { key: "D", text: "" },
    ],
    maxPlays: 2,
  }),
  defaultAnswer: () => ({ key: "A" }),
  score: singlePlugin.score, // identical scoring shape
};
