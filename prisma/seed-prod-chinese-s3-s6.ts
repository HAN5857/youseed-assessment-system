// Non-destructive production seed for Mandarin Standards 3–6.
//
// Safety guarantees:
//   • never deletes or updates a Lead, User, existing Question or Answer JSON
//   • inserts questions only when a target test has zero linked questions
//   • refuses to replace a non-empty/partial bank
//   • upserts only the four CHI-S3/S4/S5/S6-DEMO passkeys
//   • verifies English and Mandarin S1–S2 counts before/after

import { PrismaClient } from "@prisma/client";
import { Q, SCOPE_TEMPLATE_CN_LOWER, SCOPE_TEMPLATE_CN_UPPER } from "./banks-cn";
import {
  chineseStandard3Questions,
  chineseStandard4Questions,
  chineseStandard5Questions,
  chineseStandard6Questions,
} from "./banks-cn-s3-s6";
import type { QData } from "./banks-s4-s6";

const prisma = new PrismaClient();

const configs: Array<{
  level: string;
  title: string;
  duration: number;
  scope: string;
  passkey: string;
  bank: () => QData[];
}> = [
  { level: "standard-3", title: "华文三年级 · 程度评估测试", duration: 25, scope: SCOPE_TEMPLATE_CN_LOWER("三年级", "华小华文 KSSR Semakan"), passkey: "CHI-S3-DEMO", bank: chineseStandard3Questions },
  { level: "standard-4", title: "华文四年级 · 程度评估测试", duration: 30, scope: SCOPE_TEMPLATE_CN_UPPER("四年级", "华小华文 KSSR Semakan · MPT4 融合"), passkey: "CHI-S4-DEMO", bank: chineseStandard4Questions },
  { level: "standard-5", title: "华文五年级 · 程度评估测试", duration: 30, scope: SCOPE_TEMPLATE_CN_UPPER("五年级", "华小华文 KSSR Semakan · UASA 格式"), passkey: "CHI-S5-DEMO", bank: chineseStandard5Questions },
  { level: "standard-6", title: "华文六年级 · 程度评估测试", duration: 35, scope: SCOPE_TEMPLATE_CN_UPPER("六年级", "华小华文 KSSR Semakan · UASA 格式"), passkey: "CHI-S6-DEMO", bank: chineseStandard6Questions },
];

async function snapshotProtectedData() {
  const [leadCount, protectedTests] = await Promise.all([
    prisma.lead.count(),
    prisma.test.findMany({
      where: { OR: [{ subject: "english" }, { subject: "chinese", level: { in: ["standard-1", "standard-2"] } }] },
      select: { id: true, subject: true, level: true, _count: { select: { questions: true, leads: true } } },
      orderBy: [{ subject: "asc" }, { level: "asc" }],
    }),
  ]);
  return {
    leadCount,
    tests: protectedTests.map((test) => ({
      id: test.id,
      subject: test.subject,
      level: test.level,
      questions: test._count.questions,
      leads: test._count.leads,
    })),
  };
}

async function main() {
  console.log("🌱 Non-destructive Mandarin S3–S6 production seed\n");
  const before = await snapshotProtectedData();

  const tutor = await prisma.user.findFirst({
    where: { role: { in: ["TUTOR", "ADMIN"] }, active: true },
    orderBy: { createdAt: "asc" },
  });
  if (!tutor) throw new Error("No active ADMIN/TUTOR account is available to own demo passkeys.");

  for (const config of configs) {
    const bank = config.bank();
    const totalMarks = bank.reduce((sum, question) => sum + (question.score ?? 4), 0);
    let test = await prisma.test.findFirst({ where: { subject: "chinese", level: config.level } });

    if (!test) {
      test = await prisma.test.create({
        data: {
          subject: "chinese",
          level: config.level,
          title: config.title,
          duration: config.duration,
          passingScore: 60,
          scope: config.scope,
          active: true,
        },
      });
      console.log(`[${config.level}] created test ${test.id}`);
    } else {
      test = await prisma.test.update({
        where: { id: test.id },
        data: { title: config.title, duration: config.duration, passingScore: 60, scope: config.scope, active: true },
      });
      console.log(`[${config.level}] refreshed test metadata ${test.id}`);
    }

    const linkedCount = await prisma.questionLink.count({ where: { testId: test.id } });
    if (linkedCount === 0) {
      await prisma.$transaction(async (tx) => {
        for (const [index, question] of bank.entries()) {
          const row = await tx.question.create({ data: Q(question) });
          await tx.questionLink.create({
            data: { testId: test!.id, questionId: row.id, order: index + 1 },
          });
        }
      });
      console.log(`  inserted ${bank.length} interactive cards · ${totalMarks} marks`);
    } else if (linkedCount === bank.length) {
      console.log(`  bank already present (${linkedCount} cards) · left untouched`);
    } else {
      throw new Error(`[${config.level}] has ${linkedCount} existing cards but the bank contains ${bank.length}. Refusing a partial overwrite.`);
    }

    await prisma.passkey.upsert({
      where: { code: config.passkey },
      create: { code: config.passkey, testId: test.id, tutorId: tutor.id, maxUses: 99, active: true, note: `Demo passkey — ${config.title}` },
      update: { testId: test.id, tutorId: tutor.id, maxUses: 99, active: true, note: `Demo passkey — ${config.title}` },
    });
    console.log(`  passkey ${config.passkey} ready`);
  }

  const after = await snapshotProtectedData();
  if (JSON.stringify(before) !== JSON.stringify(after)) {
    throw new Error(`Protected data changed unexpectedly.\nBefore: ${JSON.stringify(before)}\nAfter: ${JSON.stringify(after)}`);
  }

  console.log(`\nProtected records verified unchanged: ${after.leadCount} leads; English and Mandarin S1–S2 question/lead counts match.`);
  console.log("✅ Mandarin Standards 3–6 inserted safely.");
}

main()
  .catch((error) => { console.error("\n❌ Seed failed:", error); process.exit(1); })
  .finally(async () => prisma.$disconnect());
