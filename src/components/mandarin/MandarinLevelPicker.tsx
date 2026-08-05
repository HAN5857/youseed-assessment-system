import Link from "next/link";
import { ArrowGlyph, BambooGlyph, InkBrushGlyph, MandarinCompanion, SealGlyph } from "./MandarinGlyphs";

type MandarinLevel = {
  id: string;
  name: string;
  unit?: string;
  ageHint?: string;
  enabled: boolean;
};

const CHAPTERS = [
  { mark: "启", line: "看图识字 · 拼音启蒙", tone: "jade" },
  { mark: "寻", line: "词语配对 · 句子工坊", tone: "gold" },
  { mark: "读", line: "语文运用 · 阅读发现", tone: "red" },
  { mark: "思", line: "理解线索 · 表达观点", tone: "jade" },
  { mark: "创", line: "篇章分析 · 创意写作", tone: "gold" },
  { mark: "远", line: "综合运用 · 深度表达", tone: "red" },
] as const;
const CHINESE_NUMERALS = ["一", "二", "三", "四", "五", "六"] as const;

export function MandarinLevelPicker({ levels }: { levels: MandarinLevel[] }) {
  return (
    <main className="mandarin-portal min-h-dvh px-4 py-8 sm:py-12" lang="zh-Hans">
      <div className="mandarin-cloud cloud-one" aria-hidden />
      <div className="mandarin-cloud cloud-two" aria-hidden />

      <section className="relative z-10 mx-auto max-w-5xl">
        <div className="mandarin-portal-hero">
          <div className="mandarin-portal-copy">
            <div className="mandarin-eyebrow"><SealGlyph className="h-5 w-5" /> YouSeed 华文探索馆</div>
            <h1>今天，想从哪一页<span>开始探索？</span></h1>
            <p>这里没有冷冰冰的考卷。每一站都是一个小发现：听一听、看一看、动手排一排，再把心里的想法写下来。</p>
            <div className="mandarin-hero-note">
              <BambooGlyph className="h-5 w-5" />
              <span>选择目前就读年级，小墨会陪你完成整段华文旅程。</span>
            </div>
          </div>
          <MandarinCompanion className="mandarin-companion" />
        </div>

        <div className="mandarin-level-grid" aria-label="选择华文年级">
          {levels.map((level, index) => {
            const chapter = CHAPTERS[index] ?? CHAPTERS[CHAPTERS.length - 1];
            const inner = (
              <article className={`mandarin-level-card tone-${chapter.tone} ${level.enabled ? "is-ready" : "is-locked"}`}>
                <div className="mandarin-level-mark" aria-hidden>{chapter.mark}</div>
                <div className="mandarin-level-index">探索卷 · {String(index + 1).padStart(2, "0")}</div>
                <h2>华文{CHINESE_NUMERALS[index] ?? index + 1}年级</h2>
                <p>{chapter.line}</p>
                <div className="mandarin-level-meta">
                  <span>建议年龄 · {index + 7} 岁</span>
                  <span>{level.unit?.includes("UASA") ? "UASA 能力线索" : "KSSR 学习脉络"}</span>
                </div>
                <div className="mandarin-level-action">
                  {level.enabled ? <><span>展开这一卷</span><ArrowGlyph className="h-5 w-5" /></> : <span>内容准备中</span>}
                </div>
              </article>
            );
            return level.enabled ? (
              <Link key={level.id} href={`/test/chinese/${level.id}`} className="block focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D9A12E]/40 rounded-[28px]">
                {inner}
              </Link>
            ) : <div key={level.id} aria-disabled>{inner}</div>;
          })}
        </div>

        <footer className="mandarin-portal-footer">
          <Link href="/test"><ArrowGlyph direction="left" className="h-4 w-4" /> 返回语言选择</Link>
          <span><InkBrushGlyph className="h-4 w-4" /> 每一次尝试，都是新的发现。</span>
        </footer>
      </section>
    </main>
  );
}
