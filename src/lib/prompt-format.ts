// Shared helper for splitting a question prompt into:
//   • instruction — short directive at the top ("Read the sentence...", "Choose the correct answer.")
//   • body        — the actual question content the student must engage with
//
// Used by Single, Fill, Reading, Short renderers under the upper-primary
// tier so the instruction can render small + muted-green while the body
// remains the dominant, biggest text. Keeps the existing prompt strings in
// the seed file intact — no DB migration.

const INSTRUCTION_PATTERN =
  /^(Read|Choose|Listen|Match|Rearrange|Write|Your pen pal|You want)\b/;

export function splitPrompt(prompt: string): { instruction?: string; body: string } {
  if (!prompt) return { body: "" };
  const parts = prompt.split(/\n\n+/);
  if (parts.length < 2) return { body: prompt };

  const first = parts[0].trim();
  const rest = parts.slice(1).join("\n\n").trim();

  // Heuristic: instruction is short (< 140 chars), single sentence, starts with a directive verb.
  const looksLikeInstruction =
    INSTRUCTION_PATTERN.test(first) && first.length < 140 && !/\n/.test(first);

  if (!looksLikeInstruction) return { body: prompt };
  return { instruction: first, body: rest };
}
