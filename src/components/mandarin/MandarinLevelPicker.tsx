"use client";

import Link from "next/link";
import { ArrowGlyph, BambooGlyph, InkBrushGlyph, MandarinCompanion, SealGlyph } from "./MandarinGlyphs";
import { MandarinLanguageSwitch, mandarinHref, useMandarinLocale } from "@/lib/mandarin-locale";

type MandarinLevel = {
  id: string;
  name: string;
  unit?: string;
  ageHint?: string;
  enabled: boolean;
};

const CHAPTERS = [
  { mark: "启", line: "看图识字 · 拼音启蒙", englishLine: "Picture words · Pinyin foundations", tone: "jade" },
  { mark: "寻", line: "词语配对 · 句子工坊", englishLine: "Word matching · Sentence building", tone: "gold" },
  { mark: "读", line: "语文运用 · 阅读发现", englishLine: "Language use · Reading discovery", tone: "red" },
  { mark: "思", line: "理解线索 · 表达观点", englishLine: "Comprehension · Sharing ideas", tone: "jade" },
  { mark: "创", line: "篇章分析 · 创意写作", englishLine: "Text analysis · Creative writing", tone: "gold" },
  { mark: "远", line: "综合运用 · 深度表达", englishLine: "Integrated skills · Deeper expression", tone: "red" },
] as const;
const CHINESE_NUMERALS = ["一", "二", "三", "四", "五", "六"] as const;

export function MandarinLevelPicker({ levels }: { levels: MandarinLevel[] }) {
  const { locale, isEnglish, text } = useMandarinLocale();
  return (
    <main className="mandarin-portal min-h-dvh px-4 py-8 sm:py-12" lang={isEnglish ? "en" : "zh-Hans"} data-locale={locale}>
      <div className="mandarin-floating-tools"><MandarinLanguageSwitch /></div>
      <div className="mandarin-cloud cloud-one" aria-hidden />
      <div className="mandarin-cloud cloud-two" aria-hidden />

      <section className="relative z-10 mx-auto max-w-5xl">
        <div className="mandarin-portal-hero">
          <div className="mandarin-portal-copy">
            <div className="mandarin-eyebrow"><SealGlyph className="h-5 w-5" /> {text("YouSeed 华文探索馆", "YouSeed Mandarin Discovery")}</div>
            <h1>{text("今天，想翻开", "Which Mandarin journey")}{isEnglish && " "}<span>{text("哪一卷？", "will you begin today?")}</span></h1>
            <p>{text("这里没有冷冰冰的考卷，只有一站站小发现——听一听、看一看、动手排一排。", "This is not a cold, formal test. Each stop invites you to listen, look, think and discover what you can do in Mandarin.")}</p>
            <div className="mandarin-hero-note">
              <BambooGlyph className="h-5 w-5" />
              <span>{text("选好你现在就读的年级，小墨就陪你出发。", "Choose your current standard and Xiao Mo will guide the way.")}</span>
            </div>
          </div>
          <MandarinCompanion className="mandarin-companion" label={text("小墨陪你探索华文", "Xiao Mo, your Mandarin learning companion")} />
        </div>

        <div className="mandarin-level-grid" aria-label={text("选择华文年级", "Choose a Mandarin standard")}>
          {levels.map((level, index) => {
            const chapter = CHAPTERS[index] ?? CHAPTERS[CHAPTERS.length - 1];
            const inner = (
              <article className={`mandarin-level-card tone-${chapter.tone} ${level.enabled ? "is-ready" : "is-locked"}`}>
                <div className="mandarin-level-mark" aria-hidden>{chapter.mark}</div>
                <div className="mandarin-level-index">{text("探索卷", "Journey")} · {String(index + 1).padStart(2, "0")}</div>
                <h2>{text(`华文${CHINESE_NUMERALS[index] ?? index + 1}年级`, `Mandarin Standard ${index + 1}`)}</h2>
                <p>{isEnglish ? chapter.englishLine : chapter.line}</p>
                <div className="mandarin-level-meta">
                  <span>{text("建议年龄", "Suggested age")} · {index + 7}</span>
                  <span>{level.unit?.includes("UASA") ? text("UASA 能力线索", "UASA skills") : text("KSSR 学习脉络", "KSSR aligned")}</span>
                </div>
                <div className="mandarin-level-action">
                  {level.enabled ? <><span>{text("展开这一卷", "Begin this journey")}</span><ArrowGlyph className="h-5 w-5" /></> : <span>{text("内容准备中", "Coming soon")}</span>}
                </div>
              </article>
            );
            return level.enabled ? (
              <Link key={level.id} href={mandarinHref(`/test/chinese/${level.id}`, locale)} className="block focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D9A12E]/40 rounded-[28px]">
                {inner}
              </Link>
            ) : <div key={level.id} aria-disabled>{inner}</div>;
          })}
        </div>

        <footer className="mandarin-portal-footer">
          <Link href="/test"><ArrowGlyph direction="left" className="h-4 w-4" /> {text("返回语言选择", "Back to language selection")}</Link>
          <span><InkBrushGlyph className="h-4 w-4" /> {text("每一次尝试，都是新的发现。", "Every attempt reveals something new.")}</span>
        </footer>
      </section>
    </main>
  );
}
