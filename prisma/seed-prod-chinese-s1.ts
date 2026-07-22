// ─────────────────────────────────────────────────────────────────────────
// Non-destructive Chinese Standard 1 (华文一年级) production seed.
//
// Adds ONE new test + questions + demo passkey. Never touches anything
// else on the prod DB — no user data, no other subjects, no other levels.
//
// Idempotency:
//   • If the test doesn't exist: create it, insert the bank, mint passkey.
//   • If the test exists but has 0 questions: insert the bank.
//   • If the test exists WITH questions: refresh their content in place
//     (prompt / content / answer / mediaUrl / score) by matching QuestionLink.order → bank index.
//     Nothing is deleted, so any historic lead answers keep resolving to
//     the same Question row. Question count / order is never changed here.
//   • Passkey is always upserted by unique code.
//
// Safe to re-run any number of times.
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

  const built = chineseStandard1Questions();
  const totalMarks = built.reduce((s, q) => s + (q.score ?? 4), 0);
  const existingLinks = await prisma.questionLink.findMany({
    where: { testId: test.id },
    orderBy: { order: "asc" },
  });

  if (existingLinks.length === 0) {
    console.log(`[chinese/standard-1] inserting ${built.length} new questions (${totalMarks} marks)…`);
    const rows = await Promise.all(built.map((d) => prisma.question.create({ data: Q(d) })));
    await Promise.all(
      rows.map((q, i) =>
        prisma.questionLink.create({ data: { testId: test!.id, questionId: q.id, order: i + 1 } })
      )
    );
    console.log(`  inserted ${rows.length} questions`);
  } else {
    // Refresh content of existing rows in place; do not delete or reorder.
    console.log(`[chinese/standard-1] refreshing content of ${existingLinks.length} existing questions (bank has ${built.length}, ${totalMarks} marks)…`);
    let updated = 0;
    for (const link of existingLinks) {
      const d = built[link.order - 1];
      if (!d) continue;
      const payload = Q(d);
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
    console.log(`  refreshed ${updated} question rows in place`);
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
