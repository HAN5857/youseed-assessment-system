// ─────────────────────────────────────────────────────────────────────────
// S4 rebuild — replaces standard-4 question bank with the LATEST DOCX.
//
// Safety rails:
//   • Aborts if any Lead is IN_PROGRESS on S4 (their submit endpoint would
//     score against a moving target). Pass --force to auto-mark stale
//     IN_PROGRESS as ABANDONED before rebuilding.
//   • OLD Question rows are PRESERVED (only their QuestionLink to this test
//     is deleted). Past COMPLETED leads still resolve their questionIds
//     from the Question table so the admin lead-detail view keeps working.
//   • Only touches Test / QuestionLink / new-Question rows for standard-4.
//   • Standards 1/2/3/5/6 untouched.
//   • Passkeys tied to S4 preserved (they reference Test.id).
//
// Run via:
//   DATABASE_URL="…" npx tsx prisma/rebuild-s4.ts             # dry-safe
//   DATABASE_URL="…" npx tsx prisma/rebuild-s4.ts --force     # auto-abandon stale IN_PROGRESS
// ─────────────────────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";
import { Q, SCOPE_TEMPLATE_UPPER, standard4Questions } from "./banks-s4-s6";

const prisma = new PrismaClient();
const FORCE = process.argv.includes("--force");

async function main() {
  console.log("🔧 S4 rebuild starting…\n");

  const test = await prisma.test.findFirst({
    where: { subject: "english", level: "standard-4" },
  });
  if (!test) {
    console.log("No standard-4 test found — nothing to rebuild. Run seed-prod-s4-s6 first.");
    return;
  }
  console.log(`Found test: ${test.title} (id=${test.id})`);

  // Check IN_PROGRESS leads — these are the dangerous ones.
  const inProg = await prisma.lead.findMany({
    where: { testId: test.id, status: "IN_PROGRESS" },
    select: { id: true, name: true, email: true, startedAt: true },
  });
  const completedCount = await prisma.lead.count({
    where: { testId: test.id, status: "COMPLETED" },
  });
  const otherCount = await prisma.lead.count({
    where: { testId: test.id, status: { notIn: ["IN_PROGRESS", "COMPLETED"] } },
  });

  console.log(`\nLead status on S4:`);
  console.log(`  IN_PROGRESS: ${inProg.length}  ${inProg.length > 0 ? "⚠️" : "✓"}`);
  console.log(`  COMPLETED:   ${completedCount}  (preserved; old Q rows kept as orphans so admin view stays intact)`);
  console.log(`  Other:       ${otherCount}`);

  if (inProg.length > 0) {
    if (!FORCE) {
      console.log(`\n⚠️  ABORT: ${inProg.length} IN_PROGRESS lead(s) — a rebuild mid-attempt would corrupt their submit.`);
      console.log(`    Pass --force to auto-mark them as ABANDONED before rebuilding.`);
      for (const l of inProg) {
        const ageDays = Math.floor((Date.now() - l.startedAt.getTime()) / (86400 * 1000));
        console.log(`      • ${l.name} (${l.email}) — started ${ageDays}d ago`);
      }
      process.exit(1);
    }
    console.log(`\n--force — marking ${inProg.length} stale IN_PROGRESS lead(s) as ABANDONED…`);
    await prisma.lead.updateMany({
      where: { id: { in: inProg.map((l) => l.id) } },
      data: { status: "ABANDONED" },
    });
    console.log(`  done.`);
  }

  // Update the Test row metadata (per the new DOCX)
  const built = standard4Questions();
  const totalMarks = built.reduce((s, q) => s + (q.score ?? 4), 0);
  console.log(`\nNew bank: ${built.length} questions, total ${totalMarks} marks.`);

  const updatedTest = await prisma.test.update({
    where: { id: test.id },
    data: {
      title: "English Standard 4 — Placement Check",
      duration: 30,
      passingScore: 60,
      scope: SCOPE_TEMPLATE_UPPER("Year 4", "Get Smart Plus 4 · Module 1–10 (updated syllabus)"),
      active: true,
    },
  });
  console.log(`Test metadata updated (title="${updatedTest.title}", duration=${updatedTest.duration}min)`);

  // Delete only the QuestionLink rows — preserve the old Question rows as
  // orphans so past COMPLETED leads' answer JSON still resolves prompts +
  // correct answers in the admin lead-detail view.
  const existingLinks = await prisma.questionLink.count({ where: { testId: test.id } });
  console.log(`\nUnlinking ${existingLinks} old QuestionLink row(s) (old Question rows preserved as orphans)…`);
  await prisma.questionLink.deleteMany({ where: { testId: test.id } });

  // Insert new questions
  console.log(`Inserting ${built.length} new questions…`);
  const created = await Promise.all(built.map((d) => prisma.question.create({ data: Q(d) })));
  await Promise.all(
    created.map((q, i) =>
      prisma.questionLink.create({ data: { testId: test.id, questionId: q.id, order: i + 1 } })
    )
  );

  const finalCount = await prisma.questionLink.count({ where: { testId: test.id } });
  console.log(`\n✅ S4 rebuild complete. Question links on prod: ${finalCount}`);

  // Also verify sibling tests untouched
  const other = await prisma.test.findMany({
    where: { subject: "english", level: { in: ["standard-1","standard-2","standard-3","standard-5","standard-6"] } },
    include: { _count: { select: { questions: true, leads: true } } },
  });
  console.log("\nSanity check (siblings should be untouched):");
  for (const t of other) {
    console.log(`  ${t.level}: questions=${t._count.questions}  leads=${t._count.leads}`);
  }
}

main()
  .catch((e) => { console.error("\n❌ Rebuild failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
