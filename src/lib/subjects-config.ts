// ──────────────────────────────────────────────────────────────────────────
// Subject + Level catalogue — single source of truth for the test platform.
//
// To add a new level:
//   1. Add it to the `levels` array of the relevant subject below
//   2. Seed the matching Test row in prisma/seed.ts (subject + level pair)
//   3. Generate a passkey via the admin UI
//
// The DB is the source of truth for which tests EXIST and their content;
// this file is the source of truth for what's PRESENTED in the UI and the
// expected level codes / cosmetic metadata.
// ──────────────────────────────────────────────────────────────────────────

export type LevelDef = {
  id: string;            // e.g. "standard-1" — must match DB Test.level
  name: string;          // e.g. "Standard 1"
  ageHint?: string;      // e.g. "Year 1 · Age 7"
  unit?: string;         // e.g. "Supermind Year 1 · Unit 0–4"
  enabled: boolean;      // false ⇒ shown as "Coming soon", not clickable
  color: string;         // tailwind gradient, e.g. "from-pink-400 to-rose-500"
  emoji: string;
};

export type SubjectDef = {
  id: string;            // e.g. "english" — used in URLs and DB Test.subject
  name: string;          // e.g. "English"
  tagline: string;
  emoji: string;
  bgGradient: string;    // tailwind classes for the subject card background
  enabled: boolean;      // false ⇒ shown but locked ("Coming soon")
  levels: LevelDef[];
};

const STANDARD_LEVELS: Omit<LevelDef, "enabled" | "unit" | "ageHint">[] = [
  { id: "standard-1", name: "Standard 1", color: "from-pink-400 to-rose-500",     emoji: "🌱" },
  { id: "standard-2", name: "Standard 2", color: "from-orange-400 to-amber-500",  emoji: "🌿" },
  { id: "standard-3", name: "Standard 3", color: "from-yellow-400 to-orange-500", emoji: "🌸" },
  { id: "standard-4", name: "Standard 4", color: "from-emerald-400 to-teal-500",  emoji: "🌳" },
  { id: "standard-5", name: "Standard 5", color: "from-sky-400 to-indigo-500",    emoji: "🚀" },
  { id: "standard-6", name: "Standard 6", color: "from-violet-500 to-fuchsia-500",emoji: "👑" },
];

export const SUBJECTS: SubjectDef[] = [
  {
    id: "english",
    name: "English",
    tagline: "Vocabulary, grammar, reading & listening",
    emoji: "🦁",
    bgGradient: "from-pink-400 via-orange-400 to-amber-400",
    enabled: true,
    levels: [
      { ...STANDARD_LEVELS[0], unit: "Supermind Year 1 · Unit 0–4", ageHint: "Year 1 · Age 7", enabled: true },
      { ...STANDARD_LEVELS[1], unit: "Supermind Year 2 · Unit 5–9", ageHint: "Year 2 · Age 8", enabled: true },
      { ...STANDARD_LEVELS[2], unit: "Year 3 · Placement",          ageHint: "Year 3 · Age 9", enabled: true },
      { ...STANDARD_LEVELS[3], unit: "Coming soon",                 ageHint: "Year 4 · Age 10", enabled: false },
      { ...STANDARD_LEVELS[4], unit: "Coming soon",                 ageHint: "Year 5 · Age 11", enabled: false },
      { ...STANDARD_LEVELS[5], unit: "Coming soon",                 ageHint: "Year 6 · Age 12", enabled: false },
    ],
  },
  {
    id: "bahasa-melayu",
    name: "Bahasa Melayu",
    tagline: "Perbendaharaan, tatabahasa, pemahaman",
    emoji: "🌺",
    bgGradient: "from-emerald-400 via-teal-400 to-cyan-400",
    enabled: false,
    levels: STANDARD_LEVELS.map((l) => ({ ...l, unit: "Coming soon", enabled: false })),
  },
  {
    id: "chinese",
    name: "Chinese · 中文",
    tagline: "词汇、语法、阅读与听力",
    emoji: "🐼",
    bgGradient: "from-rose-400 via-red-400 to-orange-400",
    enabled: false,
    levels: STANDARD_LEVELS.map((l) => ({ ...l, unit: "Coming soon", enabled: false })),
  },
];

// ── Helpers ─────────────────────────────────────────────────────────────
export function getSubject(id: string): SubjectDef | undefined {
  return SUBJECTS.find((s) => s.id === id);
}

export function getLevel(subjectId: string, levelId: string): LevelDef | undefined {
  return getSubject(subjectId)?.levels.find((l) => l.id === levelId);
}

export function getEnabledLevels(subjectId: string): LevelDef[] {
  return getSubject(subjectId)?.levels.filter((l) => l.enabled) ?? [];
}
