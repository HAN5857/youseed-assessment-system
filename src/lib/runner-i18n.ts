// ─────────────────────────────────────────────────────────────────────────
// Subject-aware copy dictionary for the exam runner + supporting kids UI.
//
// This is NOT a full-blown i18n framework — it's a single flat object that
// swaps based on subject id. Every string a Chinese-Standard-N student
// would see during the exam belongs here so a designer can update all
// Mandarin copy in one place.
//
// Usage:
//   import { runnerCopy } from "@/lib/runner-i18n";
//   const t = runnerCopy(subject);
//   <span>{t.pointsChip(4)}</span>
//   <button>{t.next}</button>
//
// New keys — add to BOTH the English default and every language variant.
// If a variant is missing a key, TypeScript will refuse to build. This
// pattern scales cleanly when we later add Bahasa Melayu (variant "bm")
// or more languages.
// ─────────────────────────────────────────────────────────────────────────

export type RunnerCopy = {
  // Encouragement toast pool — chosen at random on every answer.
  encouragements: string[];

  // Sticker pools for milestone bursts + corner decorations.
  // Emoji sets chosen to feel culturally consistent (lantern/panda for CN,
  // rainbow/unicorn for EN default).
  cornerStickers: string[];
  milestoneStickers: string[];

  // Runner UI chrome.
  questionOf: (idx: number, total: number, answered: number) => string;
  timeRemaining: string;                    // aria-label
  pointsChip: (n: number) => string;        // "4 ⭐ points" / "4 分"
  back: string;
  next: string;
  finish: string;
  finishReady: string;                       // "Finish! 🏁" / "完成 🎉"
  submitting: string;                        // "Submitting…"
  submittingReady: string;                   // "Submitting… 🎉"
  toastPrefix: string;                       // wraps encouragement — "✨"
  toastSuffix: string;

  // FinishDialog — used on submit CTA.
  finishTitleDone: string;                   // "Ready to finish? 🎉"
  finishTitleUnfinished: string;             // "Almost there! 💪"
  finishBodyDone: string;                    // "You answered every question — great job!"
  finishBodyUnfinished: (remaining: number) => string;
  finishAnsweredLabel: string;               // "Answered"
  finishCompleteLabel: string;               // "Complete"
  finishSecondary: string;                   // "Let me check again"
  finishSecondaryUnfinished: string;         // "Keep trying 💪"
  finishPrimary: string;                     // "Yes, finish! 🏁"
  finishPrimaryUnfinished: string;           // "Finish anyway 🏁"

  // Sound / voice toggles (aria-labels).
  soundOn: string;
  soundOff: string;
  musicOn: string;
  musicOff: string;
  voiceOn: string;
  voiceOff: string;
  voiceIsOn: string;                          // title tooltip
  voiceIsOff: string;

  // StarProgress a11y.
  starProgressLabel: (index: number, answered: boolean) => string;

  // PassageCard default hint.
  passageHint: string;                        // "📚 Take your time — read it twice!"
  passageHintUpper: string;                   // reading-comprehension upper-primary variant

  // Dimension chip labels (for dimension-theme.ts).
  dim: {
    vocab: string; grammar: string; reading: string; listening: string;
    phonics: string; writing: string; speaking: string; question: string;
  };

  // Progress-bar milestone toasts.
  milestone25: string;
  milestone50: string;
  milestone75: string;
  milestone90: string;

  // Matching legacy dropdown placeholder.
  matchingChoosePlaceholder: string;
};

// ─── English (default) ───────────────────────────────────────────────────
const EN: RunnerCopy = {
  encouragements: [
    "You're doing great!", "Keep it up!", "Awesome!", "You're a star!",
    "Nice one!", "Superb!", "Fantastic!", "Way to go!", "Brilliant!", "Smart move!",
  ],
  cornerStickers: ["⭐","🌈","🎈","🎀","🌟","✨","💫","🎊","🪄","🍭"],
  milestoneStickers: ["⭐","🌈","🎈","🎀","🌟","✨","💫","🎊","🪄","🍭","🦄","🏆"],

  questionOf: (idx, total, answered) => `Question ${idx + 1} of ${total} · ${answered} answered`,
  timeRemaining: "Time remaining",
  pointsChip: (n) => `${n} ⭐ points`,
  back: "← Back",
  next: "Next →",
  finish: "Finish! 🏁",
  finishReady: "Finish! 🏁",
  submitting: "Submitting…",
  submittingReady: "Submitting… 🎉",
  toastPrefix: "",
  toastSuffix: " ✨",

  finishTitleDone: "Ready to finish? 🎉",
  finishTitleUnfinished: "Almost there! 💪",
  finishBodyDone: "You answered every question — great job!",
  finishBodyUnfinished: (n) => `You've answered ${n} more to try. Want to keep going?`,
  finishAnsweredLabel: "Answered",
  finishCompleteLabel: "Complete",
  finishSecondary: "Let me check again",
  finishSecondaryUnfinished: "Keep trying 💪",
  finishPrimary: "Yes, finish! 🏁",
  finishPrimaryUnfinished: "Finish anyway 🏁",

  soundOn: "Unmute sounds",
  soundOff: "Mute sounds",
  musicOn: "Play music",
  musicOff: "Pause music",
  voiceOn: "Turn Seedy's voice on",
  voiceOff: "Turn Seedy's voice off",
  voiceIsOn: "Seedy is talking 🌱",
  voiceIsOff: "Seedy is quiet",

  starProgressLabel: (i, a) => `Question ${i + 1} ${a ? "answered" : "not answered"}`,
  passageHint: "📚 Take your time — read it twice!",
  passageHintUpper: "Read carefully — you can scroll back to the passage at any time.",

  dim: {
    vocab: "Vocabulary", grammar: "Grammar", reading: "Reading", listening: "Listening",
    phonics: "Phonics", writing: "Writing", speaking: "Speaking", question: "Question",
  },
  milestone25: "🌱 Great start! 25% done.",
  milestone50: "🔥 Halfway there — you've got this!",
  milestone75: "🚀 So close! Just a little more.",
  milestone90: "⭐ One more to go!",

  matchingChoosePlaceholder: "— choose —",
};

// ─── Chinese (华文) ──────────────────────────────────────────────────────
// Tone: warm, encouraging, kid-friendly. Uses simplified characters and
// standard Malaysia-China elementary-school phrasing. Avoids very formal
// classical constructions (e.g. 妙极了) in favour of what a modern P1-P6
// student would find natural (好棒, 加油, 你真棒).
const ZH: RunnerCopy = {
  encouragements: [
    "你真棒！",         // You're great!
    "加油！加油！",     // Keep going!
    "太厉害了！",       // Amazing!
    "答得漂亮！",       // Nicely answered!
    "你真聪明！",       // You're so clever!
    "继续努力！",       // Keep at it!
    "好样的！",         // Attaboy/attagirl!
    "干得漂亮！",       // Well done!
    "你做得到的！",     // You can do this!
    "一步一个脚印！",   // One step at a time!
  ],
  // Chinese festive + kid-friendly: red lantern 🏮, red envelope 🧧,
  // panda 🐼, bamboo 🎋, dragon 🐲, blossom 🌸, mooncake 🥮, lotus 🪷,
  // fish cake 🍥, star ⭐.
  cornerStickers: ["🏮","🧧","🐼","🎋","🐲","🌸","🥮","🪷","🍥","⭐"],
  milestoneStickers: ["🏮","🧧","🐼","🎋","🐲","🌸","🥮","🪷","🍥","⭐","🌟","🎊"],

  questionOf: (idx, total, answered) => `第 ${idx + 1} 题 · 共 ${total} 题 · 已答 ${answered} 题`,
  timeRemaining: "剩余时间",
  pointsChip: (n) => `${n} 分`,
  back: "← 上一题",
  next: "下一题 →",
  finish: "完成 🏁",
  finishReady: "完成 🎉",
  submitting: "提交中…",
  submittingReady: "提交中… 🎉",
  toastPrefix: "🌸 ",
  toastSuffix: "",

  finishTitleDone: "准备交卷了吗？🎉",
  finishTitleUnfinished: "快到终点啦！💪",
  finishBodyDone: "每一题都答完了，真了不起！",
  finishBodyUnfinished: (n) => `还有 ${n} 题没有作答，要不要再看看？`,
  finishAnsweredLabel: "已答",
  finishCompleteLabel: "完成度",
  finishSecondary: "让我再看看",
  finishSecondaryUnfinished: "继续加油 💪",
  finishPrimary: "好，交卷！🏁",
  finishPrimaryUnfinished: "还是交卷 🏁",

  soundOn: "打开声音",
  soundOff: "关闭声音",
  musicOn: "播放音乐",
  musicOff: "暂停音乐",
  voiceOn: "开启小熊猫朗读",
  voiceOff: "关闭小熊猫朗读",
  voiceIsOn: "小熊猫在朗读 🐼",
  voiceIsOff: "小熊猫暂时不说话",

  starProgressLabel: (i, a) => `第 ${i + 1} 题 ${a ? "已答" : "未答"}`,
  passageHint: "📚 慢慢读，多读几次！",
  passageHintUpper: "细心读一读 —— 可以随时翻回上面看短文。",

  dim: {
    vocab: "字词", grammar: "语法", reading: "阅读", listening: "听力",
    phonics: "拼音", writing: "写作", speaking: "口语", question: "题目",
  },
  milestone25: "🌱 好的开始！走完四分之一。",
  milestone50: "🔥 已经完成一半，加油！",
  milestone75: "🚀 就快到啦，再撑一下！",
  milestone90: "⭐ 只剩最后一题！",

  matchingChoosePlaceholder: "— 请选择 —",
};

// ─── Selector ────────────────────────────────────────────────────────────
export function runnerCopy(subject?: string | null): RunnerCopy {
  const s = String(subject ?? "").toLowerCase();
  if (s === "chinese" || s === "zh" || s === "zh-cn") return ZH;
  return EN;
}

/** Handy check for downstream conditionals that need to know we're Chinese. */
export function isChineseSubject(subject?: string | null): boolean {
  const s = String(subject ?? "").toLowerCase();
  return s === "chinese" || s === "zh" || s === "zh-cn";
}
