// ─────────────────────────────────────────────────────────────────────────
// Per-level themed sticker pools
// ─────────────────────────────────────────────────────────────────────────
//
// Used by:
//   - StickerExplosion (milestone burst)
//   - StickerAlbum (end-of-test reveal — Wave 3)
//   - Question-card corner decorations
//
// Each pool is intentionally on-theme so a kid recognises *which* level
// they're playing through. Pools are exactly 20 items so a full S1 run
// fills an album perfectly (one sticker per question).

const DEFAULT_POOL = [
  "⭐", "🌈", "🎈", "🎀", "🌟", "✨", "💫", "🎊", "🪄", "🍭", "🦄", "🏆",
];

export const STICKER_THEMES: Record<string, readonly string[]> = {
  // S1 — Word Forest theme: nature, gentle creatures, bright and simple
  "english:standard-1": [
    "🌱", "🌳", "🦋", "🐛", "🌻", "🍄", "🦔", "🦉", "🍯", "🍃",
    "🌸", "🌈", "🐞", "🐝", "🍀", "🌟", "🦊", "🪺", "🌷", "🐢",
  ],
  // S2-S6: keep on the default pool until each level's edu rollout
};

/** Get the themed pool for a subject+level pair, falling back to the default. */
export function getStickerPool(subject?: string | null, level?: string | null): readonly string[] {
  if (!subject || !level) return DEFAULT_POOL;
  return STICKER_THEMES[`${subject.toLowerCase()}:${level.toLowerCase()}`] ?? DEFAULT_POOL;
}

export { DEFAULT_POOL };
