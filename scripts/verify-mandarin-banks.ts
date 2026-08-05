import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { chineseStandard1Questions, chineseStandard2Questions } from "../prisma/banks-cn";
import {
  chineseStandard3Questions,
  chineseStandard4Questions,
  chineseStandard5Questions,
  chineseStandard6Questions,
} from "../prisma/banks-cn-s3-s6";
import { countWordsSmart } from "../src/lib/cjk";
import type { QData } from "../prisma/banks-s4-s6";

const banks: Record<string, QData[]> = {
  "standard-1": chineseStandard1Questions(),
  "standard-2": chineseStandard2Questions(),
  "standard-3": chineseStandard3Questions(),
  "standard-4": chineseStandard4Questions(),
  "standard-5": chineseStandard5Questions(),
  "standard-6": chineseStandard6Questions(),
};

function assertAsset(path: unknown, context: string) {
  if (typeof path !== "string" || !path.startsWith("/questions/")) return;
  assert.ok(existsSync(join(process.cwd(), "public", path.replace(/^\/+/, ""))), `${context}: missing asset ${path}`);
}

function verifyQuestion(question: QData, context: string) {
  assert.ok(question.prompt.trim().length > 0, `${context}: empty prompt`);
  assert.ok((question.score ?? 0) > 0, `${context}: invalid score`);
  assertAsset(question.mediaUrl, context);
  assertAsset(question.content?.imageUrl, context);
  assertAsset(question.content?.passageImage, context);

  if (question.dimension === "READING") {
    assert.ok(question.content?.passage, `${context}: reading question has no passage`);
    assert.ok(question.content?.passageImage, `${context}: reading comprehension has no relevant visual`);
    assert.ok(question.content?.passageImageAlt, `${context}: reading visual has no accessible description`);
  }

  if (question.type === "SINGLE") {
    const keys = (question.content?.options ?? []).map((option: { key: string }) => option.key);
    assert.ok(keys.includes(question.answer?.key), `${context}: SINGLE answer key is not an option`);
  }

  if (question.type === "READING") {
    const subs = question.content?.subs ?? [];
    const keys = question.answer?.keys ?? [];
    assert.equal(keys.length, subs.length, `${context}: READING answer/sub-question count mismatch`);
    subs.forEach((sub: { options?: Array<{ key: string }> }, index: number) => {
      assert.ok((sub.options ?? []).some((option) => option.key === keys[index]), `${context}: invalid sub-answer ${index + 1}`);
      assertAsset((sub as { image?: string }).image, `${context} sub ${index + 1}`);
    });
  }

  if (question.type === "SHORT") {
    assert.equal(question.content?.lang, "zh", `${context}: Mandarin writing must opt into Chinese character counting`);
    assert.ok(question.content.minWords > 0 && question.content.maxWords >= question.content.minWords, `${context}: invalid character target`);
    if (question.content?.passage) {
      assert.ok(question.content?.passageImage, `${context}: passage-based open response has no visual`);
      assert.ok(question.content?.passageImageAlt, `${context}: passage visual has no accessible description`);
    }
    const topicKeys = (question.content?.writingChoices ?? []).map((choice: { key: string }) => choice.key);
    assert.equal(new Set(topicKeys).size, topicKeys.length, `${context}: duplicate writing topic keys`);
  }
}

assert.equal(countWordsSmart("我喜欢学习华文。"), 7, "Chinese punctuation must not count as a 字");
assert.equal(countWordsSmart("华文 Chinese class"), 4, "Mixed Chinese/English count must remain stable");
assert.equal(countWordsSmart("，。！？"), 0, "Punctuation-only input must count as zero");

for (const [level, questions] of Object.entries(banks)) {
  assert.ok(questions.length >= 15, `${level}: bank is unexpectedly small (${questions.length})`);
  questions.forEach((question, index) => verifyQuestion(question, `${level} card ${index + 1}`));
  const marks = questions.reduce((sum, question) => sum + (question.score ?? 0), 0);
  console.log(`✓ ${level}: ${questions.length} interactive cards · ${marks} marks`);
}

console.log("✓ Mandarin character counting, answer mappings, reading visuals and assets verified across Standards 1–6.");
