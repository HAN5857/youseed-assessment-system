// ─────────────────────────────────────────────────────────────────────────
// Non-destructive content refresh for Mandarin Standards 3–6.
//
// Updates each existing Question's prompt / content / answer / mediaUrl /
// dimension / score IN PLACE, matched by QuestionLink.order → bank index.
// Nothing is deleted or re-created, so historic Lead answer JSON keeps
// resolving to the same Question rows. Question count + order never change.
//
// Use this to push edits (e.g. newly-wired question images) to prod after
// the bank was already seeded.
//
// Run: DATABASE_URL="…" npx tsx prisma/refresh-prod-chinese-s3-s6-content.ts
// ─────────────────────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";
import { Q } from "./banks-cn";
import {
  chineseStandard3Questions,
  chineseStandard4Questions,
  chineseStandard5Questions,
  chineseStandard6Questions,
} from "./banks-cn-s3-s6";
import type { QData } from "./banks-s4-s6";

const prisma = new PrismaClient();

const banks: Array<{ level: string; bank: () => QData[] }> = [
  { level: "standard-3", bank: chineseStandard3Questions },
  { level: "standard-4", bank: chineseStandard4Questions },
  { level: "standard-5", bank: chineseStandard5Questions },
  { level: "standard-6", bank: chineseStandard6Questions },
];

async function main() {
  console.log("🔄 Refreshing Mandarin S3–S6 question content in place…\n");
  const leadsBefore = await prisma.lead.count();

  for (const { level, bank } of banks) {
    const test = await prisma.test.findFirst({ where: { subject: "chinese", level } });
    if (!test) { console.log(`[${level}] no test — skipped.`); continue; }
    const links = await prisma.questionLink.findMany({ where: { testId: test.id }, orderBy: { order: "asc" } });
    const built = bank();
    if (links.length !== built.length) {
      console.log(`  ⚠ [${level}] link count ${links.length} ≠ bank ${built.length} — refreshing overlap only.`);
    }
    let updated = 0, withImg = 0;
    for (const link of links) {
      const d = built[link.order - 1];
      if (!d) continue;
      const payload = Q(d);
      if (payload.mediaUrl || /"image"|"imageUrl"|"passageImage"/.test(payload.content ?? "")) withImg++;
      await prisma.question.update({
        where: { id: link.questionId },
        data: {
          type: payload.type,
          prompt: payload.prompt,
          content: payload.content,
          answer: payload.answer,
          mediaUrl: payload.mediaUrl ?? null,
          dimension: payload.dimension,
          score: payload.score,
        },
      });
      updated++;
    }
    console.log(`[${level}] refreshed ${updated} questions (${withImg} carry an image)`);
  }

  const leadsAfter = await prisma.lead.count();
  if (leadsBefore !== leadsAfter) throw new Error(`Lead count changed! ${leadsBefore} → ${leadsAfter}`);
  console.log(`\n✅ done. Leads unchanged (${leadsAfter}).`);
}

main()
  .catch((e) => { console.error("\n❌ Failed:", e); process.exit(1); })
  .finally(async () => prisma.$disconnect());
