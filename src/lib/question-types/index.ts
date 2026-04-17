// Server-side registry of question-type plugins.
// Import all plugin files here so they self-register at module load.

import type { QuestionTypePlugin, ScoreResult } from "./types";

import { singlePlugin } from "./plugins/single";
import { multiPlugin } from "./plugins/multi";
import { trueFalsePlugin } from "./plugins/true-false";
import { fillPlugin } from "./plugins/fill";
import { clozePlugin } from "./plugins/cloze";
import { matchingPlugin } from "./plugins/matching";
import { orderingPlugin } from "./plugins/ordering";
import { listeningPlugin } from "./plugins/listening";
import { readingPlugin } from "./plugins/reading";
import { listenFillPlugin } from "./plugins/listen-fill";

const registry = new Map<string, QuestionTypePlugin>();

function register(p: QuestionTypePlugin) {
  if (registry.has(p.type)) {
    throw new Error(`Duplicate question type registered: ${p.type}`);
  }
  registry.set(p.type, p);
}

// Built-in plugins. New ones: add a file in ./plugins and a register() line below.
[
  singlePlugin,
  multiPlugin,
  trueFalsePlugin,
  fillPlugin,
  clozePlugin,
  matchingPlugin,
  orderingPlugin,
  listeningPlugin,
  readingPlugin,
  listenFillPlugin,
].forEach(register);

export function getPlugin(type: string): QuestionTypePlugin | undefined {
  return registry.get(type);
}

export function listPlugins(): QuestionTypePlugin[] {
  return Array.from(registry.values());
}

/**
 * Score a question. Falls back gracefully if the type is unknown.
 */
export function scoreAnswer(
  type: string,
  correctAnswer: unknown,
  response: unknown,
  maxScore: number,
  content: unknown
): ScoreResult {
  const plugin = registry.get(type);
  if (!plugin) {
    return { score: 0, correct: false, detail: { error: `Unknown question type: ${type}` } };
  }
  try {
    return plugin.score(correctAnswer, response, maxScore, content);
  } catch (err) {
    return { score: 0, correct: false, detail: { error: String(err) } };
  }
}

export type { QuestionTypePlugin, ScoreResult };
