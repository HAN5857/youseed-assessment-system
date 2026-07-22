// ─────────────────────────────────────────────────────────────────────────
// One-off, non-destructive prod patch: fills in mediaUrl for three legacy
// English questions that referenced pictures in their prompt but had no
// image set on the Question row. Never re-creates rows, never touches
// answers or leads — only writes `mediaUrl` on the exact 3 rows matched
// by their unique prompt text.
//
// Run:
//   DATABASE_URL="…" npx tsx prisma/patch-prod-missing-images.ts
//
// Idempotent: re-running is a no-op (updateMany against already-set rows
// still writes the same string, no schema change, no cascade).
// ─────────────────────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// prompt substring → the mediaUrl that should be attached. Substring must
// be unique across all Question rows on prod.
const PATCHES: Array<{ needle: string; mediaUrl: string; label: string }> = [
  { needle: "Look at the picture of a frog",
    mediaUrl: "/questions/standard-1/frog.svg",
    label: "English S1 Q10 · frog" },
  { needle: "Look at the picture of a sweater",
    mediaUrl: "/questions/standard-2/sweater.svg",
    label: "English S2 Q10 · sweater" },
  { needle: "Look at the picture of a coat",
    mediaUrl: "/questions/standard-3/coat.svg",
    label: "English S3 Q7 · coat" },
];

async function main() {
  console.log("Patching mediaUrl on 3 legacy English questions…\n");
  let touched = 0;
  for (const p of PATCHES) {
    const rows = await prisma.question.findMany({
      where: { prompt: { contains: p.needle } },
      select: { id: true, prompt: true, mediaUrl: true },
    });
    if (rows.length === 0) {
      console.log(`  ⚠ ${p.label}: no row matched needle "${p.needle}" — skipping.`);
      continue;
    }
    if (rows.length > 1) {
      console.log(`  ⚠ ${p.label}: ${rows.length} rows matched — writing to all of them.`);
    }
    for (const row of rows) {
      if (row.mediaUrl === p.mediaUrl) {
        console.log(`  ✓ ${p.label} (${row.id.slice(-6)}): already set — skipped.`);
        continue;
      }
      await prisma.question.update({
        where: { id: row.id },
        data: { mediaUrl: p.mediaUrl },
      });
      console.log(`  ✎ ${p.label} (${row.id.slice(-6)}): mediaUrl → ${p.mediaUrl}`);
      touched++;
    }
  }
  console.log(`\n✅ done. ${touched} row(s) updated.`);
}

main()
  .catch((e) => { console.error("\n❌ Failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
