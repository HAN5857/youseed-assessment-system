// ─────────────────────────────────────────────────────────────────────────
// Non-destructive Chinese Standard 1 (华文一年级) production seed.
//
// Adds ONE new test + questions + demo passkey. Never touches anything
// else on the prod DB — no user data, no other subjects, no other levels.
//
// Idempotency:
//   • If the chinese/standard-1 test exists AND has ≥ 1 question, this
//     script only updates the test metadata and leaves questions alone.
//   • If it exists but has 0 questions, this script inserts the bank.
//   • If it doesn't exist, this script creates it and inserts the bank.
// Passkey is upserted by unique code, safe to re-run.
//
// Run: DATABASE_URL="…" npx tsx prisma/seed-prod-chinese-s1.ts
// ─────────────────────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";
import {
  Q, SCOPE_TEMPLATE_CN_LOWER, chineseStandard1Questions,
} from "./banks-cn";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Chinese Standard 1 prod seed starting…\n");

  const tutor = await prisma.user.findFirst({
    where: { role: "TUTOR", active: true },
    orderBy: { createdAt: "asc" },
  });
  if (!tutor) throw new Error("No active TUTOR user — needed to own the demo passkey.");

  const meta = {
    subject: "chinese",
    level: "standard-1",
    title: "华文一年级 · 程度评估测试",
    duration: 20,
    passingScore: 60,
    scope: SCOPE_TEMPLATE_CN_LOWER("一年级", "华小华文 KSSR Semakan"),
  } as const;

  let test = await prisma.test.findFirst({
    where: { subject: meta.subject, level: meta.level },
  });
  let created = false;

  if (test) {
    test = await prisma.test.update({
      where: { id: test.id },
      data: { ...meta, active: true },
    });
    console.log(`[chinese/standard-1] existing test updated (id=${test.id}) — metadata refreshed`);
  } else {
    test = await prisma.test.create({
      data: { ...meta, active: true },
    });
    created = true;
    console.log(`[chinese/standard-1] new test created (id=${test.id})`);
  }

  const existingLinkCount = await prisma.questionLink.count({ where: { testId: test.id } });
  if (existingLinkCount > 0) {
    console.log(`[chinese/standard-1] already has ${existingLinkCount} questions — skipping insert (idempotent)`);
  } else {
    const built = chineseStandard1Questions();
    const totalMarks = built.reduce((s, q) => s + (q.score ?? 4), 0);
    console.log(`[chinese/standard-1] inserting ${built.length} new questions (${totalMarks} marks)…`);
    const rows = await Promise.all(built.map((d) => prisma.question.create({ data: Q(d) })));
    await Promise.all(
      rows.map((q, i) =>
        prisma.questionLink.create({ data: { testId: test!.id, questionId: q.id, order: i + 1 } })
      )
    );
    console.log(`  inserted ${rows.length} questions`);
  }

  // Demo passkey
  const pk = await prisma.passkey.upsert({
    where: { code: "CHI-S1-DEMO" },
    create: {
      code: "CHI-S1-DEMO",
      testId: test.id,
      tutorId: tutor.id,
      maxUses: 99,
      note: "Demo passkey — 华文一年级 (Chinese Standard 1)",
    },
    update: { active: true, maxUses: 99, testId: test.id, tutorId: tutor.id },
  });
  console.log(`Passkey CHI-S1-DEMO → test ${test.id} (passkey id=${pk.id})\n`);

  // Sanity check: sibling English tests untouched.
  const others = await prisma.test.findMany({
    where: { subject: "english" },
    select: { level: true, _count: { select: { questions: true, leads: true } } },
    orderBy: { level: "asc" },
  });
  console.log("Sanity check (English tests, should be untouched):");
  for (const t of others) {
    console.log(`  ${t.level}: questions=${t._count.questions}  leads=${t._count.leads}`);
  }
  console.log(`\n✅ done. Chinese Standard 1 is ${created ? "LIVE" : "UPDATED"} on prod.`);
}

main()
  .catch((e) => { console.error("\n❌ Failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
