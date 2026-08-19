"use client";

import { SoundToggle } from "@/components/kids/SoundToggle";
import { BambooGlyph, CompassGlyph, ScrollGlyph } from "./MandarinGlyphs";
import { AdvisoryTimeNotice } from "@/components/assessment/AdvisoryTimeNotice";
import { MandarinLanguageSwitch, useMandarinLocale } from "@/lib/mandarin-locale";

export function MandarinJourneyHeader({
  title, current, total, answered, minutes, seconds, timeLow, overtime,
}: {
  title: string; current: number; total: number; answered: Set<number>;
  minutes: string; seconds: string; timeLow: boolean; overtime: boolean;
}) {
  const { isEnglish, text } = useMandarinLocale();
  const phase = journeyPhase(current, total, isEnglish);
  return (
    <header className="mandarin-journey-header">
      <div className="mandarin-journey-topline">
        <div className="mandarin-journey-brand">
          <span className="mandarin-journey-seal">华</span>
          <div><strong>{isEnglish ? englishTestTitle(title) : title}</strong><span><CompassGlyph className="h-3.5 w-3.5" /> {phase}</span></div>
        </div>
        <div className="mandarin-journey-tools">
          <div className={`mandarin-time ${overtime ? "is-overtime" : timeLow ? "is-low" : ""}`} aria-label={overtime ? text("已超过建议时间", "Suggested time exceeded") : text("旅程剩余时间", "Suggested time remaining")}>
            <ScrollGlyph className="h-4 w-4" /><span>{minutes}:{seconds}</span>
          </div>
          <MandarinLanguageSwitch />
          <SoundToggle showMusic />
        </div>
      </div>

      {overtime && (
        <div className="mx-auto max-w-[1120px] px-[18px] pb-2 max-[560px]:px-3">
          <AdvisoryTimeNotice chinese={!isEnglish} />
        </div>
      )}

      <div className="mandarin-progress-wrap">
        <div className="mandarin-progress-copy">
          <span>{text(`第 ${current + 1} 站 · 共 ${total} 站`, `Task ${current + 1} of ${total}`)}</span>
          <strong>{text(`已完成 ${answered.size} 个任务`, `${answered.size} completed`)}</strong>
        </div>
        <div className="mandarin-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={answered.size} aria-label={text(`已完成 ${answered.size} 个任务，共 ${total} 个`, `${answered.size} of ${total} tasks completed`)}>
          {Array.from({ length: total }).map((_, index) => (
            <span key={index} className={`${answered.has(index) ? "is-done" : ""} ${index === current ? "is-current" : ""}`} aria-hidden />
          ))}
        </div>
      </div>
    </header>
  );
}

export function MandarinEnglishGuide({ dimension, type }: { dimension: string; type: string }) {
  const copy = englishGuide(dimension, type);
  return (
    <aside className="mandarin-english-guide" aria-label="English task guidance">
      <span aria-hidden>EN</span>
      <div>
        <strong>{copy.title}</strong>
        <p>{copy.description}</p>
      </div>
    </aside>
  );
}

export function MandarinQuestHeading({
  score,
}: {
  score: number;
}) {
  const { text } = useMandarinLocale();
  return (
    <div className="mandarin-quest-heading">
      <div className="mandarin-quest-tags">
        <span><CompassGlyph className="h-4 w-4" /> {text(`${score} 成长点`, `${score} ${score === 1 ? "point" : "points"}`)}</span>
      </div>
    </div>
  );
}

export function MandarinJourneyFooterNote() {
  const { text } = useMandarinLocale();
  return <div className="mandarin-journey-footnote"><BambooGlyph className="h-4 w-4" /><span>{text("答案会自动保存，放心作答。", "Your answers are saved automatically.")}</span></div>;
}

function journeyPhase(current: number, total: number, english: boolean) {
  const ratio = total <= 1 ? 1 : current / (total - 1);
  if (ratio < .25) return english ? "Begin · Find the clues" : "初见 · 找到线索";
  if (ratio < .5) return english ? "Connect · Build meaning" : "寻句 · 连接意思";
  if (ratio < .75) return english ? "Read · Understand the text" : "入文 · 读懂文章";
  return english ? "Express · Share your ideas" : "成章 · 写出想法";
}

function englishTestTitle(title: string) {
  const numerals: Record<string, string> = { "一": "1", "二": "2", "三": "3", "四": "4", "五": "5", "六": "6" };
  const match = title.match(/([一二三四五六1-6])年级/);
  return match ? `Mandarin Standard ${numerals[match[1]] ?? match[1]} · Placement Assessment` : "Mandarin Placement Assessment";
}

function englishGuide(dimension: string, type: string) {
  if (/LISTEN/i.test(type) || dimension === "LISTENING") return { title: "Listen carefully", description: "Play the audio, then choose the answer that best matches what you hear." };
  if (/ORDER/i.test(type)) return { title: "Build the sentence", description: "Tap the word blocks to arrange them into a clear and correct Chinese sentence." };
  if (/MATCH/i.test(type)) return { title: "Match the clues", description: "Connect each Chinese word with the meaning or item that belongs with it." };
  if (dimension === "READING" || type === "READING") return { title: "Read and discover", description: "Use the illustration to understand the setting, then find evidence in the Chinese passage." };
  if (dimension === "WRITING" || type === "SHORT") return { title: "Express your idea", description: "Use the picture or sentence starter to write your answer in Chinese." };
  if (dimension === "GRAMMAR") return { title: "Explore the sentence", description: "Read the Chinese sentence carefully and choose or write the form that fits best." };
  if (dimension === "PHONICS") return { title: "Notice the sound", description: "Look closely at the pinyin, tone or character sound before answering." };
  return { title: "Find the word clue", description: "Look at the picture and Chinese words, then choose the best match." };
}
