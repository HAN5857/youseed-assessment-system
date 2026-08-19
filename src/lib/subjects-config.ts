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
      { ...STANDARD_LEVELS[0], unit: "Supermind Year 1 · Unit 0–4",            ageHint: "Year 1 · Age 7",  enabled: true },
      { ...STANDARD_LEVELS[1], unit: "Supermind Year 2 · Unit 5–9",            ageHint: "Year 2 · Age 8",  enabled: true },
      { ...STANDARD_LEVELS[2], unit: "Year 3 · Placement",                     ageHint: "Year 3 · Age 9",  enabled: true },
      { ...STANDARD_LEVELS[3], unit: "Get Smart Plus 4 · Module 1–10",         ageHint: "Year 4 · Age 10", enabled: true },
      { ...STANDARD_LEVELS[4], unit: "English Plus 1 · Starter Unit – Unit 8", ageHint: "Year 5 · Age 11", enabled: true },
      { ...STANDARD_LEVELS[5], unit: "Academy Stars Year 6 · Welcome – Unit 10", ageHint: "Year 6 · Age 12", enabled: true },
    ],
  },
  {
    id: "bahasa-melayu",
    name: "Bahasa Melayu",
    tagline: "Ejaan, tatabahasa, pemahaman & penulisan · KSSR Semakan",
    emoji: "🌺",
    bgGradient: "from-amber-400 via-teal-500 to-emerald-500",
    enabled: true,
    levels: [
      { ...STANDARD_LEVELS[0], unit: "BM Tahun 1 · KSSR Semakan",       ageHint: "Tahun 1 · Umur 7",  enabled: true },
      { ...STANDARD_LEVELS[1], unit: "BM Tahun 2 · KSSR Semakan",       ageHint: "Tahun 2 · Umur 8",  enabled: true },
      { ...STANDARD_LEVELS[2], unit: "BM Tahun 3 · KSSR Semakan",       ageHint: "Tahun 3 · Umur 9",  enabled: true },
      { ...STANDARD_LEVELS[3], unit: "BM Tahun 4 · Format UASA",        ageHint: "Tahun 4 · Umur 10", enabled: true },
      { ...STANDARD_LEVELS[4], unit: "BM Tahun 5 · Format UASA",        ageHint: "Tahun 5 · Umur 11", enabled: true },
      { ...STANDARD_LEVELS[5], unit: "BM Tahun 6 · Format UASA",        ageHint: "Tahun 6 · Umur 12", enabled: true },
    ],
  },
  {
    id: "chinese",
    name: "Chinese · 中文",
    tagline: "字词、拼音、语法、阅读与写作 · KSSR Semakan",
    emoji: "🐼",
    bgGradient: "from-rose-400 via-red-400 to-orange-400",
    enabled: true,
    levels: [
      { ...STANDARD_LEVELS[0], unit: "华文一年级 · KSSR Semakan",   ageHint: "Year 1 · Age 7",  enabled: true },
      { ...STANDARD_LEVELS[1], unit: "华文二年级 · KSSR Semakan",   ageHint: "Year 2 · Age 8",  enabled: true },
      { ...STANDARD_LEVELS[2], unit: "华文三年级 · KSSR Semakan",   ageHint: "Year 3 · Age 9",  enabled: true },
      { ...STANDARD_LEVELS[3], unit: "华文四年级 · UASA 格式",      ageHint: "Year 4 · Age 10", enabled: true },
      { ...STANDARD_LEVELS[4], unit: "华文五年级 · UASA 格式",      ageHint: "Year 5 · Age 11", enabled: true },
      { ...STANDARD_LEVELS[5], unit: "华文六年级 · UASA 格式",      ageHint: "Year 6 · Age 12", enabled: true },
    ],
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
