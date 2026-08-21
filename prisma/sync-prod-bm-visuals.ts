// Non-destructive production synchronisation for reviewed BM S1-S6 visuals.
//
// Guarantees:
//   - updates only Question.content on already-linked Bahasa Melayu cards
//   - refuses to run if any prompt, answer, score, type, order, or audio differs
//   - never deletes or creates questions, links, leads, passkeys, tests, or users
//   - refuses to update a Question shared with another test
//   - runs in dry-run mode unless --apply is supplied

import { createHash } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import {
  bahasaMelayuStandard1Questions,
  bahasaMelayuStandard2Questions,
  bahasaMelayuStandard3Questions,
  Q,
} from "./banks-bm";
import {
  bahasaMelayuStandard4Questions,
  bahasaMelayuStandard5Questions,
  bahasaMelayuStandard6Questions,
} from "./banks-bm-s4-6";
import type { QData } from "./banks-s4-s6";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const VISUAL_KEYS = new Set(["imageUrl", "imageAlt", "passageImage", "passageImageAlt"]);

const configs: Array<{ level: string; bank: () => QData[] }> = [
  { level: "standard-1", bank: bahasaMelayuStandard1Questions },
  { level: "standard-2", bank: bahasaMelayuStandard2Questions },
  { level: "standard-3", bank: bahasaMelayuStandard3Questions },
  { level: "standard-4", bank: bahasaMelayuStandard4Questions },
  { level: "standard-5", bank: bahasaMelayuStandard5Questions },
  { level: "standard-6", bank: bahasaMelayuStandard6Questions },
];

function stripVisuals(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripVisuals);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([key]) => !VISUAL_KEYS.has(key))
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, child]) => [key, stripVisuals(child)]),
    );
  }
  return value;
}

function parseJson(value: string, label: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    throw new Error(`${label} contains invalid JSON. No changes made.`);
  }
}

function immutableSignature(question: {
  type: string;
  dimension: string;
  level: number;
  score: number;
  prompt: string;
  mediaUrl: string | null;
  content: string;
  answer: string;
  explanation: string | null;
}) {
  return JSON.stringify({
    type: question.type,
    dimension: question.dimension,
    level: question.level,
    score: question.score,
    prompt: question.prompt,
    mediaUrl: question.mediaUrl,
    content: stripVisuals(parseJson(question.content, "Question.content")),
    answer: stripVisuals(parseJson(question.answer, "Question.answer")),
    explanation: question.explanation,
  });
}

function digest(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

async function protectedSnapshot() {
  const [leads, passkeys, users, tests, links] = await Promise.all([
    prisma.lead.findMany({ orderBy: { id: "asc" } }),
    prisma.passkey.findMany({ orderBy: { id: "asc" } }),
    prisma.user.findMany({ orderBy: { id: "asc" } }),
    prisma.test.findMany({ orderBy: { id: "asc" } }),
    prisma.questionLink.findMany({ orderBy: [{ testId: "asc" }, { order: "asc" }] }),
  ]);
  return digest({ leads, passkeys, users, tests, links });
}

async function main() {
  console.log(`Bahasa Melayu visual sync · ${APPLY ? "APPLY" : "DRY RUN"}\n`);
  const before = await protectedSnapshot();
  const tests = await prisma.test.findMany({
    where: { subject: "bahasa-melayu", level: { in: configs.map(({ level }) => level) } },
    include: {
      questions: { include: { question: true }, orderBy: { order: "asc" } },
    },
  });

  if (tests.length !== configs.length) {
    throw new Error(`Expected ${configs.length} Bahasa Melayu tests; found ${tests.length}. No changes made.`);
  }

  const work = configs.flatMap(({ level, bank }) => {
    const test = tests.find((item) => item.level === level)!;
    const expected = bank().map(Q);
    if (test.questions.length !== expected.length) {
      throw new Error(`${level}: expected ${expected.length} linked cards; found ${test.questions.length}. No changes made.`);
    }

    return test.questions.map((link, index) => {
      const expectedQuestion = expected[index];
      if (link.order !== index + 1) {
        throw new Error(`${level} card ${index + 1}: unexpected order ${link.order}. No changes made.`);
      }
      if (immutableSignature(link.question) !== immutableSignature(expectedQuestion)) {
        throw new Error(`${level} card ${index + 1}: source content or answer differs from the reviewed bank. No changes made.`);
      }
      return {
        level,
        card: index + 1,
        questionId: link.questionId,
        currentContent: link.question.content,
        expectedContent: expectedQuestion.content,
      };
    });
  });

  const targetIds = work.map(({ questionId }) => questionId);
  const shared = await prisma.questionLink.groupBy({
    by: ["questionId"],
    where: { questionId: { in: targetIds } },
    _count: { questionId: true },
    having: { questionId: { _count: { gt: 1 } } },
  });
  if (shared.length) {
    throw new Error(`${shared.length} target question(s) are shared by multiple tests. No changes made.`);
  }

  const changed = work.filter(({ currentContent, expectedContent }) => currentContent !== expectedContent);
  for (const { level } of configs) {
    const levelCards = work.filter((item) => item.level === level);
    const levelChanges = changed.filter((item) => item.level === level);
    console.log(`${level}: ${levelChanges.length}/${levelCards.length} visual payloads need synchronisation`);
  }

  if (!APPLY) {
    console.log(`\nDry run complete. ${changed.length} card(s) would be updated. Re-run with --apply to synchronise visuals.`);
    return;
  }

  await prisma.$transaction(async (tx) => {
    for (const { questionId, expectedContent } of changed) {
      await tx.question.update({
        where: { id: questionId },
        data: { content: expectedContent },
      });
    }
  }, { timeout: 60_000 });

  const after = await protectedSnapshot();
  if (before !== after) {
    throw new Error("Protected leads, passkeys, users, tests, or question links changed unexpectedly.");
  }

  const verified = await prisma.question.findMany({
    where: { id: { in: targetIds } },
    select: { id: true, content: true },
  });
  const contentById = new Map(verified.map(({ id, content }) => [id, content]));
  for (const item of work) {
    if (contentById.get(item.questionId) !== item.expectedContent) {
      throw new Error(`${item.level} card ${item.card}: visual payload verification failed.`);
    }
  }

  console.log(`\n✓ ${changed.length} BM visual payload(s) synchronised. Questions, answers, scores, order, audio, leads, passkeys, tests, and users are unchanged.`);
}

main()
  .catch((error) => {
    console.error(`\n✗ ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
