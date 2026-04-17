// CEFR-style level mapping. Configurable later per Test.
export type LevelBand = { code: string; label: string; min: number; description: string };

export const DEFAULT_BANDS: LevelBand[] = [
  { code: "C2", label: "Mastery",            min: 95, description: "Near-native command. Can handle any complex topic effortlessly." },
  { code: "C1", label: "Advanced",           min: 85, description: "Fluent, spontaneous use. Ready for university-level material." },
  { code: "B2", label: "Upper-Intermediate", min: 75, description: "Confident in most everyday and academic situations." },
  { code: "B1", label: "Intermediate",       min: 60, description: "Can handle familiar topics; building accuracy and range." },
  { code: "A2", label: "Elementary",         min: 45, description: "Basic exchanges, simple sentences, common vocabulary." },
  { code: "A1", label: "Beginner",           min: 25, description: "First steps — short phrases and very common words." },
  { code: "Pre-A1", label: "Foundation",     min: 0,  description: "Just starting out — building blocks ahead." },
];

export function getLevel(percentage: number, bands: LevelBand[] = DEFAULT_BANDS): LevelBand {
  for (const b of bands) if (percentage >= b.min) return b;
  return bands[bands.length - 1];
}
