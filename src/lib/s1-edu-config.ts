// ─────────────────────────────────────────────────────────────────────────
// S1 Edutainment — copy & anchor configuration
// ─────────────────────────────────────────────────────────────────────────
//
// Seedy is the named YouSeed mascot for the kid-friendly upgrade.
// Persona: a curious little YouSeed sprout exploring the world of words
// alongside the child. Peer, not teacher. Warm, never bossy. CEFR-A1
// vocabulary. Sentences ≤ 12 words. Always 1st-person ("I love this!").
//
// Banned words anywhere Seedy speaks: test, exam, score, grade, wrong,
// fail, smart, lazy. Always frame the experience as adventure / journey
// / quest / round / chapter.

export const SEEDY = {
  name: "Seedy",
  emoji: "🌱",
};

export type SeedyAnchor =
  | "greeting"
  | "practice-intro"
  | "round-vocab"
  | "round-grammar"
  | "round-reading"
  | "round-writing"
  | "halfway"
  | "late"
  | "idle"
  | "finish";

/**
 * Speech-bubble strings keyed by anchor moment.
 * `{name}` is replaced with the child's first name at render time.
 */
export const SEEDY_COPY: Record<SeedyAnchor, string> = {
  "greeting":        "Hi {name}! I'm Seedy. Let's go on an adventure together! 🌱",
  "practice-intro":  "Let's try a warm-up first. This one doesn't count — promise!",
  "round-vocab":     "First stop — Word Forest! Look closely 🔤",
  "round-grammar":   "Here's the Grammar Bridge. Pick the one that sounds right 📝",
  "round-reading":   "Time to read! Take your time 📖",
  "round-writing":   "Last one — let's build sentences together ✍️",
  "halfway":         "You're already halfway! That's amazing 💛",
  "late":            "Almost at the castle! Two more 🏰",
  "idle":            "Take your time — I'm right here 🌱",
  "finish":          "You did it! Let's see what you collected 🎉",
};

/**
 * Indices in the question array (0-based, post-practice) that mark the start
 * of each named module. Used by ChapterInterstitial + MascotSpeechBubble to
 * fire the matching round-* anchor.
 */
export const S1_MODULE_BOUNDARIES = {
  vocab: 0,    // Q1
  grammar: 10, // Q11
  reading: 15, // Q16
  writing: 18, // Q19
} as const;

/**
 * Adventure-map waypoint labels — purely cosmetic; same data as the existing
 * StarProgress, just dressed as a journey.
 */
export const S1_MAP_STATIONS = [
  { atIndex: 0,  name: "Word Forest",     emoji: "🌳" },
  { atIndex: 4,  name: "Phonics Trail",   emoji: "🎵" },
  { atIndex: 7,  name: "Sound Cave",      emoji: "🎧" },
  { atIndex: 10, name: "Grammar Bridge",  emoji: "🌉" },
  { atIndex: 15, name: "Story Vale",      emoji: "📖" },
  { atIndex: 18, name: "Sentence Castle", emoji: "🏰" },
] as const;

/** Helper to substitute the child's first name into a copy string. */
export function speedyCopy(anchor: SeedyAnchor, vars?: { name?: string }): string {
  const raw = SEEDY_COPY[anchor];
  const name = (vars?.name ?? "friend").split(/\s+/)[0]; // first name only
  return raw.replace("{name}", name);
}
