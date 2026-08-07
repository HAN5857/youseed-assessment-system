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
      ] },
      answer: { key: "A" } },

    // Q2 · 看图选词 — 医生
    { type: "SINGLE", dimension: "VOCAB", score: 1,
      prompt: "看图，圈出正确的词语。\n\n这是谁？",
      mediaUrl: "/questions/chinese-standard-1/q02-doctor.jpg",
      content: { options: [
        { key: "A", text: "爸爸" }, { key: "B", text: "老师" },
        { key: "C", text: "医生" }, { key: "D", text: "警察" },
      ] },
      answer: { key: "C" } },

    // Q3 · 听官方音频选词 — 唱歌
    { type: "SINGLE", dimension: "PHONICS", score: 1,
      prompt: "听一听，小朋友正在做什么？",
      mediaUrl: "/audio/chinese-standard-1/sing.mp3",
      content: {
        lang: "zh-CN", maxPlays: 3,
        imageUrl: "/questions/chinese-standard-1/q03-audio-action.jpg",
        options: [
          { key: "A", text: "跑步" }, { key: "B", text: "游泳" },
          { key: "C", text: "画画" }, { key: "D", text: "唱歌" },
        ],
      },
      answer: { key: "D" } },

    // Q4 · 听音频选词 — 老虎
    { type: "SINGLE", dimension: "PHONICS", score: 1,
      prompt: "听一听，这是什么动物？",
      mediaUrl: "/audio/chinese-standard-1/tiger.mp3",
      content: {
        lang: "zh-CN", maxPlays: 3,
        imageUrl: "/questions/chinese-standard-1/q04-audio-animal.jpg",
        options: [
          { key: "A", text: "老虎" }, { key: "B", text: "狮子" },
          { key: "C", text: "大象" }, { key: "D", text: "长颈鹿" },
        ],
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
          "很多人，很有生气",        // A
          "心里很高兴",              // B
          "很用功，不偷懒",          // C
          "没有脏，整整齐齐",        // D
        ],
      },
      answer: { pairs: { "0": 1, "1": 3, "2": 2, "3": 0 } } },

    // Q9 · 拼音选择 — 每个词独立成页，降低一年级学生的视觉负担
    { type: "SINGLE", dimension: "PHONICS", score: 1,
      prompt: "看图，把正确的拼音圈起来。\n\n「妈妈」的拼音是？",
      mediaUrl: "/questions/chinese-standard-1/q09a-mother.jpg",
      content: { options: [{ key: "A", text: "mā ma" }, { key: "B", text: "nā na" }] },
      answer: { key: "A" } },
    { type: "SINGLE", dimension: "PHONICS", score: 1,
      prompt: "看图，把正确的拼音圈起来。\n\n「书本」的拼音是？",
      mediaUrl: "/questions/chinese-standard-1/q09b-book.jpg",
      content: { options: [{ key: "A", text: "sū" }, { key: "B", text: "shū" }] },
      answer: { key: "B" } },
    { type: "SINGLE", dimension: "PHONICS", score: 1,
      prompt: "看图，把正确的拼音圈起来。\n\n「花朵」的拼音是？",
      mediaUrl: "/questions/chinese-standard-1/q09c-flower.jpg",
      content: { options: [{ key: "A", text: "huā" }, { key: "B", text: "hā" }] },
      answer: { key: "A" } },

    // Q10 · 笔画数 — 每个汉字独立成页
    { type: "SINGLE", dimension: "PHONICS", score: 1,
      prompt: "圈出正确的笔画数。\n\n「门」有几画？",
      content: { options: [{ key: "A", text: "3 画" }, { key: "B", text: "4 画" }] },
      answer: { key: "A" } },
    { type: "SINGLE", dimension: "PHONICS", score: 1,
      prompt: "圈出正确的笔画数。\n\n「校」有几画？",
      content: { options: [{ key: "A", text: "9 画" }, { key: "B", text: "10 画" }] },
      answer: { key: "B" } },
    { type: "SINGLE", dimension: "PHONICS", score: 1,
      prompt: "圈出正确的笔画数。\n\n「草」有几画？",
      content: { options: [{ key: "A", text: "8 画" }, { key: "B", text: "9 画" }] },
      answer: { key: "B" } },

    // ─── 乙组 句子与语法 (Q11–17) ──────────────────────────────────

    // Q11 · 弟弟(是/有)一本故事书 → 有
    { type: "SINGLE", dimension: "GRAMMAR", score: 1,
      prompt: "圈出括号里正确的词语。\n\n弟弟（________）一本故事书。",
      mediaUrl: "/questions/chinese-standard-1/q11-brother-book.jpg",
      content: { options: [{ key: "A", text: "是" }, { key: "B", text: "有" }] },
      answer: { key: "B" } },

    // Q12 · 妈妈(在/有)厨房里煮饭 → 在
    { type: "SINGLE", dimension: "GRAMMAR", score: 1,
      prompt: "圈出括号里正确的词语。\n\n妈妈（________）厨房里煮饭。",
      mediaUrl: "/questions/chinese-standard-1/q12-mother-cook.jpg",
      content: { options: [{ key: "A", text: "在" }, { key: "B", text: "有" }] },
      answer: { key: "A" } },

    // Q13 · 我的狗(他/她/它) → 它
    { type: "SINGLE", dimension: "GRAMMAR", score: 1,
      prompt: "圈出括号里正确的词语。\n\n这是我的狗，（________）叫小白。",
      mediaUrl: "/questions/chinese-standard-1/q13-dog.jpg",
      content: { options: [
        { key: "A", text: "他" }, { key: "B", text: "她" }, { key: "C", text: "它" },
      ] },
      answer: { key: "C" } },

    // Q14 · 我用眼睛(看/听/闻)书 → 看
    { type: "SINGLE", dimension: "GRAMMAR", score: 1,
      prompt: "圈出括号里正确的词语。\n\n我用眼睛（________）书。",
      mediaUrl: "/questions/chinese-standard-1/q14-read.jpg",
      content: { options: [
        { key: "A", text: "看" }, { key: "B", text: "听" }, { key: "C", text: "闻" },
      ] },
      answer: { key: "A" } },

    // Q15 · 小鸟在树(上/下/里) → 上
    { type: "SINGLE", dimension: "GRAMMAR", score: 1,
      prompt: "圈出括号里正确的词语。\n\n小鸟在树（________）飞。",
      mediaUrl: "/questions/chinese-standard-1/q15-bird-tree.jpg",
      content: { options: [
        { key: "A", text: "上" }, { key: "B", text: "下" }, { key: "C", text: "里" },
      ] },
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
      prompt: "照样子写句子。\n\n我喜欢吃 __________，因为 __________。",
      content: {
        minWords: 1,
        maxWords: 1000,
        countOnly: true,
        template: "我喜欢吃 __________，因为 __________。",
        imageUrl: "/questions/chinese-standard-1/q17-food.jpg",
        lang: "zh",
      },
      answer: { rubric: "依据题目句式作答：我喜欢吃___________，因为_______________________。" } },

    // ─── 丙组 阅读与写话 (Q18–20) ──────────────────────────────────

    // 短文 "我的家" — used by both Q18 and Q19
    // Q18 · 小雨的家有几个人？ → 四个人 (B)
    { type: "SINGLE", dimension: "READING", score: 2,
      prompt: "阅读下面的短文，然后回答问题。\n\n小雨的家有几个人？",
      content: {
        passageImage: "/questions/chinese-reading/s1-my-family.png",
        passageImageAlt: "小雨和爸爸、妈妈、哥哥在家里进行各自喜欢的活动",
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
        passageImage: "/questions/chinese-reading/s1-my-family.png",
        passageImageAlt: "小雨和爸爸、妈妈、哥哥在家里进行各自喜欢的活动",
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
        minWords: 1,
        maxWords: 1000,
        countOnly: true,
        imageUrl: "/questions/chinese-standard-1/q20-park.jpg",
        template: "图里有 __________。\n他们在 __________。",
        lang: "zh",
      },
      answer: { rubric: "依据公园图片和题目提供的两个句式作答。" } },
  ];
}

// ─────────────────────────────────────────────────────────────────────────
// 二年级 · Chinese Standard 2 (KSSR Semakan · 华小)
//
// Level focus (per YouSeed 华文 guideline):
//   • 形近字辨析  (木/本/末, 土/士, 泳/永/氷) — the core S2 challenge
//   • 多音字     (长: cháng vs zhǎng)
//   • 短文阅读    (~5 sentence passage with 2 comprehension sub-qs)
//   • 词句重组    (drag-drop sentence-building — dragDrop:true so students
//                  get the modern tap-to-place UI, not the legacy arrow one)
//   • 陈述句改疑问句  (grammar transformation — SHORT with rubric)
//   • 看图造句    (writing prompts with an image + a guided template)
//
// Design choices vs S1:
//   • ORDERING questions opt into `dragDrop: true` (tap-to-place) rather
//     than the arrow UI, which feels dated for S2 students.
//   • READING with sub-questions is used for both 词语意思配对 (Q5, 4 subs)
//     and 短文阅读 (Q16, 2 subs) — richer than a plain SINGLE array.
//   • Listen-and-choose (Q3/Q4) uses the teacher-supplied MP3 clips.
//   • Two SHORT writing prompts (Q19, Q20) with image + template so the
//     writing counter shows 6–30 字 targets suited for S2.
export function chineseStandard2Questions(): QData[] {
  return [
    // ─── 甲组  字词与拼音 ───────────────────────────────────────
    // Q1 · 形近字 看图 · 木/本/末
    { type: "SINGLE", dimension: "VOCAB", score: 2,
      prompt: "看图，这棵植物的名称是什么？",
      mediaUrl: "/questions/chinese-standard-2/q01-papaya.svg",
      content: { options: [
        { key: "A", text: "木瓜" },
        { key: "B", text: "本瓜" },
        { key: "C", text: "末瓜" },
      ], afterHint: "形近字提示：木（树木）／本（本子）／末（末日）—— 仔细看每个字的笔画差别。" },
      answer: { key: "A" } },

    // Q2 · 形近字 看图 · 土/士
    { type: "SINGLE", dimension: "VOCAB", score: 2,
      prompt: "看图，小朋友手里拿着什么？",
      mediaUrl: "/questions/chinese-standard-2/q02-potato.svg",
      content: { options: [
        { key: "A", text: "土地" },
        { key: "B", text: "士兵" },
        { key: "C", text: "土豆" },
      ], afterHint: "形近字提示：土（泥土）／士（士兵）—— 注意上面一横的长短。" },
      answer: { key: "C" } },

    // Q3 · 听音选词 · 职业类
    { type: "SINGLE", dimension: "LISTENING", score: 2,
      prompt: "🔊 听一听，这是什么职业？",
      mediaUrl: "/audio/chinese-standard-2/doctor.mp3",
      content: {
        options: [
          { key: "A", text: "医生" },
          { key: "B", text: "医师" },
          { key: "C", text: "医疗" },
        ],
        maxPlays: 3,
        lang: "zh-CN",
      },
      answer: { key: "A" } },

    // Q4 · 听音选词 · 形近字 泳/永/氷
    { type: "SINGLE", dimension: "LISTENING", score: 2,
      prompt: "🔊 听一听，小朋友正在做什么？",
      mediaUrl: "/audio/chinese-standard-2/swimming.mp3",
      content: {
        options: [
          { key: "A", text: "游永" },
          { key: "B", text: "游泳" },
          { key: "C", text: "游水" },
        ],
        maxPlays: 3,
        lang: "zh-CN",
        afterHint: "形近字提示：泳（游泳）／永（永远）／冰（冰块）—— 注意三点水和其他部首。",
      },
      answer: { key: "B" } },

    // Q5 · 词语意思配对 — MATCHING with 4 pairs
    { type: "MATCHING", dimension: "VOCAB", score: 4,
      prompt: "把左边的词语和右边正确的解释配对。\n\n提示：先想一想每个词语最贴切的意思，再连线。",
      content: {
        left:  ["节约", "保护", "整齐", "分享"],
        right: [
          "不浪费，好好利用",     // 节约
          "把好东西给别人一起享用", // 分享
          "照顾和守护",            // 保护
          "排列得很有秩序",        // 整齐
        ],
        dragDrop: true,
      },
      // left indices → right indices
      // 节约(0)→不浪费(0) · 保护(1)→照顾和守护(2) · 整齐(2)→排列(3) · 分享(3)→给别人(1)
      answer: { pairs: { "0": 0, "1": 2, "2": 3, "3": 1 } } },

    // Q6 · 多音字 · 长(cháng) — 长短的长
    { type: "SINGLE", dimension: "PHONICS", score: 2,
      prompt: "读一读，选出【长】字的正确读音：\n\n爷爷的头发很长，像一条白色的丝线。",
      content: {
        options: [
          { key: "A", text: "cháng（长短的长）" },
          { key: "B", text: "zhǎng（成长的长）" },
        ],
      },
      answer: { key: "A" } },

    // Q7 · 多音字 · 长(zhǎng) — 成长的长
    { type: "SINGLE", dimension: "PHONICS", score: 2,
      prompt: "读一读，选出【长】字的正确读音：\n\n小明每年都在长高，今年已经比妈妈还高了。",
      content: {
        options: [
          { key: "A", text: "cháng（长短的长）" },
          { key: "B", text: "zhǎng（成长的长）" },
        ],
      },
      answer: { key: "B" } },

    // Q8 · 拼音选择 · 双词
    { type: "READING", dimension: "PHONICS", score: 2,
      prompt: "选出正确的拼音。",
      content: {
        passage: "两个词语，看清楚每个字的读音：\n\n保护（照顾和守护）\n合作（一起完成）",
        subs: [
          { stem: "「保护」的拼音是？", icon: "🛡️", options: [
            { key: "A", text: "bǎo hù" }, { key: "B", text: "bǎi huà" },
          ]},
          { stem: "「合作」的拼音是？", icon: "🤝", options: [
            { key: "A", text: "héi zhuò" }, { key: "B", text: "hé zuò" },
          ]},
        ],
      },
      answer: { keys: ["A", "B"] } },

    // ─── 乙组  句子与语法 ──────────────────────────────────────
    // Q9 · 选词填空 · 节约/浪费
    { type: "SINGLE", dimension: "GRAMMAR", score: 2,
      prompt: "选出最恰当的词语填入句子：\n\n弟弟每天都 ______ 用水，从来不让水龙头白白流水。",
      content: { options: [
        { key: "A", text: "节约" },
        { key: "B", text: "浪费" },
      ] },
      answer: { key: "A" } },

    // Q10 · 选词填空 · 合作/争吵
    { type: "SINGLE", dimension: "GRAMMAR", score: 2,
      prompt: "选出最恰当的词语填入句子：\n\n班上同学们 ______ 完成了手工作品，大家都非常开心。",
      content: { options: [
        { key: "A", text: "合作" },
        { key: "B", text: "争吵" },
      ] },
      answer: { key: "A" } },

    // Q11 · 选词填空 · 哪里/什么
    { type: "SINGLE", dimension: "GRAMMAR", score: 2,
      prompt: "选出正确的疑问词：\n\n你的书包在 ______ ？",
      content: { options: [
        { key: "A", text: "哪里" },
        { key: "B", text: "什么" },
      ] },
      answer: { key: "A" } },

    // Q12 · 因果关系 CLOZE
    { type: "CLOZE", dimension: "GRAMMAR", score: 2,
      prompt: "填入正确的关联词：\n\n下面的句子有两个空格，请从「因为、所以」两个词中挑选合适的填入。",
      content: {
        passage: "___ 下雨了，___ 我们不能出去玩。",
        blanks: 2,
        caseSensitive: false,
      },
      answer: { blanks: [["因为"], ["所以"]] } },

    // Q13 · 天上的星星一（闪／亮）一（闪／亮）的
    { type: "READING", dimension: "VOCAB", score: 2,
      prompt: "从括号里选出最恰当的词语。",
      content: {
        passage: "天上的星星一（　）一（　）的。",
        subs: [
          { stem: "第一个空格", options: [{ key: "A", text: "闪" }, { key: "B", text: "亮" }] },
          { stem: "第二个空格", options: [{ key: "A", text: "闪" }, { key: "B", text: "亮" }] },
        ],
      },
      answer: { keys: ["A", "A"] } },

    // Q14 · 词句重组 — 小明每天都努力学习
    { type: "ORDERING", dimension: "GRAMMAR", score: 3,
      prompt: "把下面的词语排成一句正确的句子。\n\n点一下词块把它加入句子里，再点一次可以取回。",
      content: {
        items: ["努力", "每天", "学习", "小明", "都"],
        dragDrop: true,
      },
      // Correct order: 小明(3) · 每天(1) · 都(4) · 努力(0) · 学习(2)
      answer: { order: [3, 1, 4, 0, 2] } },

    // Q15 · 词句重组 — 她把糖果分享给同学
    { type: "ORDERING", dimension: "GRAMMAR", score: 3,
      prompt: "把下面的词语排成一句正确的句子。\n\n提示：这句话用了「把」字句结构。",
      content: {
        items: ["分享", "同学", "把", "给", "她", "糖果"],
        dragDrop: true,
      },
      // Correct: 她(4) · 把(2) · 糖果(5) · 分享(0) · 给(3) · 同学(1)
      answer: { order: [4, 2, 5, 0, 3, 1] } },

    // Q16 · 陈述句改疑问句 — 直接选择，避免低年级键盘输入负担
    { type: "SINGLE", dimension: "GRAMMAR", score: 2,
      prompt: "把下面的陈述句改写成疑问句（问句）。\n\n原句：小明把糖果分享给同学。\n\n哪一个改写最正确？",
      content: { options: [
        { key: "A", text: "小明把糖果分享给同学。" },
        { key: "B", text: "小明把糖果分享给谁了？" },
      ] },
      answer: { key: "B" } },

    // ─── 丙组  阅读与写话 ──────────────────────────────────────
    // Q17 · 阅读理解 — 短文：大自然的礼物 (2 subs)
    { type: "READING", dimension: "READING", score: 4,
      prompt: "阅读下面的短文，回答两道题。",
      content: {
        passageImage: "/questions/chinese-reading/s2-natures-gift.png",
        passageImageAlt: "春天的公园里，小明和妹妹欣赏花朵并保护大自然",
        passage:
          "《大自然的礼物》\n\n" +
          "春天来了，花儿开了，鸟儿唱歌了。\n" +
          "小明和妹妹来到公园。他们看见许多美丽的花朵。\n" +
          "妹妹说：「这些花好香啊！」\n" +
          "小明点点头，说：「我们要保护大自然，不要摘花，好吗？」\n" +
          "妹妹笑着说：「好！我们一起来保护大自然！」",
        subs: [
          { stem: "短文里，哪个季节来了？", icon: "🌸", options: [
            { key: "A", text: "夏天" }, { key: "B", text: "秋天" },
            { key: "C", text: "春天" }, { key: "D", text: "冬天" },
          ]},
          { stem: "小明为什么说不要摘花？", icon: "🌱", options: [
            { key: "A", text: "因为花太贵了" },
            { key: "B", text: "因为要保护大自然" },
            { key: "C", text: "因为花不好看" },
            { key: "D", text: "因为妹妹不喜欢花" },
          ]},
        ],
      },
      answer: { keys: ["C", "B"] } },

    // 看图造句 · 钓鱼
    { type: "SHORT", dimension: "WRITING", score: 3,
      prompt: "根据图意和提供的重点字，写一句完整的话。\n\n重点字：钓鱼",
      content: {
        minWords: 1,
        maxWords: 1000,
        countOnly: true,
        imageUrl: "/questions/chinese-standard-2/q19-fishing.svg",
        template: "爷爷在河边钓鱼。",
        lang: "zh",
      },
      answer: { rubric: "参考答案：爷爷在河边钓鱼。" } },

    // 看图造句 · 喜欢
    { type: "SHORT", dimension: "WRITING", score: 3,
      prompt: "根据图意和提供的重点字，写一句完整的话。\n\n重点字：喜欢",
      content: {
        minWords: 1,
        maxWords: 1000,
        countOnly: true,
        imageUrl: "/questions/chinese-standard-2/q20-watermelon.svg",
        template: "我喜欢吃西瓜。",
        lang: "zh",
      },
      answer: { rubric: "参考答案：我喜欢吃西瓜。" } },
  ];
}
