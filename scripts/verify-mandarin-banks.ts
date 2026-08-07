import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { chineseStandard1Questions, chineseStandard2Questions } from "../prisma/banks-cn";
import {
  chineseStandard3Questions,
  chineseStandard4Questions,
  chineseStandard5Questions,
  chineseStandard6Questions,
} from "../prisma/banks-cn-s3-s6";
import { countWordsSmart } from "../src/lib/cjk";
import { shortPlugin } from "../src/lib/question-types/plugins/short";
import type { QData } from "../prisma/banks-s4-s6";

const banks: Record<string, QData[]> = {
  "standard-1": chineseStandard1Questions(),
  "standard-2": chineseStandard2Questions(),
  "standard-3": chineseStandard3Questions(),
  "standard-4": chineseStandard4Questions(),
  "standard-5": chineseStandard5Questions(),
  "standard-6": chineseStandard6Questions(),
};

const expectedCardCounts: Record<string, number> = {
  "standard-1": 21,
  "standard-2": 19,
  "standard-3": 21,
  "standard-4": 15,
  "standard-5": 15,
  "standard-6": 15,
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
    assert.notEqual(Boolean(question.content?.countOnly), Boolean(question.content?.minimumOnly), `${context}: writing must use exactly one source length mode`);
  }

  assert.equal(question.content?.topicLabel, undefined, `${context}: per-question subtitle must not be stored`);
  assert.equal(question.content?.topicIcon, undefined, `${context}: per-question subtitle icon must not be stored`);
}

assert.equal(countWordsSmart("我喜欢学习华文。"), 7, "Chinese punctuation must not count as a 字");
assert.equal(countWordsSmart("华文 Chinese class"), 4, "Mixed Chinese/English count must remain stable");
assert.equal(countWordsSmart("，。！？"), 0, "Punctuation-only input must count as zero");
assert.deepEqual(shortPlugin.score({}, { text: "华" }, 10, { minWords: 1, maxWords: 1000, countOnly: true }), { score: 7, correct: true, detail: { words: 1, status: "submitted" } }, "count-only writing must accept any non-empty source response without an invented target");
assert.deepEqual(shortPlugin.score({}, { text: "华文" }, 10, { minWords: 3, maxWords: 1000, minimumOnly: true }), { score: 3, correct: false, detail: { words: 2, status: "under" } }, "minimum-only writing must still enforce the source minimum");
assert.deepEqual(shortPlugin.score({}, { text: "华文好" }, 10, { minWords: 3, maxWords: 1000, minimumOnly: true }), { score: 7, correct: true, detail: { words: 3, status: "on-target" } }, "minimum-only writing must accept text at the source minimum");

for (const [level, questions] of Object.entries(banks)) {
  assert.equal(questions.length, expectedCardCounts[level], `${level}: interactive card count changed from the source-approved mapping`);
  questions.forEach((question, index) => verifyQuestion(question, `${level} card ${index + 1}`));
  const marks = questions.reduce((sum, question) => sum + (question.score ?? 0), 0);
  console.log(`✓ ${level}: ${questions.length} interactive cards · ${marks} marks`);
}

const bannedQuestionLabels = [
  "数据侦探", "人物侦探", "数码侦探", "YouSeed 开放思考", "Youseed 开放思考",
  "合作故事工坊", "主题创作舱", "毕业创作室", "阅读能量地图", "成长启示 ·",
  "修辞实验室", "句式转换站", "词语温度计", "部首寻亲", "句子诊所：", "YouSeed 延伸思考",
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
assert.ok(banks["standard-1"].filter((q) => q.mediaUrl?.startsWith("/audio/")).every((q) => !q.content?.speakText), "S1 official MP3 questions must not retain generated speech fallback");
assert.ok(banks["standard-2"].filter((q) => q.mediaUrl?.startsWith("/audio/")).every((q) => !q.content?.speakText), "S2 official MP3 questions must not retain generated speech fallback");
assert.equal(banks["standard-2"].filter((q) => q.content?.afterHint).length, 3, "S2 shape-similar character hints must appear below the answer choices");
assert.ok(!banks["standard-2"].some((q) => q.type === "FILL" && q.prompt.includes("合作")), "S2 must not include the extra bonus pinyin question");
assert.equal(banks["standard-3"].filter((q) => q.type === "SHORT" && q.dimension === "GRAMMAR").length, 0, "S3 sentence transformations must use direct answer cards");
assert.ok(banks["standard-3"].some((q) => q.content?.subs?.some((sub: { highlightText?: string }) => sub.highlightText === "着")), "S3 着 must be visually highlighted");

const s1BookPinyin = banks["standard-1"].find((q) => q.prompt.includes("「书本」的拼音"));
assert.equal(s1BookPinyin?.answer?.key, "B", "S1 source answer: 书本 = shū");
const s1DoorStroke = banks["standard-1"].find((q) => q.prompt.includes("「门」有几画"));
assert.equal(s1DoorStroke?.answer?.key, "A", "S1 source answer: 门 has 3 strokes");
const s1Matching = banks["standard-1"].find((q) => q.type === "MATCHING");
assert.deepEqual(s1Matching?.content?.right, ["很多人，很有生气", "心里很高兴", "很用功，不偷懒", "没有脏，整整齐齐"], "S1 matching choices must retain source A–D order");
assert.deepEqual(s1Matching?.answer?.pairs, { "0": 1, "1": 3, "2": 2, "3": 0 }, "S1 matching key must equal source B/D/C/A");

const s2Rewrite = banks["standard-2"].find((q) => q.prompt.includes("小明把糖果分享给同学"));
assert.deepEqual(s2Rewrite?.content?.options?.map((o: { text: string }) => o.text), ["小明把糖果分享给同学。", "小明把糖果分享给谁了？"], "S2 rewrite choices may only use the source original and source answer");
assert.ok(banks["standard-2"].some((q) => q.content?.template === "爷爷在河边钓鱼。"), "S2 fishing response must use the source answer");
assert.ok(banks["standard-2"].some((q) => q.content?.template === "我喜欢吃西瓜。"), "S2 watermelon response must use the source answer");
const s2Stars = banks["standard-2"].find((q) => q.content?.passage === "天上的星星一（　）一（　）的。");
assert.deepEqual(s2Stars?.content?.subs?.map((sub: { options: Array<{ text: string }> }) => sub.options.map((o) => o.text)), [["闪", "亮"], ["闪", "亮"]], "S2 star question must expose only the two source choices for each blank");
assert.deepEqual(s2Stars?.answer?.keys, ["A", "A"], "S2 source answer must remain 一闪一闪");

const s3Transformations = banks["standard-3"].filter((q) => q.type === "SINGLE" && /感叹句|「把」字/.test(q.prompt));
assert.deepEqual(s3Transformations.map((q) => q.content.options.map((o: { text: string }) => o.text)), [
  ["这朵花真美丽。", "这朵花真美丽啊！"],
  ["我做完了功课。", "我把功课做完了。"],
], "S3 direct-choice transformations may only use source originals and source answers");
const s3Reading = banks["standard-3"].find((q) => q.dimension === "READING" && q.type === "READING");
assert.deepEqual(s3Reading?.content?.subs?.[2]?.options?.map((o: { text: string }) => o.text), ["食物越大越好吃", "要懂得欣赏大自然", "做事要不怕困难，坚持到底", "应该多在公园里玩耍"], "S3 Q23 options must match the Word bank exactly");
assert.equal(s3Reading?.content?.subs?.[5]?.stem, "判断：小明决定以后做事也要像蚂蚁一样坚持到底。", "S3 Q24 third statement must not be shortened");

const s4Table = banks["standard-4"].find((q) => q.content?.passageTable)?.content?.passageTable;
assert.deepEqual(s4Table?.columns, ["兴趣班名称", "主要内容", "核心能力培养", "适合对象", "上课时间"], "S4 club information must use the source table structure");
assert.ok(banks["standard-4"].some((q) => q.prompt.includes("吓得我们连忙躲到一旁")), "S4 Q5 source sentence is incomplete");
assert.ok(banks["standard-4"].some((q) => q.content?.passage?.includes("特地带了一包妈妈亲手做的曲奇饼")), "S4 umbrella passage must remain complete");
assert.ok(banks["standard-4"].some((q) => q.content?.subs?.some((sub: { options?: Array<{ text: string }> }) => sub.options?.some((option) => option.text === "三个兴趣班都一样"))), "S4 Q13 option D must retain its full source wording");
assert.ok(banks["standard-4"].some((q) => q.answer?.rubric?.includes("朋友之间应该在对方需要时伸出援手")), "S4 Q18 source reference answer must remain complete");
assert.ok(banks["standard-4"].some((q) => q.prompt.includes("字数不少于40字") && q.answer?.rubric?.includes("让我们的心情更加轻松愉快")), "S4 Q19 prompt and reference answer must remain complete");

assert.ok(banks["standard-5"].some((q) => q.prompt.includes("河底的妖怪") && q.prompt.includes("统统吃掉")), "S5 Q4 source context is incomplete");
assert.equal(banks["standard-5"].filter((q) => q.type === "SINGLE" && /修改病句|反问句/.test(q.prompt)).length, 2, "S5 Q8–Q9 must use direct answer cards");
assert.ok(banks["standard-5"].some((q) => q.content?.subs?.some((sub: { highlightText?: string }) => sub.highlightText === "缝") && q.content?.subs?.some((sub: { highlightText?: string }) => sub.highlightText === "数")), "S5 multi-pronunciation characters must be highlighted");
assert.ok(banks["standard-5"].some((q) => q.prompt.includes("给人们带来什么不良的后果")), "S5 Q14 must include 人们");
assert.ok(banks["standard-5"].flatMap((q) => q.content?.writingChoices ?? []).every((choice: { genre?: string }) => Boolean(choice.genre)), "S5 writing choices must display their genres");
const s5DirectChoices = banks["standard-5"].filter((q) => q.type === "SINGLE" && /修改病句|反问句/.test(q.prompt));
assert.ok(s5DirectChoices.every((q) => q.content.options.length === 2), "S5 Q8–Q9 must not contain invented distractors");
assert.ok(banks["standard-5"].some((q) => q.answer?.rubric?.includes("忘了做功课、荒废学业")), "S5 Q14 source reference answer must remain complete");
assert.ok(banks["standard-5"].some((q) => q.answer?.rubric?.includes("确认是真的才转发出去")), "S5 Q15 source reference answer must remain complete");
assert.equal(banks["standard-5"].at(-1)?.content?.countOnly, true, "S5 composition must count characters without inventing a length requirement");

assert.ok(banks["standard-6"].some((q) => q.content?.passage?.includes("在阳光下展开了稚嫩的叶片")), "S6 reading passage must remain complete");
assert.ok(banks["standard-6"].some((q) => q.prompt.startsWith("读了这篇短文")), "S6 Q15 must retain its source wording");
assert.ok(banks["standard-6"].flatMap((q) => q.content?.writingChoices ?? []).every((choice: { genre?: string }) => Boolean(choice.genre)), "S6 writing choices must display their genres");
const s6Rewrite = banks["standard-6"].find((q) => q.prompt.includes("保持原意"));
assert.deepEqual(s6Rewrite?.answer?.keys, ["B", "B"], "S6 Q8 source rewrites must both be the second source-only choice");
const s6Idioms = banks["standard-6"].find((q) => q.prompt.includes("成语"));
assert.deepEqual(s6Idioms?.content?.subs?.slice(1).map((sub: { options: Array<{ text: string }> }) => sub.options.map((o) => o.text)), [["孜孜", "恋恋"], ["孜孜", "恋恋"]], "S6 Q9 fixed expressions must use the source choices");
assert.ok(banks["standard-6"].some((q) => q.answer?.rubric?.includes("黄灿灿的花朵随风摇曳，充满生机与希望")), "S6 Q14 source reference answer must remain complete");
assert.ok(banks["standard-6"].some((q) => q.answer?.rubric?.includes("创造出属于自己的美好未来")), "S6 Q15 source reference answer must remain complete");
assert.equal(banks["standard-6"].at(-1)?.content?.minimumOnly, true, "S6 composition must enforce only the source minimum of 150 characters");

const officialAudioHashes: Record<string, string> = {
  "public/audio/chinese-standard-1/sing.mp3": "F69A015E75EEB55EEAB628898F10F9A6B94CD19A5D70E8B220578C8DB7D262DF",
  "public/audio/chinese-standard-1/tiger.mp3": "FB0E0623287AFDB2A05CA05120F9F4EDEA8AA4B49D289A6BE44B09360F407EE9",
  "public/audio/chinese-standard-2/doctor.mp3": "A8D4EA109FAEAEBCCD0D38AA4607F3147203010534ACD8A9E9B555BE2AD8B7D8",
  "public/audio/chinese-standard-2/swimming.mp3": "3FEA5776536EA18A4DE1DF07578959D6B6782B5462638FB73DAF0FAE85FA7AE1",
};
for (const [file, expectedHash] of Object.entries(officialAudioHashes)) {
  const actualHash = createHash("sha256").update(readFileSync(join(process.cwd(), file))).digest("hex").toUpperCase();
  assert.equal(actualHash, expectedHash, `${file}: audio differs from the teacher-supplied OneDrive clip`);
}

console.log("✓ Mandarin source wording, interaction formats, subtitles, character counting, reading visuals and assets verified across Standards 1–6.");
console.log("✓ Teacher-supplied Mandarin MP3 hashes verified exactly.");
