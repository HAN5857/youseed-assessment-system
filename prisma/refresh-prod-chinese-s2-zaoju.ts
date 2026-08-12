// ─────────────────────────────────────────────────────────────────────────
// Targeted, non-destructive prod refresh for the two Mandarin S2 看图造句
// questions (钓鱼 / 喜欢).
//
// Why: the 起笔小帮手 previously showed the full model sentence
// ("爷爷在河边钓鱼。" / "我喜欢吃西瓜。"), which handed the student the answer.
// The bank now shows guiding-question scaffolds instead (不给答案). This script
// pushes the new prompt / content / answer to the already-seeded prod rows.
//
// Matched by the stable "重点字：钓鱼" / "重点字：喜欢" substring (present in BOTH
// the old and new prompts) so it is independent of question order and touches
// nothing else. Leads / Answers are never modified; lead count is asserted
// unchanged before/after.
//
// Run (postgres client must be generated for the production schema first):
//   DATABASE_URL="postgresql://…" npx tsx prisma/refresh-prod-chinese-s2-zaoju.ts
// ─────────────────────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";
import { Q, chineseStandard2Questions } from "./banks-cn";

const prisma = new PrismaClient();

const TARGETS = ["重点字：钓鱼", "重点字：喜欢"];

async function main() {
  console.log("🔄 Refreshing Mandarin S2 看图造句 (钓鱼 / 喜欢) in place…\n");
  const leadsBefore = await prisma.lead.count();

  const test = await prisma.test.findFirst({ where: { subject: "chinese", level: "standard-2" } });
  if (!test) throw new Error("No chinese/standard-2 test found in this database.");

  const bank = chineseStandard2Questions();
  const links = await prisma.questionLink.findMany({
    where: { testId: test.id },
    include: { question: true },
    orderBy: { order: "asc" },
  });

  let updated = 0;
  for (const match of TARGETS) {
    const data = bank.find((q) => (q.prompt ?? "").includes(match));
    if (!data) throw new Error(`Bank is missing the 造句 item for "${match}".`);
    const link = links.find((l) => (l.question.prompt ?? "").includes(match));
    if (!link) { console.log(`  ⚠ prod question for "${match}" not found — skipped.`); continue; }

    const payload = Q(data);
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
    console.log(`  ✓ updated 造句 "${match}" → question ${link.questionId}`);
    updated++;
  }

  const leadsAfter = await prisma.lead.count();
  if (leadsBefore !== leadsAfter) throw new Error(`Lead count changed! ${leadsBefore} → ${leadsAfter}`);
  console.log(`\n✅ done. Updated ${updated} 造句 question(s). Leads unchanged (${leadsAfter}).`);
}

main()
  .catch((e) => { console.error("\n❌ Failed:", e); process.exit(1); })
  .finally(async () => prisma.$disconnect());
