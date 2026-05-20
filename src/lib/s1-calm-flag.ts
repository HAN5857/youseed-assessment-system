// ─────────────────────────────────────────────────────────────────────────
// Calm (YouSeed green + white) UI flag + age tier helper
// ─────────────────────────────────────────────────────────────────────────
//
// `isS1Calm` — true when the lead should use the calm exam runner.
// `levelTier`  — "primary" (S1-S3, age 7-9) vs "upper-primary" (S4-S6, age 10-12).
//                The runner uses this to dial decoration density:
//                  primary       — corner stickers, ✨ toasts, ⭐ chips, bouncier spring
//                  upper-primary — cleaner timer, no stickers, "marks" not "⭐ points",
//                                  subtler transitions, no playful toasts
//
// Both tiers share the same green theme, framer-motion page transitions,
// mascot reactions, sticker bursts (gated by `tone`), and FinishDialog calm
// variant. The animation system is preserved; only decoration density and
// copy tone change with the tier.
//
// Approved standards (append future levels here):
//   primary       — standard-1, standard-2, standard-3
//   upper-primary — standard-4, standard-5, standard-6
//
// The flag is read at request time, not stored on the lead — flipping it
// mid-session would only switch UI after the next reload. Autosave runs
// every 20s so no answer data is lost across that boundary.

export const S1_CALM_FLAG_ON = process.env.NEXT_PUBLIC_S1_CALM_FLAG === "1";

const PRIMARY_LEVELS = new Set<string>([
  "standard-1",
  "standard-2",
  "standard-3",
]);
const UPPER_PRIMARY_LEVELS = new Set<string>([
  "standard-4",
  "standard-5",
  "standard-6",
]);

export type LevelTier = "primary" | "upper-primary";

export function isS1Calm(
  subject?: string | null,
  level?: string | null,
): boolean {
  if (!S1_CALM_FLAG_ON) return false;
  if (subject?.toLowerCase() !== "english") return false;
  const lvl = level?.toLowerCase() ?? "";
  return PRIMARY_LEVELS.has(lvl) || UPPER_PRIMARY_LEVELS.has(lvl);
}

/** Visual tier for a calm lead. Defaults to "primary" if level is unknown. */
export function levelTier(level?: string | null): LevelTier {
  return UPPER_PRIMARY_LEVELS.has(level?.toLowerCase() ?? "") ? "upper-primary" : "primary";
}
