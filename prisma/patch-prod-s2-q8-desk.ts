// ─────────────────────────────────────────────────────────────────────────
// One-off, non-destructive prod patch: rewrites English Standard 2 Q8
// from "sock" (TTS) to "desk" (pre-recorded MP3).
//
// Matches by unique prompt substring — no id lookup, no deletes.
// Idempotent: re-running finds the new prompt and no-ops.
//
// Run:
//   DATABASE_URL="…" npx tsx prisma/patch-prod-s2-q8-desk.ts
// ─────────────────────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const NEW_PROMPT =
  "🎧 Click the button to listen. Then fill in the missing letter:\n\nd _ sk";
const NEW_CONTENT = {
  audioUrl: "/audio/standard-2/desk.mp3",
  speakText: "desk",
  caseSensitive: false,
  maxPlays: 3,
  lang: "en-US",
};
const NEW_ANSWER = { accepted: ["e", "desk"] };

async function main() {
  console.log("Patching English S2 Q8 (sock → desk)…\n");

  // Find by the old, unique prompt substring.
  const rows = await prisma.question.findMany({
    where: { prompt: { contains: "s _ ck" } },
    select: { id: true, prompt: true },
  });

  if (rows.length === 0) {
    // Already patched? Look for the new prompt.
    const already = await prisma.question.findMany({
      where: { prompt: { contains: "d _ sk" } },
      select: { id: true },
    });
    if (already.length > 0) {
      console.log(`✓ Already patched: ${already.length} row(s) contain "d _ sk". No-op.`);
      return;
    }
    console.log("⚠ No row matched \"s _ ck\" needle — skipping. Nothing to patch.");
    return;
  }

  console.log(`Found ${rows.length} row(s) matching "s _ ck":`);
  for (const r of rows) {
    console.log(`  ${r.id.slice(-8)} : ${r.prompt.replace(/\n/g, " ⏎ ")}`);
    // Question.content + Question.answer are String columns holding JSON —
    // stringify before writing (matches how prisma/banks-s4-s6.ts::Q() does it).
    await prisma.question.update({
      where: { id: r.id },
      data: {
        prompt: NEW_PROMPT,
        content: JSON.stringify(NEW_CONTENT),
        answer: JSON.stringify(NEW_ANSWER),
      },
    });
    console.log(`  ✎ patched ${r.id.slice(-8)} → d _ sk (desk, MP3)`);
  }

  console.log(`\n✅ done. ${rows.length} row(s) updated.`);
}

main()
  .catch((e) => { console.error("\n❌ Failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
