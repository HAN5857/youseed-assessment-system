"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { sound } from "@/lib/sounds";
import { SoundToggle } from "@/components/kids/SoundToggle";
import { ArrowGlyph, BambooGlyph, CheckGlyph, CompassGlyph, InkBrushGlyph, MandarinCompanion, ScrollGlyph, SoundWavesGlyph } from "./MandarinGlyphs";
import { UiThemeProvider } from "@/lib/ui-theme";
import { MandarinLanguageSwitch, mandarinHref, useMandarinLocale } from "@/lib/mandarin-locale";

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
const SKILLS: Record<string, { mark: string; name: string; englishName: string; description: string; englishDescription: string }> = {
  VOCAB:     { mark: "字", name: "字词理解", englishName: "Words and meaning", description: "从图画和拼音里辨认词语", englishDescription: "Recognise words using pictures, characters and pinyin." },
  GRAMMAR:   { mark: "句", name: "句子运用", englishName: "Sentence use", description: "把词语组成通顺的句子", englishDescription: "Build clear and correct Mandarin sentences." },
  READING:   { mark: "读", name: "阅读理解", englishName: "Reading comprehension", description: "阅读短文并找出关键信息", englishDescription: "Read passages and find key information." },
  LISTENING: { mark: "听", name: "聆听理解", englishName: "Listening comprehension", description: "听清信息并理解意思", englishDescription: "Listen for information and meaning." },
  PHONICS:   { mark: "音", name: "拼音能力", englishName: "Pinyin skills", description: "辨认声调、音节和读音", englishDescription: "Recognise tones, syllables and pronunciation." },
  WRITING:   { mark: "写", name: "书面表达", englishName: "Written expression", description: "把观察和想法写成完整内容", englishDescription: "Develop observations and ideas in writing." },
  SPEAKING:  { mark: "说", name: "口语表达", englishName: "Spoken expression", description: "清楚地说出自己的想法", englishDescription: "Share ideas clearly and confidently." },
};

// Four gentle reminders — Chinese only, short and warm.
const REMINDERS = [
  { mark: "时", title: "按自己的步调", englishTitle: "Work at your pace", line: "预计时间只供参考；计时归零后仍可继续作答，成绩照常计算。", englishLine: "The timer is a guide. You may keep answering after it reaches zero, and your score will still be calculated normally." },
  { mark: "试", title: "勇敢尝试", englishTitle: "Give every task a try", line: "不确定也可以先作答，认真尝试就有收获。", englishLine: "If you are unsure, make your best attempt. Every answer helps us understand your learning." },
  { mark: "回", title: "放心检查", englishTitle: "Review when needed", line: "答案会自动保存，也可以回头检查。", englishLine: "Your answers save automatically, and you may return to review them." },
  { mark: "静", title: "专心聆听", englishTitle: "Listen in a quiet place", line: "遇到听力题时，先让身边安静一点。", englishLine: "For listening tasks, find a quiet space before playing the audio." },
];

export function MandarinInstructionsView(props: Props) {
  const reduceMotion = useReducedMotion();
  const { locale, isEnglish, text } = useMandarinLocale();
  const firstName = props.studentName.trim().split(/\s+/)[0] || props.studentName;
  const lowerPrimary = /^standard-[123]$/.test(props.testLevel);

  return (
    <UiThemeProvider mode="calm" tier="primary" subject="chinese">
    <main className={`mandarin-briefing min-h-dvh px-4 py-8 sm:py-12 ${lowerPrimary ? "mandarin-lower-primary" : ""}`} lang={isEnglish ? "en" : "zh-Hans"} data-locale={locale}>
      <div className="mandarin-floating-tools"><MandarinLanguageSwitch /><SoundToggle /></div>
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
            <span className="mandarin-kicker"><CompassGlyph className="h-5 w-5" /><span>{text("出发前的小提醒", "Before you begin")}</span></span>
            <h1>
              {isEnglish ? (
                <>
                  {firstName},{" "}
                  <span className="mandarin-nowrap-word">let&apos;s</span>{" "}
                  discover{" "}
                </>
              ) : (
                `${firstName}，一起去`
              )}
              <span>{text("发现你的华文力量吧！", "your Mandarin strengths!")}</span>
            </h1>
            <p>{text("不用紧张，也不用背答案。慢慢看、慢慢想，把会的认真做，就很棒了。", "There is no need to feel nervous or memorise answers. Read carefully, think calmly and give each task your best attempt.")}</p>
          </div>
          <MandarinCompanion mood="ready" className="mandarin-briefing-mascot" label={text("小墨陪你准备华文评估", "Xiao Mo helps you prepare for the Mandarin assessment")} />
        </div>

        <div className="mandarin-briefing-stats" aria-label={text("旅程资料", "Assessment information")}>
          <Stat icon={<ScrollGlyph className="h-6 w-6" />} number={String(props.totalQuestions)} label={text("小任务", "Tasks")} />
          <Stat icon={<CompassGlyph className="h-6 w-6" />} number={`${props.duration}`} suffix={text("分钟", "min")} label={text("预计时间", "Suggested time")} />
          <Stat icon={<BambooGlyph className="h-6 w-6" />} number={`${props.passingScore}%`} label={text("成长参考线", "Reference score")} />
        </div>

        <section className="mandarin-briefing-panel">
          <div className="mandarin-section-heading">
            <div className="mandarin-section-icon"><InkBrushGlyph className="h-6 w-6" /></div>
            <div><span>{text("沿途会遇见", "What you will explore")}</span><h2>{text("你的华文探索地图", "Your Mandarin discovery map")}</h2></div>
          </div>
          <div className="mandarin-skill-grid">
            {props.dimensionCounts.map(([dimension, count], index) => {
              const item = SKILLS[dimension] ?? { mark: "探", name: dimension, englishName: dimension, description: "发现这一项能力的学习线索", englishDescription: "Discover your skills in this learning area." };
              return (
                <motion.article
                  key={dimension}
                  className="mandarin-skill-card"
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.3, delay: reduceMotion ? 0 : index * 0.045 }}
                >
                  <span className="mandarin-skill-seal" aria-hidden>{item.mark}</span>
                  <div><h3>{isEnglish ? item.englishName : item.name}</h3><p>{isEnglish ? item.englishDescription : item.description}</p><span className="mandarin-task-count">{count} {text("个小任务", count === 1 ? "task" : "tasks")}</span></div>
                </motion.article>
              );
            })}
          </div>
        </section>

        <div className="mandarin-briefing-columns">
          <section className="mandarin-briefing-panel compact">
            <div className="mandarin-section-heading small">
              <div className="mandarin-section-icon"><CheckGlyph className="h-6 w-6" /></div>
              <div><span>{text("安心探索", "Explore with confidence")}</span><h2>{text("只要记得这四件事", "Four things to remember")}</h2></div>
            </div>
            <ol className="mandarin-reminder-list">
              {REMINDERS.map((r) => (
                <li key={r.title}><span className="mandarin-reminder-seal" aria-hidden>{r.mark}</span><div><b>{isEnglish ? r.englishTitle : r.title}</b><span>{isEnglish ? r.englishLine : r.line}</span></div></li>
              ))}
            </ol>
          </section>

          <aside className="mandarin-listening-note">
            <SoundWavesGlyph className="h-9 w-9" />
            <h2>{text("先试一试声音", "Check your sound")}</h2>
            <p>{text("右上角可以开关声音。听力题会告诉你还能听几次，不会突然响起来。", "Use the sound control at the top right. Listening tasks show how many plays remain and will never start unexpectedly.")}</p>
            <div className="mandarin-ink-quote">{text(<>会的认真答，<br />不会的勇敢想。</>, <>Answer what you know.<br />Think bravely when unsure.</>)}</div>
          </aside>
        </div>

        <footer className="mandarin-briefing-actions">
          <Link href={mandarinHref("/test/chinese", locale)} className="mandarin-secondary-button"><ArrowGlyph direction="left" className="h-5 w-5" /><span>{text("稍后再来", "Come back later")}</span></Link>
          <Link href={mandarinHref(`/test/attempt/${props.leadId}/exam`, locale)} className="mandarin-primary-button mandarin-cta-shine" onClick={() => sound().play("whoosh")}>
            <span>{text("和小墨一起出发", "Begin with Xiao Mo")}</span><ArrowGlyph className="h-5 w-5" />
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
