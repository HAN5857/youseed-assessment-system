// Safe production synchronisation for the reviewed Mandarin S1–S6 banks.
//
// Guarantees:
//   • never deletes or updates Lead, Passkey, User, or historic Question rows
//   • aborts while any Mandarin attempt is IN_PROGRESS
//   • replaces only QuestionLink rows for Chinese standard-1 … standard-6
//   • preserves old Question rows so completed lead answer JSON remains readable
//   • skips a level whose linked bank already matches byte-for-byte
//   • runs in dry-run mode unless --apply is supplied

import { PrismaClient } from "@prisma/client";
import { Q, SCOPE_TEMPLATE_CN_LOWER, SCOPE_TEMPLATE_CN_UPPER, chineseStandard1Questions, chineseStandard2Questions } from "./banks-cn";
import { chineseStandard3Questions, chineseStandard4Questions, chineseStandard5Questions, chineseStandard6Questions } from "./banks-cn-s3-s6";
import type { QData } from "./banks-s4-s6";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const configs: Array<{ level: string; title: string; duration: number; scope: string; bank: () => QData[] }> = [
  { level: "standard-1", title: "华文一年级 · 程度评估测试", duration: 20, scope: SCOPE_TEMPLATE_CN_LOWER("一年级", "华小华文 KSSR Semakan"), bank: chineseStandard1Questions },
  { level: "standard-2", title: "华文二年级 · 程度评估测试", duration: 25, scope: SCOPE_TEMPLATE_CN_LOWER("二年级", "华小华文 KSSR Semakan"), bank: chineseStandard2Questions },
  { level: "standard-3", title: "华文三年级 · 程度评估测试", duration: 25, scope: SCOPE_TEMPLATE_CN_LOWER("三年级", "华小华文 KSSR Semakan"), bank: chineseStandard3Questions },
  { level: "standard-4", title: "华文四年级 · 程度评估测试", duration: 30, scope: SCOPE_TEMPLATE_CN_UPPER("四年级", "华小华文 KSSR Semakan · MPT4 融合"), bank: chineseStandard4Questions },
  { level: "standard-5", title: "华文五年级 · 程度评估测试", duration: 30, scope: SCOPE_TEMPLATE_CN_UPPER("五年级", "华小华文 KSSR Semakan · UASA 格式"), bank: chineseStandard5Questions },
  { level: "standard-6", title: "华文六年级 · 程度评估测试", duration: 35, scope: SCOPE_TEMPLATE_CN_UPPER("六年级", "华小华文 KSSR Semakan · UASA 格式"), bank: chineseStandard6Questions },
];

function comparable(question: { type: string; dimension: string; level: number; score: number; prompt: string; mediaUrl: string | null; content: string; answer: string; explanation: string | null }) {
  const { type, dimension, level, score, prompt, mediaUrl, content, answer, explanation } = question;
  return JSON.stringify({ type, dimension, level, score, prompt, mediaUrl, content, answer, explanation });
}

async function protectedSnapshot() {
  const [leads, passkeys, englishTests] = await Promise.all([
    prisma.lead.findMany({ select: { id: true, testId: true, status: true, submittedAt: true }, orderBy: { id: "asc" } }),
    prisma.passkey.findMany({ select: { id: true, code: true, testId: true, tutorId: true, usedCount: true, active: true }, orderBy: { id: "asc" } }),
    prisma.test.findMany({
      where: { subject: "english" },
      select: { id: true, level: true, title: true, _count: { select: { questions: true, leads: true, passkeys: true } } },
      orderBy: { level: "asc" },
    }),
  ]);
  return JSON.stringify({ leads, passkeys, englishTests });
}

async function main() {
  console.log(`Mandarin feedback sync · ${APPLY ? "APPLY" : "DRY RUN"}\n`);
  const before = await protectedSnapshot();
  const tests = await prisma.test.findMany({
    where: { subject: "chinese", level: { in: configs.map((config) => config.level) } },
    include: { questions: { include: { question: true }, orderBy: { order: "asc" } }, _count: { select: { leads: true, passkeys: true } } },
  });

  if (tests.length !== configs.length) throw new Error(`Expected ${configs.length} Mandarin tests; found ${tests.length}. No changes made.`);
  const activeAttempts = await prisma.lead.findMany({
    where: { testId: { in: tests.map((test) => test.id) }, status: "IN_PROGRESS" },
    select: { id: true, testId: true, startedAt: true },
  });
  if (activeAttempts.length > 0) throw new Error(`${activeAttempts.length} Mandarin attempt(s) are IN_PROGRESS. No changes made.`);

  const work = configs.map((config) => {
    const test = tests.find((item) => item.level === config.level)!;
    const expected = config.bank().map((question) => Q(question));
    const current = test.questions.map((link) => comparable(link.question));
    const matches = current.length === expected.length && current.every((row, index) => row === comparable(expected[index]));
    console.log(`${config.level}: ${test.questions.length} → ${expected.length} cards · leads=${test._count.leads} · passkeys=${test._count.passkeys}${matches ? " · already current" : ""}`);
    return { config, test, expected, matches };
  });

  if (!APPLY) {
    console.log("\nDry run complete. Re-run with --apply to synchronise the reviewed banks.");
    return;
  }

  await prisma.$transaction(async (tx) => {
    for (const { config, test, expected, matches } of work) {
      await tx.test.update({
        where: { id: test.id },
        data: { title: config.title, duration: config.duration, passingScore: 60, scope: config.scope, active: true },
      });
      if (matches) continue;
      await tx.questionLink.deleteMany({ where: { testId: test.id } });
      for (const [index, question] of expected.entries()) {
        const created = await tx.question.create({ data: question });
        await tx.questionLink.create({ data: { testId: test.id, questionId: created.id, order: index + 1 } });
      }
    }
  }, { timeout: 60_000 });

  const after = await protectedSnapshot();
  if (before !== after) throw new Error("Protected leads, passkeys, or English tests changed unexpectedly.");

  for (const { config, test, expected } of work) {
    const count = await prisma.questionLink.count({ where: { testId: test.id } });
    if (count !== expected.length) throw new Error(`${config.level}: expected ${expected.length} linked cards after sync; found ${count}.`);
  }
  console.log("\n✓ Mandarin S1–S6 banks synchronised. Historic questions, all leads, all passkeys, and every English test are unchanged.");
}

main()
  .catch((error) => { console.error(`\n✗ ${error instanceof Error ? error.message : String(error)}`); process.exit(1); })
  .finally(async () => prisma.$disconnect());
