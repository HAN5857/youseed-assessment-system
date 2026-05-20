// Visual theme per dimension — drives per-question styling so every card feels fresh.
// Colours, emoji, and banner gradients vary based on what's being tested.

export type DimensionTheme = {
  emoji: string;
  label: string;
  gradient: string;      // card ribbon + chip gradient
  accent: string;        // accent text color
  bg: string;            // card background tint
  sticker: string;       // corner emoji
  entryAnim: string;     // which CSS animation class to use on entry
};

const THEMES: Record<string, DimensionTheme> = {
  VOCAB: {
    emoji: "🔤", label: "Vocabulary",
    gradient: "from-pink-500 to-rose-500",
    accent: "text-pink-600",
    bg: "from-pink-50 via-white to-rose-50",
    sticker: "📚",
    entryAnim: "kid-slide-in",
  },
  GRAMMAR: {
    emoji: "📝", label: "Grammar",
    gradient: "from-sky-500 to-indigo-500",
    accent: "text-sky-600",
    bg: "from-sky-50 via-white to-indigo-50",
    sticker: "🧩",
    entryAnim: "kid-pop-in",
  },
  READING: {
    emoji: "📖", label: "Reading",
    gradient: "from-amber-500 to-orange-500",
    accent: "text-amber-600",
    bg: "from-amber-50 via-white to-orange-50",
    sticker: "🦉",
    entryAnim: "kid-zoom-in",
  },
  LISTENING: {
    emoji: "👂", label: "Listening",
    gradient: "from-violet-500 to-fuchsia-500",
    accent: "text-violet-600",
    bg: "from-violet-50 via-white to-fuchsia-50",
    sticker: "🎵",
    entryAnim: "kid-slide-in",
  },
  PHONICS: {
    emoji: "🔊", label: "Phonics",
    gradient: "from-cyan-500 to-blue-500",
    accent: "text-cyan-700",
    bg: "from-cyan-50 via-white to-blue-50",
    sticker: "🎧",
    entryAnim: "kid-pop-in",
  },
  WRITING: {
    emoji: "✍️", label: "Writing",
    gradient: "from-emerald-500 to-teal-500",
    accent: "text-emerald-600",
    bg: "from-emerald-50 via-white to-teal-50",
    sticker: "🖍",
    entryAnim: "kid-pop-in",
  },
  SPEAKING: {
    emoji: "🎤", label: "Speaking",
    gradient: "from-orange-500 to-pink-500",
    accent: "text-orange-600",
    bg: "from-orange-50 via-white to-pink-50",
    sticker: "💬",
    entryAnim: "kid-bounce-in",
  },
};

const FALLBACK: DimensionTheme = {
  emoji: "✨", label: "Question",
  gradient: "from-slate-500 to-slate-600",
  accent: "text-slate-600",
  bg: "from-slate-50 via-white to-slate-50",
  sticker: "⭐",
  entryAnim: "kid-slide-in",
};

export function dimensionTheme(dimension: string): DimensionTheme {
  return THEMES[dimension] ?? FALLBACK;
}

// ─── Calm (YouSeed green) palettes ──────────────────────────────────────
// Same structure as THEMES, just retinted to green-family shades so every
// dimension still feels visually fresh while staying on-brand.
const THEMES_CALM: Record<string, DimensionTheme> = {
  VOCAB: {
    emoji: "🔤", label: "Vocabulary",
    gradient: "from-emerald-500 to-green-500",
    accent: "text-emerald-600",
    bg: "from-emerald-50 via-white to-green-50",
    sticker: "📚",
    entryAnim: "kid-slide-in",
  },
  GRAMMAR: {
    emoji: "📝", label: "Grammar",
    gradient: "from-teal-500 to-cyan-500",
    accent: "text-teal-600",
    bg: "from-teal-50 via-white to-cyan-50",
    sticker: "🧩",
    entryAnim: "kid-pop-in",
  },
  READING: {
    emoji: "📖", label: "Reading",
    gradient: "from-lime-500 to-green-500",
    accent: "text-lime-700",
    bg: "from-lime-50 via-white to-green-50",
    sticker: "🦉",
    entryAnim: "kid-zoom-in",
  },
  LISTENING: {
    emoji: "👂", label: "Listening",
    gradient: "from-emerald-500 to-teal-500",
    accent: "text-emerald-600",
    bg: "from-emerald-50 via-white to-teal-50",
    sticker: "🎵",
    entryAnim: "kid-slide-in",
  },
  PHONICS: {
    emoji: "🔊", label: "Phonics",
    gradient: "from-teal-500 to-emerald-500",
    accent: "text-teal-700",
    bg: "from-teal-50 via-white to-emerald-50",
    sticker: "🎧",
    entryAnim: "kid-pop-in",
  },
  WRITING: {
    emoji: "✍️", label: "Writing",
    gradient: "from-green-500 to-emerald-500",
    accent: "text-green-700",
    bg: "from-green-50 via-white to-emerald-50",
    sticker: "🖍",
    entryAnim: "kid-pop-in",
  },
  SPEAKING: {
    emoji: "🎤", label: "Speaking",
    gradient: "from-lime-500 to-emerald-500",
    accent: "text-emerald-600",
    bg: "from-lime-50 via-white to-emerald-50",
    sticker: "💬",
    entryAnim: "kid-bounce-in",
  },
};

const FALLBACK_CALM: DimensionTheme = {
  emoji: "✨", label: "Question",
  gradient: "from-emerald-500 to-green-500",
  accent: "text-emerald-600",
  bg: "from-emerald-50 via-white to-green-50",
  sticker: "⭐",
  entryAnim: "kid-slide-in",
};

export function dimensionThemeCalm(dimension: string): DimensionTheme {
  return THEMES_CALM[dimension] ?? FALLBACK_CALM;
}

// Milestone messages keyed by the question NUMBER the student just finished.
export function milestoneForProgress(answered: number, total: number): string | null {
  if (total < 5) return null;
  const pct = answered / total;
  if (answered === Math.floor(total * 0.25)) return "🌱 Great start! 25% done.";
  if (answered === Math.floor(total * 0.5))  return "🔥 Halfway there — you've got this!";
  if (answered === Math.floor(total * 0.75)) return "🚀 So close! Just a little more.";
  if (answered === total - 1)                return "⭐ One more to go!";
  return null;
}
