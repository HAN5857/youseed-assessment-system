// ─────────────────────────────────────────────────────────────────────────
// Non-destructive Standards 4 / 5 / 6 production seed.
//
// What this script DOES touch:
//   • Test rows for english/standard-{4,5,6} — created if absent, otherwise
//     ONLY metadata (title/duration/passingScore/scope/active=true) updated.
//   • Question + QuestionLink rows for those tests — inserted ONLY when the
//     target test currently has zero linked questions (idempotent guard).
//   • Passkey rows ENG-S4/5/6-DEMO — upserted via unique code.
//
// What this script DOES NOT touch:
//   • Standards 1 / 2 / 3 tests, questions, or links — untouched.
//   • Existing question rows on any test — never deleted.
//   • Existing Lead rows or their `answers` JSON — never deleted or rewritten.
//   • Existing passkeys other than the three S4/5/6 DEMO codes.
//
// Idempotency: safe to run multiple times. If a target test already has its
// 21 questions, the script logs "already seeded — skipping" and proceeds.
// Run via: DATABASE_URL=… npm run db:seed:prod:s4-s6
// ─────────────────────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";
import {
  Q,
  SCOPE_TEMPLATE_UPPER,
  standard4Questions,
  standard5Questions,
  standard6Questions,
  type QData,
} from "./banks-s4-s6";

const prisma = new PrismaClient();

type SeedOutcome = "created" | "updated-skipped" | "created-seeded" | "updated-seeded";

async function safeUpsertS4S6Test(opts: {
  subject: string;
  level: string;
  title: string;
  duration: number;
  passingScore: number;
  scope: string;
  questionsBuilder: () => QData[];
}): Promise<{ testId: string; outcome: SeedOutcome; questionCount: number; }> {
  const { subject, level, title, duration, passingScore, scope, questionsBuilder } = opts;

  let test = await prisma.test.findFirst({ where: { subject, level } });
  let wasCreated = false;

  if (test) {
    // Metadata-only update — no questions touched here.
    test = await prisma.test.update({
      where: { id: test.id },
      data: { title, duration, passingScore, scope, active: true },
    });
    console.log(`[${level}] test exists (id=${test.id}) — metadata updated, no questions touched`);
  } else {
    test = await prisma.test.create({
      data: { subject, level, title, duration, passingScore, scope, active: true },
    });
    wasCreated = true;
    console.log(`[${level}] test created (id=${test.id})`);
  }

  // Idempotency guard — only insert questions if NONE currently exist for this test.
  const existingLinkCount = await prisma.questionLink.count({ where: { testId: test.id } });
  if (existingLinkCount > 0) {
    console.log(`[${level}] already has ${existingLinkCount} questions — skipping insert (idempotent)`);
    return {
      testId: test.id,
      outcome: wasCreated ? "created" : "updated-skipped",
      questionCount: existingLinkCount,
    };
  }

  // Insert new questions
  const qs = questionsBuilder();
  const created = await Promise.all(qs.map((d) => prisma.question.create({ data: Q(d) })));
  await Promise.all(
    created.map((q, i) =>
      prisma.questionLink.create({ data: { testId: test!.id, questionId: q.id, order: i + 1 } })
    )
  );
  console.log(`[${level}] inserted ${created.length} new questions`);
  return {
    testId: test.id,
    outcome: wasCreated ? "created-seeded" : "updated-seeded",
    questionCount: created.length,
  };
}

async function main() {
  console.log("🌱 Non-destructive S4–S6 prod seed starting…\n");

  // Locate an existing tutor to own the demo passkeys.
  const tutor = await prisma.user.findFirst({
    where: { role: "TUTOR", active: true },
    orderBy: { createdAt: "asc" },
  });
  if (!tutor) {
    throw new Error(
      "No active TUTOR user found in production DB. Cannot create demo passkeys " +
      "without a tutor owner. Create a tutor first (e.g. via the admin UI) and re-run."
    );
  }
  console.log(`Using tutor: ${tutor.email} (id=${tutor.id})\n`);

  const s4 = await safeUpsertS4S6Test({
    subject: "english",
    level: "standard-4",
    title: "English Standard 4 — Placement Check",
    duration: 25,
    passingScore: 60,
    scope: SCOPE_TEMPLATE_UPPER("Year 4", "Get Smart Plus 4 · Module 1–10"),
    questionsBuilder: standard4Questions,
  });
  const s5 = await safeUpsertS4S6Test({
    subject: "english",
    level: "standard-5",
    title: "English Standard 5 — Placement Check",
    duration: 25,
    passingScore: 60,
    scope: SCOPE_TEMPLATE_UPPER("Year 5", "English Plus 1 · Starter Unit – Unit 8"),
    questionsBuilder: standard5Questions,
  });
  const s6 = await safeUpsertS4S6Test({
    subject: "english",
    level: "standard-6",
    title: "English Standard 6 — Placement Check",
    duration: 25,
    passingScore: 60,
    scope: SCOPE_TEMPLATE_UPPER("Year 6", "Academy Stars Year 6 · Welcome – Unit 10"),
    questionsBuilder: standard6Questions,
  });

  // Upsert the three demo passkeys (passkey.code is unique → safe).
  console.log("\nUpserting demo passkeys…");
  const passkeys = [
    { code: "ENG-S4-DEMO", testId: s4.testId, note: "Demo passkey — English Standard 4" },
    { code: "ENG-S5-DEMO", testId: s5.testId, note: "Demo passkey — English Standard 5" },
    { code: "ENG-S6-DEMO", testId: s6.testId, note: "Demo passkey — English Standard 6" },
  ];
  for (const pk of passkeys) {
    const result = await prisma.passkey.upsert({
      where: { code: pk.code },
      create: { code: pk.code, testId: pk.testId, tutorId: tutor.id, maxUses: 99, note: pk.note },
      update: { active: true, maxUses: 99, testId: pk.testId, tutorId: tutor.id },
    });
    console.log(`  ${pk.code} → test ${pk.testId} (passkey id=${result.id})`);
  }

  console.log("\n✅ Non-destructive S4–S6 seed complete.\n");
  console.log("Summary:");
  console.log(`  S4: ${s4.outcome.padEnd(16)} questions=${s4.questionCount}  testId=${s4.testId}`);
  console.log(`  S5: ${s5.outcome.padEnd(16)} questions=${s5.questionCount}  testId=${s5.testId}`);
  console.log(`  S6: ${s6.outcome.padEnd(16)} questions=${s6.questionCount}  testId=${s6.testId}`);
  console.log("");
  console.log("Verification queries:");
  console.log("  SELECT level, COUNT(*) FROM \"QuestionLink\" ql");
  console.log("    JOIN \"Test\" t ON t.id = ql.\"testId\"");
  console.log("    WHERE t.subject='english' AND t.level IN ('standard-4','standard-5','standard-6')");
  console.log("    GROUP BY level;");
  console.log("");
  console.log("  SELECT code, \"testId\", active FROM \"Passkey\" WHERE code LIKE 'ENG-S%-DEMO';");
}

main()
  .catch((e) => { console.error("\n❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
