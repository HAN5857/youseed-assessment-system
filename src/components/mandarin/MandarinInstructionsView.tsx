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
  testLevel: string;
  duration: number;
  passingScore: number;
  totalQuestions: number;
  dimensionCounts: [string, number][];
};

const SKILLS: Record<string, { mark: string; name: string; english: string; description: string; englishDescription: string }> = {
  VOCAB: { mark: "字", name: "字词寻宝", english: "Words & meaning", description: "从图像、拼音和语境里找到词语线索", englishDescription: "Find word clues through pictures, pinyin and context." },
  GRAMMAR: { mark: "句", name: "句子工坊", english: "Sentence building", description: "动手组合、转换并理解句子的秘密", englishDescription: "Build, transform and understand Chinese sentences." },
  READING: { mark: "读", name: "阅读探境", english: "Reading discovery", description: "走进短文，发现藏在文字里的答案", englishDescription: "Enter each passage and discover the clues within." },
  LISTENING: { mark: "听", name: "听音辨意", english: "Listening", description: "静心聆听，捕捉声音与意思", englishDescription: "Listen calmly and connect sounds with meaning." },
  PHONICS: { mark: "音", name: "拼音小径", english: "Pinyin & sounds", description: "辨认声调、音节与正确读音", englishDescription: "Recognise tones, syllables and pronunciation." },
  WRITING: { mark: "写", name: "小作家天地", english: "Chinese writing", description: "把观察与想法变成自己的文字", englishDescription: "Turn observations and ideas into your own writing." },
  SPEAKING: { mark: "说", name: "表达舞台", english: "Speaking", description: "清楚而有信心地说出想法", englishDescription: "Share ideas clearly and confidently." },
};

export function MandarinInstructionsView(props: Props) {
  const reduceMotion = useReducedMotion();
  const firstName = props.studentName.trim().split(/\s+/)[0] || props.studentName;
  const lowerPrimary = /^standard-[123]$/.test(props.testLevel);

  return (
    <UiThemeProvider mode="calm" tier="primary" subject="chinese">
    <main className={`mandarin-briefing min-h-dvh px-4 py-8 sm:py-12 ${lowerPrimary ? "mandarin-lower-primary" : ""}`} lang="zh-Hans">
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
            <span className="mandarin-kicker"><CompassGlyph className="h-5 w-5" /><span>出发前的小茶歇<small>A calm pause before we begin</small></span></span>
            <h1>{firstName}，准备好<span>发现自己的华文力量</span>了吗？</h1>
            <p className="mandarin-heading-translation">{firstName}, ready to discover your Mandarin strengths?</p>
            <p>不必背答案，也不用紧张。跟着直觉慢慢走，每一站都会让老师更了解你已经掌握什么、下一步适合学什么。</p>
            <p className="mandarin-english-subline">Mandarin is the main assessment language. Optional English guidance helps you understand what each task asks you to do.</p>
          </div>
          <MandarinCompanion mood="ready" className="mandarin-briefing-mascot" />
        </div>

        <div className="mandarin-briefing-stats" aria-label="旅程资料">
          <Stat icon={<ScrollGlyph className="h-6 w-6" />} number={String(props.totalQuestions)} label="探索站点" englishLabel="Discovery stops" />
          <Stat icon={<CompassGlyph className="h-6 w-6" />} number={`${props.duration}`} suffix="分钟" englishSuffix="min" label="预计旅程" englishLabel="Estimated journey" />
          <Stat icon={<BambooGlyph className="h-6 w-6" />} number={`${props.passingScore}%`} label="成长参考线" englishLabel="Growth reference" />
        </div>

        <section className="mandarin-briefing-panel">
          <div className="mandarin-section-heading">
            <div className="mandarin-section-icon"><InkBrushGlyph className="h-6 w-6" /></div>
            <div><span>沿途会遇见<small>What you will discover</small></span><h2>你的华文探索地图<small>Your Mandarin discovery map</small></h2></div>
          </div>
          <div className="mandarin-skill-grid">
            {props.dimensionCounts.map(([dimension, count], index) => {
              const item = SKILLS[dimension] ?? { mark: "探", name: dimension, english: "Learning discovery", description: "发现这一项能力的学习线索", englishDescription: "Discover clues about this learning skill." };
              return (
                <motion.article
                  key={dimension}
                  className="mandarin-skill-card"
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.3, delay: reduceMotion ? 0 : index * 0.045 }}
                >
                  <span className="mandarin-skill-seal" aria-hidden>{item.mark}</span>
                  <div><h3>{item.name}<small>{item.english}</small></h3><p>{item.description}<small>{item.englishDescription}</small></p><span className="mandarin-task-count">{count} 个小任务<small>{count} mini tasks</small></span></div>
                </motion.article>
              );
            })}
          </div>
        </section>

        <div className="mandarin-briefing-columns">
          <section className="mandarin-briefing-panel compact">
            <div className="mandarin-section-heading small">
              <div className="mandarin-section-icon"><CheckGlyph className="h-6 w-6" /></div>
              <div><span>安心探索<small>Explore with confidence</small></span><h2>你只要记得四件事<small>Four things to remember</small></h2></div>
            </div>
            <ol className="mandarin-reminder-list">
              <li><b>慢慢看<small>Take your time</small></b><span>题目没有催你，读清楚再选择。<small>Read carefully before choosing.</small></span></li>
              <li><b>勇敢试<small>Give it a try</small></b><span>不确定也可以作答，每次尝试都有价值。<small>Every thoughtful attempt matters.</small></span></li>
              <li><b>放心走<small>Move with ease</small></b><span>答案会自动保存，可以回到上一站检查。<small>Your answers save automatically.</small></span></li>
              <li><b>专心听<small>Listen closely</small></b><span>需要听音时，先让周围安静一点。<small>Find a quiet space for listening tasks.</small></span></li>
            </ol>
          </section>

          <aside className="mandarin-listening-note">
            <SoundWavesGlyph className="h-9 w-9" />
            <h2>先试一试声音<small>Check your sound first</small></h2>
            <p>右上角可以控制声音。听力任务会清楚显示播放次数，不会突然播放。<small>Use the top-right control. Audio only plays when you choose.</small></p>
            <div className="mandarin-ink-quote">“会的认真答，不会的勇敢想。”<small>Answer what you know; think bravely about the rest.</small></div>
          </aside>
        </div>

        <footer className="mandarin-briefing-actions">
          <Link href="/test/chinese" className="mandarin-secondary-button"><ArrowGlyph direction="left" className="h-5 w-5" /><span className="mandarin-bilingual-action"><strong>稍后再开始</strong><small>Start later</small></span></Link>
          <Link href={`/test/attempt/${props.leadId}/exam`} className="mandarin-primary-button" onClick={() => sound().play("whoosh")}>
            <span className="mandarin-bilingual-action"><strong>和小墨一起出发</strong><small>Begin with Xiao Mo</small></span><ArrowGlyph className="h-5 w-5" />
          </Link>
        </footer>
      </motion.section>
    </main>
    </UiThemeProvider>
  );
}

function Stat({ icon, number, suffix, englishSuffix, label, englishLabel }: { icon: React.ReactNode; number: string; suffix?: string; englishSuffix?: string; label: string; englishLabel: string }) {
  return (
    <div className="mandarin-stat">
      <span>{icon}</span>
      <div><strong>{number}<small>{suffix}</small></strong><p>{label}<small>{englishSuffix ? `${englishSuffix} · ` : ""}{englishLabel}</small></p></div>
    </div>
  );
}
