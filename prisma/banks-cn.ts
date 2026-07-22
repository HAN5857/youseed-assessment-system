// Question banks for Chinese (华文) Standards 1–6 — extracted from
// user-supplied "华文测试" DOCX files following the KSSR Semakan syllabus
// and (for S4-6) UASA exam format.
//
// Rendering pipeline: reuses the existing English renderers (SINGLE,
// MATCHING, FILL, READING, SHORT, ORDERING). The CJK font stack is
// set globally in layout.tsx via next/font Noto Sans SC.
//
// Pure data + JSON helpers — no Prisma client, no side effects on import.

import type { QData } from "./banks-s4-s6";
export type { QData } from "./banks-s4-s6";
export { Q } from "./banks-s4-s6";

export const SCOPE_TEMPLATE_CN_LOWER = (year: string, gakan: string) => [
  `${year}华文程度评估 · KSSR Semakan`,
  "  • 甲组  字词与拼音  (~50%)",
  "  • 乙组  句子与语法  (~25–30%)",
  "  • 丙组  阅读与写话  (~20–25%)",
  "",
  `课本参考：${gakan}`,
  "共 20 题左右，居家测试约 15–20 分钟。请让孩子独立完成，做错也没关系。",
].join("\n");

export const SCOPE_TEMPLATE_CN_UPPER = (year: string, gakan: string) => [
  `${year}华文程度评估 · KSSR Semakan · UASA 格式`,
  "  • 甲组  语文基础知识  (30%)",
  "  • 乙组  阅读理解      (30%)",
  "  • 丙组  作文          (40%)",
  "",
  `课本参考：${gakan}`,
  "总分 50 分，居家测试约 20–25 分钟。做错也没关系 — 目的是了解程度，不是考试。",
].join("\n");

// ──────────────────────────────────────────────────────────────────────────
// Standard 1 · 一年级 KSSR Semakan · 20 questions · lower-band structure
// Source: Mandarin/一年级华文测试/一年级_华文_程度评估测试.docx
// ──────────────────────────────────────────────────────────────────────────
export function chineseStandard1Questions(): QData[] {
  return [
    // ─── 甲组 字词与拼音 (Q1–10) ───────────────────────────────────

    // Q1 · 看图选词 — 苹果
    { type: "SINGLE", dimension: "VOCAB", score: 1,
      prompt: "看图，圈出正确的词语。\n\n这是什么？",
      mediaUrl: "/questions/chinese-standard-1/q01-apple.jpg",
      content: { options: [
        { key: "A", text: "苹果" }, { key: "B", text: "香蕉" },
        { key: "C", text: "西瓜" }, { key: "D", text: "草莓" },
      ], topicLabel: "字词" },
      answer: { key: "A" } },

    // Q2 · 看图选词 — 医生
    { type: "SINGLE", dimension: "VOCAB", score: 1,
      prompt: "看图，圈出正确的词语。\n\n这是谁？",
      mediaUrl: "/questions/chinese-standard-1/q02-doctor.jpg",
      content: { options: [
        { key: "A", text: "爸爸" }, { key: "B", text: "老师" },
        { key: "C", text: "医生" }, { key: "D", text: "警察" },
      ], topicLabel: "职业" },
      answer: { key: "C" } },

    // Q3 · 听音频选词 — 唱歌 (TTS speakText)
    { type: "SINGLE", dimension: "PHONICS", score: 1,
      prompt: "听一听，小朋友正在做什么？",
      content: {
        speakText: "唱歌", lang: "zh-CN", maxPlays: 3,
        imageUrl: "/questions/chinese-standard-1/q03-audio-action.jpg",
        options: [
          { key: "A", text: "跑步" }, { key: "B", text: "游泳" },
          { key: "C", text: "画画" }, { key: "D", text: "唱歌" },
        ],
        topicLabel: "听音辨词",
      },
      answer: { key: "D" } },

    // Q4 · 听音频选词 — 老虎
    { type: "SINGLE", dimension: "PHONICS", score: 1,
      prompt: "听一听，这是什么动物？",
      content: {
        speakText: "老虎", lang: "zh-CN", maxPlays: 3,
        imageUrl: "/questions/chinese-standard-1/q04-audio-animal.jpg",
        options: [
          { key: "A", text: "老虎" }, { key: "B", text: "狮子" },
          { key: "C", text: "大象" }, { key: "D", text: "长颈鹿" },
        ],
        topicLabel: "动物",
      },
      answer: { key: "A" } },

    // Q5-8 · 词语配对 (combined into one MATCHING card, 4 marks)
    // 快乐→心里很高兴 (B) · 干净→没有脏 (D) · 勤劳→很用功 (C) · 热闹→很多人 (A)
    { type: "MATCHING", dimension: "VOCAB", score: 4,
      prompt: "把左边的词语和右边的意思配对。",
      content: {
        left: [
          { text: "快乐" }, { text: "干净" }, { text: "勤劳" }, { text: "热闹" },
        ],
        right: [
          "心里很高兴",             // B → 快乐 (index 0 in left maps to index 0 in right after re-order below)
          "没有脏，整整齐齐",        // D → 干净
          "很用功，不偷懒",          // C → 勤劳
          "很多人，很有生气",        // A → 热闹
        ],
      },
      // Left indices → right indices:
      // 快乐(0)→心里很高兴(0) · 干净(1)→没有脏(1) · 勤劳(2)→很用功(2) · 热闹(3)→很多人(3)
      answer: { pairs: { "0": 0, "1": 1, "2": 2, "3": 3 } } },

    // Q9 · 拼音选择 — 3 sub-questions (mā ma / shū / huā)
    { type: "READING", dimension: "PHONICS", score: 3,
      prompt: "看图，选出与图片对应的正确拼音。",
      content: {
        passage: "根据下面每个词的图片，圈出正确的拼音。",
        subs: [
          { stem: "「妈妈」的拼音是？", icon: "👩", options: [
            { key: "A", text: "mā ma" }, { key: "B", text: "nā na" },
          ]},
          { stem: "「书本」的拼音是？", icon: "📖", options: [
            { key: "A", text: "sū" }, { key: "B", text: "shū" },
          ]},
          { stem: "「花朵」的拼音是？", icon: "🌸", options: [
            { key: "A", text: "huā" }, { key: "B", text: "hā" },
          ]},
        ],
      },
      answer: { keys: ["A", "B", "A"] } },

    // Q10 · 笔画数 — 3 sub-questions (门4 / 校10 / 草9)
    { type: "READING", dimension: "PHONICS", score: 3,
      prompt: "根据词汇，找出正确的笔画数。",
      content: {
        passage: "选出下面每个字的正确笔画数。",
        subs: [
          { stem: "「门」有几画？", icon: "🚪", options: [
            { key: "A", text: "3 画" }, { key: "B", text: "4 画" },
          ]},
          { stem: "「校」有几画？", icon: "🏫", options: [
            { key: "A", text: "9 画" }, { key: "B", text: "10 画" },
          ]},
          { stem: "「草」有几画？", icon: "🌱", options: [
            { key: "A", text: "8 画" }, { key: "B", text: "9 画" },
          ]},
        ],
      },
      answer: { keys: ["B", "B", "B"] } },

    // ─── 乙组 句子与语法 (Q11–17) ──────────────────────────────────

    // Q11 · 弟弟(是/有)一本故事书 → 有
    { type: "SINGLE", dimension: "GRAMMAR", score: 1,
      prompt: "圈出括号里正确的词语。\n\n弟弟（________）一本故事书。",
      mediaUrl: "/questions/chinese-standard-1/q11-brother-book.jpg",
      content: { options: [{ key: "A", text: "是" }, { key: "B", text: "有" }], topicLabel: "语法" },
      answer: { key: "B" } },

    // Q12 · 妈妈(在/有)厨房里煮饭 → 在
    { type: "SINGLE", dimension: "GRAMMAR", score: 1,
      prompt: "圈出括号里正确的词语。\n\n妈妈（________）厨房里煮饭。",
      mediaUrl: "/questions/chinese-standard-1/q12-mother-cook.jpg",
      content: { options: [{ key: "A", text: "在" }, { key: "B", text: "有" }], topicLabel: "方位" },
      answer: { key: "A" } },

    // Q13 · 我的狗(他/她/它) → 它
    { type: "SINGLE", dimension: "GRAMMAR", score: 1,
      prompt: "圈出括号里正确的词语。\n\n这是我的狗，（________）叫小白。",
      mediaUrl: "/questions/chinese-standard-1/q13-dog.jpg",
      content: { options: [
        { key: "A", text: "他" }, { key: "B", text: "她" }, { key: "C", text: "它" },
      ], topicLabel: "代词" },
      answer: { key: "C" } },

    // Q14 · 我用眼睛(看/听/闻)书 → 看
    { type: "SINGLE", dimension: "GRAMMAR", score: 1,
      prompt: "圈出括号里正确的词语。\n\n我用眼睛（________）书。",
      mediaUrl: "/questions/chinese-standard-1/q14-read.jpg",
      content: { options: [
        { key: "A", text: "看" }, { key: "B", text: "听" }, { key: "C", text: "闻" },
      ], topicLabel: "动词" },
      answer: { key: "A" } },

    // Q15 · 小鸟在树(上/下/里) → 上
    { type: "SINGLE", dimension: "GRAMMAR", score: 1,
      prompt: "圈出括号里正确的词语。\n\n小鸟在树（________）飞。",
      mediaUrl: "/questions/chinese-standard-1/q15-bird-tree.jpg",
      content: { options: [
        { key: "A", text: "上" }, { key: "B", text: "下" }, { key: "C", text: "里" },
      ], topicLabel: "方位" },
      answer: { key: "A" } },

    // Q16 · 句子排序 — "喜欢 我 画画 很" → "我 很 喜欢 画画"
    { type: "ORDERING", dimension: "GRAMMAR", score: 2,
      prompt: "把下面的词语排成一句正确的句子。",
      content: { items: ["喜欢", "我", "画画", "很"] },
      // Correct order: 我(1) 很(3) 喜欢(0) 画画(2)
      answer: { order: [1, 3, 0, 2] },
      explanation: "正确句子：我很喜欢画画。" },

    // Q17 · 照样子写句子 — 我喜欢吃___,因为___
    { type: "SHORT", dimension: "WRITING", score: 2,
      prompt: "照着例句的格式，写出你自己的句子。\n\n例句：我喜欢吃香蕉，因为它又甜又好吃。\n\n请写：我喜欢吃 __________，因为 __________。",
      content: {
        minWords: 4,
        maxWords: 30,
        template: "我喜欢吃 __________，因为 __________。",
        imageUrl: "/questions/chinese-standard-1/q17-food.jpg",
        lang: "zh",
      },
      answer: { rubric: "结构：我喜欢吃 X，因为 Y。 · X 是食物 · Y 是原因（好吃 / 甜 / 有营养 等）。" } },

    // ─── 丙组 阅读与写话 (Q18–20) ──────────────────────────────────

    // 短文 "我的家" — used by both Q18 and Q19
    // Q18 · 小雨的家有几个人？ → 四个人 (B)
    { type: "SINGLE", dimension: "READING", score: 2,
      prompt: "阅读下面的短文，然后回答问题。\n\n小雨的家有几个人？",
      content: {
        passage:
          "我的家\n\n我叫小雨。我家有四个人：爸爸、妈妈、哥哥和我。\n爸爸是老师。妈妈喜欢做饭。哥哥喜欢打球。\n我喜欢画画。我很爱我的家！",
        options: [
          { key: "A", text: "三个人" }, { key: "B", text: "四个人" },
          { key: "C", text: "五个人" }, { key: "D", text: "六个人" },
        ],
      },
      answer: { key: "B" } },

    // Q19 · 爸爸的职业 → 老师 (C)
    { type: "SINGLE", dimension: "READING", score: 2,
      prompt: "阅读下面的短文，然后回答问题。\n\n爸爸的职业是什么？",
      content: {
        passage:
          "我的家\n\n我叫小雨。我家有四个人：爸爸、妈妈、哥哥和我。\n爸爸是老师。妈妈喜欢做饭。哥哥喜欢打球。\n我喜欢画画。我很爱我的家！",
        options: [
          { key: "A", text: "医生" }, { key: "B", text: "警察" },
          { key: "C", text: "老师" }, { key: "D", text: "厨师" },
        ],
      },
      answer: { key: "C" } },

    // Q20 · 看图写话 — 公园
    { type: "SHORT", dimension: "WRITING", score: 2,
      prompt: "看图，用下面的句式写 1–2 句话。\n\n句式参考：\n  • 图里有 __________。\n  • 他们在 __________。",
      content: {
        minWords: 6,
        maxWords: 40,
        imageUrl: "/questions/chinese-standard-1/q20-park.jpg",
        template: "图里有 __________ 和 __________。他们在 __________。",
        lang: "zh",
      },
      answer: { rubric: "至少 1 句：图里有小朋友 / 花 / 树 / 秋千等。至少 1 句描述动作：他们在玩耍 / 滑滑梯 / 荡秋千。" } },
  ];
}
