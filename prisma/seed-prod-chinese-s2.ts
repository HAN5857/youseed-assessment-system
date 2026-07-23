// ─────────────────────────────────────────────────────────────────────────
// Non-destructive Chinese Standard 2 (华文二年级) production seed.
//
// Same idempotent shape as seed-prod-chinese-s1.ts:
//   • Test row doesn't exist   → create + insert 20 questions + upsert passkey.
//   • Test row exists, 0 links → insert questions + upsert passkey.
//   • Test row exists WITH links → refresh each question's content in place
//     (matched by QuestionLink.order → bank index). No deletes, so any
//     historic lead answers still resolve to the same Question row.
//
// Sanity-checks that S1 English/Chinese tests remain untouched.
//
// Run:
//   DATABASE_URL="…" npx tsx prisma/seed-prod-chinese-s2.ts
// ─────────────────────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";
import {
  Q, SCOPE_TEMPLATE_CN_LOWER, chineseStandard2Questions,
} from "./banks-cn";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Chinese Standard 2 prod seed starting…\n");

  const tutor = await prisma.user.findFirst({
    where: { role: "TUTOR", active: true },
    orderBy: { createdAt: "asc" },
  });
  if (!tutor) throw new Error("No active TUTOR user — needed to own the demo passkey.");

  const meta = {
    subject: "chinese",
    level: "standard-2",
    title: "华文二年级 · 程度评估测试",
    duration: 25,
    passingScore: 60,
    scope: SCOPE_TEMPLATE_CN_LOWER("二年级", "华小华文 KSSR Semakan"),
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
    console.log(`[chinese/standard-2] existing test updated (id=${test.id}) — metadata refreshed`);
  } else {
    test = await prisma.test.create({
      data: { ...meta, active: true },
    });
    created = true;
    console.log(`[chinese/standard-2] new test created (id=${test.id})`);
  }

  const built = chineseStandard2Questions();
  const totalMarks = built.reduce((s, q) => s + (q.score ?? 4), 0);
  const existingLinks = await prisma.questionLink.findMany({
    where: { testId: test.id },
    orderBy: { order: "asc" },
  });

  if (existingLinks.length === 0) {
    console.log(`[chinese/standard-2] inserting ${built.length} new questions (${totalMarks} marks)…`);
    const rows = await Promise.all(built.map((d) => prisma.question.create({ data: Q(d) })));
    await Promise.all(
      rows.map((q, i) =>
        prisma.questionLink.create({ data: { testId: test!.id, questionId: q.id, order: i + 1 } })
      )
    );
    console.log(`  inserted ${rows.length} questions`);
  } else {
    console.log(`[chinese/standard-2] refreshing content of ${existingLinks.length} existing questions (bank has ${built.length}, ${totalMarks} marks)…`);
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
    where: { code: "CHI-S2-DEMO" },
    create: {
      code: "CHI-S2-DEMO",
      testId: test.id,
      tutorId: tutor.id,
      maxUses: 99,
      note: "Demo passkey — 华文二年级 (Chinese Standard 2)",
    },
    update: { active: true, maxUses: 99, testId: test.id, tutorId: tutor.id },
  });
  console.log(`Passkey CHI-S2-DEMO → test ${test.id} (passkey id=${pk.id})\n`);

  // Sanity — English tests + Chinese S1 unchanged.
  const englishTests = await prisma.test.findMany({
    where: { subject: "english" },
    select: { level: true, _count: { select: { questions: true, leads: true } } },
    orderBy: { level: "asc" },
  });
  const cn1 = await prisma.test.findFirst({
    where: { subject: "chinese", level: "standard-1" },
    select: { _count: { select: { questions: true, leads: true } } },
  });
  console.log("Sanity check (English tests + Chinese S1, should be untouched):");
  for (const t of englishTests) {
    console.log(`  english/${t.level}: questions=${t._count.questions}  leads=${t._count.leads}`);
  }
  if (cn1) console.log(`  chinese/standard-1: questions=${cn1._count.questions}  leads=${cn1._count.leads}`);
  console.log(`\n✅ done. Chinese Standard 2 is ${created ? "LIVE" : "UPDATED"} on prod.`);
}

main()
  .catch((e) => { console.error("\n❌ Failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
