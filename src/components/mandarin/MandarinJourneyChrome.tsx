"use client";

import { SoundToggle } from "@/components/kids/SoundToggle";
import { BambooGlyph, CompassGlyph, ScrollGlyph } from "./MandarinGlyphs";

export function MandarinJourneyHeader({
  title, current, total, answered, minutes, seconds, timeLow, englishSupport, onToggleEnglish,
}: {
  title: string; current: number; total: number; answered: Set<number>;
  minutes: string; seconds: string; timeLow: boolean;
  englishSupport: boolean; onToggleEnglish: () => void;
}) {
  const phase = journeyPhase(current, total);
  return (
    <header className="mandarin-journey-header">
      <div className="mandarin-journey-topline">
        <div className="mandarin-journey-brand">
          <span className="mandarin-journey-seal">华</span>
          <div><strong>{title}</strong><span><CompassGlyph className="h-3.5 w-3.5" /> {phase}</span></div>
        </div>
        <div className="mandarin-journey-tools">
          <div className={`mandarin-time ${timeLow ? "is-low" : ""}`} aria-label="旅程剩余时间">
            <ScrollGlyph className="h-4 w-4" /><span>{minutes}:{seconds}</span>
          </div>
          <button
            type="button"
            className={`mandarin-language-toggle ${englishSupport ? "is-active" : ""}`}
            onClick={onToggleEnglish}
            aria-pressed={englishSupport}
            aria-label={englishSupport ? "Hide English guidance" : "Show English guidance"}
            title={englishSupport ? "关闭英文辅助" : "开启英文辅助"}
          >
            <strong>EN</strong><span>辅助</span>
          </button>
          <SoundToggle showMusic />
        </div>
      </div>

      <div className="mandarin-progress-wrap">
        <div className="mandarin-progress-copy">
          <span>第 {current + 1} 站 · 共 {total} 站<small>Stop {current + 1} of {total}</small></span>
          <strong>已点亮 {answered.size} 片竹叶<small>{answered.size} completed</small></strong>
        </div>
        <div className="mandarin-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={answered.size} aria-label={`已完成 ${answered.size} 个任务，共 ${total} 个`}>
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
  return (
    <div className="mandarin-quest-heading">
      <div className="mandarin-quest-tags">
        <span><CompassGlyph className="h-4 w-4" /> {score} 成长点<small>{score} {score === 1 ? "point" : "points"}</small></span>
      </div>
    </div>
  );
}

export function MandarinJourneyFooterNote() {
  return <div className="mandarin-journey-footnote"><BambooGlyph className="h-4 w-4" /><span>答案会悄悄保存，放心探索。<small>Your answers are saved automatically.</small></span></div>;
}

function journeyPhase(current: number, total: number) {
  const ratio = total <= 1 ? 1 : current / (total - 1);
  if (ratio < .25) return "初见 · 找到线索";
  if (ratio < .5) return "寻句 · 连接意思";
  if (ratio < .75) return "入文 · 读懂故事";
  return "成章 · 写出想法";
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
