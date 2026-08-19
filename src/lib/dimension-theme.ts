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

// ─── Chinese (华文) palette — jade + gold + cinnabar accents ────────────
// A visually-distinct third palette family: still kid-friendly, but with
// the reds/golds Mandarin materials traditionally use, plus jade greens
// so it stays legible next to the calm-tier language chrome.
const THEMES_CHINESE: Record<string, DimensionTheme> = {
  VOCAB: {
    emoji: "字", label: "字词",
    gradient: "from-rose-500 to-red-500",
    accent: "text-rose-700",
    bg: "from-rose-50 via-white to-red-50",
    sticker: "🀄",
    entryAnim: "kid-slide-in",
  },
  GRAMMAR: {
    emoji: "语", label: "语法",
    gradient: "from-amber-500 to-orange-500",
    accent: "text-amber-700",
    bg: "from-amber-50 via-white to-orange-50",
    sticker: "🎋",
    entryAnim: "kid-pop-in",
  },
  READING: {
    emoji: "读", label: "阅读",
    gradient: "from-emerald-600 to-teal-600",
    accent: "text-emerald-700",
    bg: "from-emerald-50 via-white to-teal-50",
    sticker: "📜",
    entryAnim: "kid-zoom-in",
  },
  LISTENING: {
    emoji: "听", label: "听力",
    gradient: "from-indigo-500 to-violet-500",
    accent: "text-indigo-700",
    bg: "from-indigo-50 via-white to-violet-50",
    sticker: "🎐",
    entryAnim: "kid-slide-in",
  },
  PHONICS: {
    emoji: "拼", label: "拼音",
    gradient: "from-cyan-500 to-sky-500",
    accent: "text-sky-700",
    bg: "from-cyan-50 via-white to-sky-50",
    sticker: "🐼",
    entryAnim: "kid-pop-in",
  },
  WRITING: {
    emoji: "写", label: "写作",
    gradient: "from-red-500 to-rose-500",
    accent: "text-red-700",
    bg: "from-red-50 via-white to-rose-50",
    sticker: "🖋️",
    entryAnim: "kid-pop-in",
  },
  SPEAKING: {
    emoji: "说", label: "口语",
    gradient: "from-orange-500 to-amber-500",
    accent: "text-orange-700",
    bg: "from-orange-50 via-white to-amber-50",
    sticker: "🏮",
    entryAnim: "kid-bounce-in",
  },
};

const FALLBACK_CHINESE: DimensionTheme = {
  emoji: "题", label: "题目",
  gradient: "from-red-500 to-amber-500",
  accent: "text-red-700",
  bg: "from-rose-50 via-white to-amber-50",
  sticker: "⭐",
  entryAnim: "kid-slide-in",
};

export function dimensionThemeChinese(dimension: string): DimensionTheme {
  return THEMES_CHINESE[dimension] ?? FALLBACK_CHINESE;
}

// ─── Bahasa Melayu palette — songket gold + bunga-raya red + tropical teal ──
// Malay labels + a warm Malaysian family, distinct from the calm green and
// the Mandarin jade/red. Each dimension stays inside the red/gold/teal set.
const THEMES_MALAY: Record<string, DimensionTheme> = {
  VOCAB: {
    emoji: "🔤", label: "Kosa Kata",
    gradient: "from-red-500 to-rose-500",
    accent: "text-red-700",
    bg: "from-red-50 via-white to-rose-50",
    sticker: "🌺",
    entryAnim: "kid-slide-in",
  },
  GRAMMAR: {
    emoji: "📝", label: "Tatabahasa",
    gradient: "from-amber-500 to-yellow-500",
    accent: "text-amber-700",
    bg: "from-amber-50 via-white to-yellow-50",
    sticker: "🪁",
    entryAnim: "kid-pop-in",
  },
  READING: {
    emoji: "📖", label: "Pemahaman",
    gradient: "from-teal-500 to-emerald-600",
    accent: "text-teal-700",
    bg: "from-teal-50 via-white to-emerald-50",
    sticker: "📖",
    entryAnim: "kid-zoom-in",
  },
  LISTENING: {
    emoji: "👂", label: "Mendengar",
    gradient: "from-amber-500 to-orange-500",
    accent: "text-orange-700",
    bg: "from-amber-50 via-white to-orange-50",
    sticker: "🎧",
    entryAnim: "kid-slide-in",
  },
  PHONICS: {
    emoji: "🔊", label: "Ejaan",
    gradient: "from-rose-500 to-red-500",
    accent: "text-rose-700",
    bg: "from-rose-50 via-white to-red-50",
    sticker: "🌴",
    entryAnim: "kid-pop-in",
  },
  WRITING: {
    emoji: "✍️", label: "Penulisan",
    gradient: "from-emerald-500 to-teal-600",
    accent: "text-emerald-700",
    bg: "from-emerald-50 via-white to-teal-50",
    sticker: "🖍",
    entryAnim: "kid-pop-in",
  },
  SPEAKING: {
    emoji: "🎤", label: "Lisan",
    gradient: "from-orange-500 to-amber-500",
    accent: "text-orange-700",
    bg: "from-orange-50 via-white to-amber-50",
    sticker: "💬",
    entryAnim: "kid-bounce-in",
  },
};

const FALLBACK_MALAY: DimensionTheme = {
  emoji: "✨", label: "Soalan",
  gradient: "from-red-500 to-amber-500",
  accent: "text-red-700",
  bg: "from-red-50 via-white to-amber-50",
  sticker: "🌺",
  entryAnim: "kid-slide-in",
};

export function dimensionThemeMalay(dimension: string): DimensionTheme {
  return THEMES_MALAY[dimension] ?? FALLBACK_MALAY;
}

// Milestone messages keyed by the question NUMBER the student just finished.
// Chinese variant is triggered when the caller passes locale = "zh".
export function milestoneForProgress(
  answered: number,
  total: number,
  locale: "en" | "zh" = "en",
): string | null {
  if (total < 5) return null;
  const en = locale === "en";
  if (answered === Math.floor(total * 0.25)) return en ? "🌱 Great start! 25% done." : "🌱 好的开始！走完四分之一。";
  if (answered === Math.floor(total * 0.5))  return en ? "🔥 Halfway there — you've got this!" : "🔥 已经完成一半，加油！";
  if (answered === Math.floor(total * 0.75)) return en ? "🚀 So close! Just a little more." : "🚀 就快到啦，再撑一下！";
  if (answered === total - 1)                return en ? "⭐ One more to go!" : "⭐ 只剩最后一题！";
  return null;
}
