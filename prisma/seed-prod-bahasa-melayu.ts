// ─────────────────────────────────────────────────────────────────────────
// Non-destructive production seed for Bahasa Melayu, Standards 1–6.
//
// Safety guarantees (mirrors seed-prod-chinese-s3-s6.ts):
//   • never deletes or updates a Lead, User, existing Question or Answer JSON
//   • inserts questions only when a target test has zero linked questions
//   • refuses to replace a non-empty/partial bank
//   • upserts only the six BM-S{n}-DEMO passkeys
//   • verifies English + Chinese counts unchanged before/after
//
// Run: DATABASE_URL="postgres…" npx tsx prisma/seed-prod-bahasa-melayu.ts
// ─────────────────────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";
import {
  Q, type QData,
  SCOPE_TEMPLATE_BM_LOWER, SCOPE_TEMPLATE_BM_UPPER,
  bahasaMelayuStandard1Questions,
  bahasaMelayuStandard2Questions,
  bahasaMelayuStandard3Questions,
} from "./banks-bm";
import {
  bahasaMelayuStandard4Questions,
  bahasaMelayuStandard5Questions,
  bahasaMelayuStandard6Questions,
} from "./banks-bm-s4-6";

const prisma = new PrismaClient();

const configs: Array<{ level: string; title: string; duration: number; scope: string; passkey: string; bank: () => QData[] }> = [
  { level: "standard-1", title: "Bahasa Melayu Tahun 1 · Penilaian Penguasaan", duration: 15, scope: SCOPE_TEMPLATE_BM_LOWER("Tahun 1", "BM KSSR Semakan · SJKC"), passkey: "BM-S1-DEMO", bank: bahasaMelayuStandard1Questions },
  { level: "standard-2", title: "Bahasa Melayu Tahun 2 · Penilaian Penguasaan", duration: 18, scope: SCOPE_TEMPLATE_BM_LOWER("Tahun 2", "BM KSSR Semakan · SJKC"), passkey: "BM-S2-DEMO", bank: bahasaMelayuStandard2Questions },
  { level: "standard-3", title: "Bahasa Melayu Tahun 3 · Penilaian Penguasaan", duration: 20, scope: SCOPE_TEMPLATE_BM_LOWER("Tahun 3", "BM KSSR Semakan · SJKC"), passkey: "BM-S3-DEMO", bank: bahasaMelayuStandard3Questions },
  { level: "standard-4", title: "Bahasa Melayu Tahun 4 · Penilaian Penguasaan", duration: 25, scope: SCOPE_TEMPLATE_BM_UPPER("Tahun 4", "BM KSSR Semakan · Format UASA"), passkey: "BM-S4-DEMO", bank: bahasaMelayuStandard4Questions },
  { level: "standard-5", title: "Bahasa Melayu Tahun 5 · Penilaian Penguasaan", duration: 25, scope: SCOPE_TEMPLATE_BM_UPPER("Tahun 5", "BM KSSR Semakan · Format UASA"), passkey: "BM-S5-DEMO", bank: bahasaMelayuStandard5Questions },
  { level: "standard-6", title: "Bahasa Melayu Tahun 6 · Penilaian Penguasaan", duration: 25, scope: SCOPE_TEMPLATE_BM_UPPER("Tahun 6", "BM KSSR Semakan · Format UASA"), passkey: "BM-S6-DEMO", bank: bahasaMelayuStandard6Questions },
];

async function snapshotProtectedData() {
  const [leadCount, protectedTests] = await Promise.all([
    prisma.lead.count(),
    prisma.test.findMany({
      where: { OR: [{ subject: "english" }, { subject: "chinese" }] },
      select: { id: true, subject: true, level: true, _count: { select: { questions: true, leads: true } } },
      orderBy: [{ subject: "asc" }, { level: "asc" }],
    }),
  ]);
  return {
    leadCount,
    tests: protectedTests.map((t) => ({ id: t.id, subject: t.subject, level: t.level, questions: t._count.questions, leads: t._count.leads })),
  };
}

async function main() {
  console.log("🌱 Non-destructive Bahasa Melayu S1–S6 production seed\n");
  const before = await snapshotProtectedData();

  const tutor = await prisma.user.findFirst({ where: { role: { in: ["TUTOR", "ADMIN", "SUPERADMIN"] }, active: true }, orderBy: { createdAt: "asc" } });
  if (!tutor) throw new Error("No active ADMIN/TUTOR account is available to own demo passkeys.");

  for (const config of configs) {
    const bank = config.bank();
    const totalMarks = bank.reduce((sum, q) => sum + (q.score ?? 4), 0);
    let test = await prisma.test.findFirst({ where: { subject: "bahasa-melayu", level: config.level } });

    if (!test) {
      test = await prisma.test.create({
        data: { subject: "bahasa-melayu", level: config.level, title: config.title, duration: config.duration, passingScore: 60, scope: config.scope, active: true },
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
          await tx.questionLink.create({ data: { testId: test!.id, questionId: row.id, order: index + 1 } });
        }
      });
      console.log(`  inserted ${bank.length} soalan · ${totalMarks} markah`);
    } else if (linkedCount === bank.length) {
      console.log(`  bank already present (${linkedCount} soalan) · left untouched`);
    } else {
      throw new Error(`[${config.level}] has ${linkedCount} existing cards but the bank contains ${bank.length}. Refusing a partial overwrite.`);
    }

    await prisma.passkey.upsert({
      where: { code: config.passkey },
      create: { code: config.passkey, testId: test.id, tutorId: tutor.id, maxUses: 999, active: true, note: `Demo passkey — ${config.title}` },
      update: { testId: test.id, tutorId: tutor.id, maxUses: 999, active: true, note: `Demo passkey — ${config.title}` },
    });
    console.log(`  passkey ${config.passkey} ready`);
  }

  const after = await snapshotProtectedData();
  if (JSON.stringify(before) !== JSON.stringify(after)) {
    throw new Error(`Protected data changed unexpectedly.\nBefore: ${JSON.stringify(before)}\nAfter: ${JSON.stringify(after)}`);
  }
  console.log(`\nProtected records verified unchanged: ${after.leadCount} leads; English + Chinese counts match.`);
  console.log("✅ Bahasa Melayu Standards 1–6 inserted safely.");
}

main().catch((e) => { console.error("\n❌ Seed failed:", e); process.exit(1); }).finally(async () => prisma.$disconnect());
