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
  if (typeof path !== "string" || (!path.startsWith("/questions/") && !path.startsWith("/audio/"))) return;
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

const bannedQuestionLabels = [
  "数据侦探", "人物侦探", "数码侦探", "YouSeed 开放思考", "Youseed 开放思考",
  "合作故事工坊", "主题创作舱", "毕业创作室", "阅读能量地图", "成长启示 ·",
  "修辞实验室", "句式转换站", "词语温度计", "部首寻亲", "句子诊所：",
];
for (const [level, questions] of Object.entries(banks)) {
  for (const [index, question] of questions.entries()) {
    for (const label of bannedQuestionLabels) {
      assert.ok(!question.prompt.includes(label), `${level} card ${index + 1}: obsolete question subtitle "${label}" returned`);
    }
  }
}

assert.equal(banks["standard-1"].length, 21, "S1 grouped pinyin/stroke tasks must render one item per page");
assert.equal(banks["standard-1"].filter((q) => q.mediaUrl?.startsWith("/audio/chinese-standard-1/")).length, 2, "S1 listening must use stable audio files");
assert.equal(banks["standard-2"].filter((q) => q.mediaUrl?.startsWith("/audio/chinese-standard-2/")).length, 2, "S2 listening must use stable audio files");
assert.equal(banks["standard-2"].filter((q) => q.content?.afterHint).length, 3, "S2 shape-similar character hints must appear below the answer choices");
assert.ok(!banks["standard-2"].some((q) => q.type === "FILL" && q.prompt.includes("合作")), "S2 must not include the extra bonus pinyin question");
assert.equal(banks["standard-3"].filter((q) => q.type === "SHORT" && q.dimension === "GRAMMAR").length, 0, "S3 sentence transformations must use direct answer cards");
assert.ok(banks["standard-3"].some((q) => q.content?.subs?.some((sub: { highlightText?: string }) => sub.highlightText === "着")), "S3 着 must be visually highlighted");

const s4Table = banks["standard-4"].find((q) => q.content?.passageTable)?.content?.passageTable;
assert.deepEqual(s4Table?.columns, ["兴趣班名称", "主要内容", "核心能力培养", "适合对象", "上课时间"], "S4 club information must use the source table structure");
assert.ok(banks["standard-4"].some((q) => q.prompt.includes("吓得我们连忙躲到一旁")), "S4 Q5 source sentence is incomplete");
assert.ok(banks["standard-4"].some((q) => q.content?.passage?.includes("特地带了一包妈妈亲手做的曲奇饼")), "S4 umbrella passage must remain complete");

assert.ok(banks["standard-5"].some((q) => q.prompt.includes("河底的妖怪") && q.prompt.includes("统统吃掉")), "S5 Q4 source context is incomplete");
assert.equal(banks["standard-5"].filter((q) => q.type === "SINGLE" && /修改病句|反问句/.test(q.prompt)).length, 2, "S5 Q8–Q9 must use direct answer cards");
assert.ok(banks["standard-5"].some((q) => q.content?.subs?.some((sub: { highlightText?: string }) => sub.highlightText === "缝") && q.content?.subs?.some((sub: { highlightText?: string }) => sub.highlightText === "数")), "S5 multi-pronunciation characters must be highlighted");
assert.ok(banks["standard-5"].some((q) => q.prompt.includes("给人们带来什么不良的后果")), "S5 Q14 must include 人们");
assert.ok(banks["standard-5"].flatMap((q) => q.content?.writingChoices ?? []).every((choice: { genre?: string }) => Boolean(choice.genre)), "S5 writing choices must display their genres");

assert.ok(banks["standard-6"].some((q) => q.content?.passage?.includes("在阳光下展开了稚嫩的叶片")), "S6 reading passage must remain complete");
assert.ok(banks["standard-6"].some((q) => q.prompt.startsWith("读了这篇短文")), "S6 Q15 must retain its source wording");
assert.ok(banks["standard-6"].flatMap((q) => q.content?.writingChoices ?? []).every((choice: { genre?: string }) => Boolean(choice.genre)), "S6 writing choices must display their genres");

console.log("✓ Mandarin source wording, interaction formats, subtitles, character counting, reading visuals and assets verified across Standards 1–6.");
