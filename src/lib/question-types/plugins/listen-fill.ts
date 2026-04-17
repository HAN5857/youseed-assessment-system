import type { QuestionTypePlugin } from "../types";
import { fillPlugin } from "./fill";

// Listen-and-fill: plays a word via Web Speech API, student types what they heard.
// content: { speakText: "hat", caseSensitive?: boolean, maxPlays?: number, lang?: string }
// answer:  { accepted: ["hat"] }
// response:{ text: "hat" }
// Scoring reuses the FILL plugin (normalize + exact match against accepted list).

export const listenFillPlugin: QuestionTypePlugin = {
  type: "LISTEN_FILL",
  label: "Listen & fill",
  description: "Plays an audio clip (browser TTS) — student types what they heard.",
  defaultContent: () => ({ speakText: "", caseSensitive: false, maxPlays: 3, lang: "en-US" }),
  defaultAnswer: () => ({ accepted: [""] }),
  score: fillPlugin.score,
};
