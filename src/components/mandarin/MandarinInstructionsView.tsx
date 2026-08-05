"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { sound } from "@/lib/sounds";
import { SoundToggle } from "@/components/kids/SoundToggle";
import { ArrowGlyph, BambooGlyph, CheckGlyph, CompassGlyph, InkBrushGlyph, MandarinCompanion, ScrollGlyph, SoundWavesGlyph } from "./MandarinGlyphs";
import { UiThemeProvider } from "@/lib/ui-theme";

type Props = {
  leadId: string;
  studentName: string;
  testTitle: string;
  duration: number;
  passingScore: number;
  totalQuestions: number;
  dimensionCounts: [string, number][];
};

const SKILLS: Record<string, { mark: string; name: string; english: string; description: string }> = {
  VOCAB: { mark: "字", name: "字词寻宝", english: "Words & meaning", description: "从图像、拼音和语境里找到词语线索" },
  GRAMMAR: { mark: "句", name: "句子工坊", english: "Sentence building", description: "动手组合、转换并理解句子的秘密" },
  READING: { mark: "读", name: "阅读探境", english: "Reading discovery", description: "走进短文，发现藏在文字里的答案" },
  LISTENING: { mark: "听", name: "听音辨意", english: "Listening", description: "静心聆听，捕捉声音与意思" },
  PHONICS: { mark: "音", name: "拼音小径", english: "Pinyin & sounds", description: "辨认声调、音节与正确读音" },
  WRITING: { mark: "写", name: "小作家天地", english: "Chinese writing", description: "把观察与想法变成自己的文字" },
  SPEAKING: { mark: "说", name: "表达舞台", english: "Speaking", description: "清楚而有信心地说出想法" },
};

export function MandarinInstructionsView(props: Props) {
  const reduceMotion = useReducedMotion();
  const firstName = props.studentName.trim().split(/\s+/)[0] || props.studentName;

  return (
    <UiThemeProvider mode="calm" tier="primary" subject="chinese">
    <main className="mandarin-briefing min-h-dvh px-4 py-8 sm:py-12" lang="zh-Hans">
      <div className="fixed right-4 top-4 z-30"><SoundToggle /></div>
      <div className="mandarin-cloud cloud-one" aria-hidden />
      <div className="mandarin-cloud cloud-two" aria-hidden />

      <motion.section
        className="relative z-10 mx-auto max-w-5xl"
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.38, ease: "easeOut" }}
      >
        <div className="mandarin-briefing-hero">
          <div>
            <span className="mandarin-kicker"><CompassGlyph className="h-5 w-5" /> 出发前的小茶歇</span>
            <h1>{firstName}，准备好<span>发现自己的华文力量</span>了吗？</h1>
            <p>不必背答案，也不用紧张。跟着直觉慢慢走，每一站都会让老师更了解你已经掌握什么、下一步适合学什么。</p>
            <p className="mandarin-english-subline">Mandarin is the main assessment language. Optional English guidance helps you understand what each task asks you to do.</p>
          </div>
          <MandarinCompanion mood="ready" className="mandarin-briefing-mascot" />
        </div>

        <div className="mandarin-briefing-stats" aria-label="旅程资料">
          <Stat icon={<ScrollGlyph className="h-6 w-6" />} number={String(props.totalQuestions)} label="探索站点" />
          <Stat icon={<CompassGlyph className="h-6 w-6" />} number={`${props.duration}`} suffix="分钟" label="预计旅程" />
          <Stat icon={<BambooGlyph className="h-6 w-6" />} number={`${props.passingScore}%`} label="成长参考线" />
        </div>

        <section className="mandarin-briefing-panel">
          <div className="mandarin-section-heading">
            <div className="mandarin-section-icon"><InkBrushGlyph className="h-6 w-6" /></div>
            <div><span>沿途会遇见</span><h2>你的华文探索地图</h2></div>
          </div>
          <div className="mandarin-skill-grid">
            {props.dimensionCounts.map(([dimension, count], index) => {
              const item = SKILLS[dimension] ?? { mark: "探", name: dimension, english: "Learning discovery", description: "发现这一项能力的学习线索" };
              return (
                <motion.article
                  key={dimension}
                  className="mandarin-skill-card"
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.3, delay: reduceMotion ? 0 : index * 0.045 }}
                >
                  <span className="mandarin-skill-seal" aria-hidden>{item.mark}</span>
                  <div><h3>{item.name}<small>{item.english}</small></h3><p>{item.description}</p><small>{count} 个小任务</small></div>
                </motion.article>
              );
            })}
          </div>
        </section>

        <div className="mandarin-briefing-columns">
          <section className="mandarin-briefing-panel compact">
            <div className="mandarin-section-heading small">
              <div className="mandarin-section-icon"><CheckGlyph className="h-6 w-6" /></div>
              <div><span>安心探索</span><h2>你只要记得四件事</h2></div>
            </div>
            <ol className="mandarin-reminder-list">
              <li><b>慢慢看</b><span>题目没有催你，读清楚再选择。</span></li>
              <li><b>勇敢试</b><span>不确定也可以作答，每次尝试都有价值。</span></li>
              <li><b>放心走</b><span>答案会自动保存，可以回到上一站检查。</span></li>
              <li><b>专心听</b><span>需要听音时，先让周围安静一点。</span></li>
            </ol>
          </section>

          <aside className="mandarin-listening-note">
            <SoundWavesGlyph className="h-9 w-9" />
            <h2>先试一试声音</h2>
            <p>右上角可以控制声音。听力任务会清楚显示播放次数，不会突然播放。</p>
            <div className="mandarin-ink-quote">“会的认真答，不会的勇敢想。”</div>
          </aside>
        </div>

        <footer className="mandarin-briefing-actions">
          <Link href="/test/chinese" className="mandarin-secondary-button"><ArrowGlyph direction="left" className="h-5 w-5" /> 稍后再开始</Link>
          <Link href={`/test/attempt/${props.leadId}/exam`} className="mandarin-primary-button" onClick={() => sound().play("whoosh")}>
            和小墨一起出发 <ArrowGlyph className="h-5 w-5" />
          </Link>
        </footer>
      </motion.section>
    </main>
    </UiThemeProvider>
  );
}

function Stat({ icon, number, suffix, label }: { icon: React.ReactNode; number: string; suffix?: string; label: string }) {
  return (
    <div className="mandarin-stat">
      <span>{icon}</span>
      <div><strong>{number}<small>{suffix}</small></strong><p>{label}</p></div>
    </div>
  );
}
