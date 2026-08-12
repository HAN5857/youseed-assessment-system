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

// Each discovery-map card shows ONE bold Chinese name + ONE short line.
// English is intentionally dropped at card level — it lives once, softly, in
// the section header — so the map reads clean instead of doubled-up.
const SKILLS: Record<string, { mark: string; name: string; description: string }> = {
  VOCAB:     { mark: "字", name: "字词寻宝", description: "从图画和拼音里找出词语" },
  GRAMMAR:   { mark: "句", name: "句子工坊", description: "动手把词语组成通顺的句子" },
  READING:   { mark: "读", name: "阅读探境", description: "走进短文，找出藏起来的答案" },
  LISTENING: { mark: "听", name: "听音辨意", description: "静静听，把声音和意思连起来" },
  PHONICS:   { mark: "音", name: "拼音小径", description: "认一认声调、音节和读音" },
  WRITING:   { mark: "写", name: "小作家天地", description: "把看到、想到的写成自己的话" },
  SPEAKING:  { mark: "说", name: "表达舞台", description: "大方地把心里的想法说出来" },
};

// Four gentle reminders — Chinese only, short and warm.
const REMINDERS: { mark: string; title: string; line: string }[] = [
  { mark: "慢", title: "慢慢来", line: "题目不赶时间，看清楚再选。" },
  { mark: "试", title: "勇敢试", line: "不确定也可以先写，试一试就有收获。" },
  { mark: "回", title: "放心走", line: "答案会自动保存，可以回头检查。" },
  { mark: "静", title: "专心听", line: "遇到听力题，先让身边安静一点。" },
];

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
            <span className="mandarin-kicker"><CompassGlyph className="h-5 w-5" /><span>出发前的小提醒</span></span>
            <h1>{firstName}，一起去<span>发现你的华文力量</span>吧！</h1>
            <p>不用紧张，也不用背答案。慢慢看、慢慢想，把会的认真做，就很棒了。</p>
            <p className="mandarin-english-subline">Mandarin is the main language here — English hints are there only to help you understand each task.</p>
          </div>
          <MandarinCompanion mood="ready" className="mandarin-briefing-mascot" />
        </div>

        <div className="mandarin-briefing-stats" aria-label="旅程资料">
          <Stat icon={<ScrollGlyph className="h-6 w-6" />} number={String(props.totalQuestions)} label="小站点" />
          <Stat icon={<CompassGlyph className="h-6 w-6" />} number={`${props.duration}`} suffix="分钟" label="预计时间" />
          <Stat icon={<BambooGlyph className="h-6 w-6" />} number={`${props.passingScore}%`} label="成长参考线" />
        </div>

        <section className="mandarin-briefing-panel">
          <div className="mandarin-section-heading">
            <div className="mandarin-section-icon"><InkBrushGlyph className="h-6 w-6" /></div>
            <div><span>沿途会遇见</span><h2>你的华文探索地图<small>Your Mandarin discovery map</small></h2></div>
          </div>
          <div className="mandarin-skill-grid">
            {props.dimensionCounts.map(([dimension, count], index) => {
              const item = SKILLS[dimension] ?? { mark: "探", name: dimension, description: "发现这一项能力的学习线索" };
              return (
                <motion.article
                  key={dimension}
                  className="mandarin-skill-card"
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.3, delay: reduceMotion ? 0 : index * 0.045 }}
                >
                  <span className="mandarin-skill-seal" aria-hidden>{item.mark}</span>
                  <div><h3>{item.name}</h3><p>{item.description}</p><span className="mandarin-task-count">{count} 个小任务</span></div>
                </motion.article>
              );
            })}
          </div>
        </section>

        <div className="mandarin-briefing-columns">
          <section className="mandarin-briefing-panel compact">
            <div className="mandarin-section-heading small">
              <div className="mandarin-section-icon"><CheckGlyph className="h-6 w-6" /></div>
              <div><span>安心探索</span><h2>只要记得这四件事<small>Four little things to remember</small></h2></div>
            </div>
            <ol className="mandarin-reminder-list">
              {REMINDERS.map((r) => (
                <li key={r.title}><span className="mandarin-reminder-seal" aria-hidden>{r.mark}</span><div><b>{r.title}</b><span>{r.line}</span></div></li>
              ))}
            </ol>
          </section>

          <aside className="mandarin-listening-note">
            <SoundWavesGlyph className="h-9 w-9" />
            <h2>先试一试声音</h2>
            <p>右上角可以开关声音。听力题会告诉你还能听几次，不会突然响起来。</p>
            <div className="mandarin-ink-quote">会的认真答，<br />不会的勇敢想。</div>
          </aside>
        </div>

        <footer className="mandarin-briefing-actions">
          <Link href="/test/chinese" className="mandarin-secondary-button"><ArrowGlyph direction="left" className="h-5 w-5" /><span>稍后再来</span></Link>
          <Link href={`/test/attempt/${props.leadId}/exam`} className="mandarin-primary-button mandarin-cta-shine" onClick={() => sound().play("whoosh")}>
            <span>和小墨一起出发</span><ArrowGlyph className="h-5 w-5" />
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
