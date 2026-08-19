"use client";

import Link from "next/link";
import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { celebrate } from "@/components/kids/Confetti";
import { sound } from "@/lib/sounds";
import { ArrowGlyph, BambooGlyph, CheckGlyph, CompassGlyph, InkBrushGlyph, MandarinCompanion, ScrollGlyph } from "./MandarinGlyphs";
import { AdvisoryTimeNotice } from "@/components/assessment/AdvisoryTimeNotice";
import { MandarinLanguageSwitch, mandarinHref, useMandarinLocale } from "@/lib/mandarin-locale";

type Lead = {
  name: string; totalScore: number | null; maxScore: number | null; percentage: number | null;
  dimScores: string | null; submittedAt: Date | null; startedAt: Date; status: string;
};
type Test = { title: string; duration: number; level?: string | null };

const DIMENSIONS: Record<string, { mark: string; name: string; englishName: string; insight: string; englishInsight: string }> = {
  VOCAB: { mark: "字", name: "字词理解", englishName: "Words & meaning", insight: "辨认词语，并在语境中理解意思", englishInsight: "Recognises words and understands meaning in context." },
  GRAMMAR: { mark: "句", name: "句子运用", englishName: "Sentence use", insight: "组织句子，掌握表达规律", englishInsight: "Builds sentences and applies language patterns." },
  READING: { mark: "读", name: "阅读理解", englishName: "Reading comprehension", insight: "抓住重点，并从文字中寻找线索", englishInsight: "Finds key ideas and evidence in a passage." },
  LISTENING: { mark: "听", name: "聆听理解", englishName: "Listening comprehension", insight: "听清信息，连接声音与意思", englishInsight: "Connects spoken information with meaning." },
  PHONICS: { mark: "音", name: "拼音能力", englishName: "Pinyin skills", insight: "辨认音节、声调与正确读音", englishInsight: "Recognises syllables, tones and pronunciation." },
  WRITING: { mark: "写", name: "书面表达", englishName: "Written expression", insight: "把观察与想法写成完整内容", englishInsight: "Develops observations and ideas in writing." },
  SPEAKING: { mark: "说", name: "口语表达", englishName: "Spoken expression", insight: "清楚、有信心地表达想法", englishInsight: "Shares ideas clearly and confidently." },
};

export function MandarinResultView({ lead, test }: { lead: Lead; test: Test }) {
  const reduceMotion = useReducedMotion();
  const { locale, isEnglish, text } = useMandarinLocale();
  const percentage = Math.round(lead.percentage ?? 0);
  const stage = stageFor(percentage);
  const firstName = lead.name.trim().split(/\s+/)[0] || lead.name;
  const dimensions: Record<string, number> = lead.dimScores ? safeJson(lead.dimScores) ?? {} : {};
  const minutesUsed = lead.submittedAt
    ? Math.max(1, Math.round((new Date(lead.submittedAt).getTime() - new Date(lead.startedAt).getTime()) / 60000))
    : null;
  const lowerPrimary = /^standard-[123]$/.test(test.level ?? "");

  useEffect(() => {
    celebrate();
    void sound().unlock().then(() => sound().play("celebrate"));
  }, []);

  return (
    <main className={`mandarin-result min-h-dvh px-4 py-8 sm:py-12 ${lowerPrimary ? "mandarin-lower-primary" : ""}`} lang={isEnglish ? "en" : "zh-Hans"} data-locale={locale}>
      <div className="mandarin-floating-tools"><MandarinLanguageSwitch /></div>
      <div className="mandarin-cloud cloud-one" aria-hidden />
      <div className="mandarin-cloud cloud-two" aria-hidden />
      <section className="relative z-10 mx-auto max-w-5xl">
        <motion.div
          className="mandarin-result-hero"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : .4, ease: "easeOut" }}
        >
          <div className="mandarin-result-copy">
            <span className="mandarin-kicker light"><CheckGlyph className="h-5 w-5" /> {text("华文探索旅程 · 已完成", "Mandarin journey · Complete")}</span>
            <h1>{isEnglish ? `${firstName}, you created ` : `${firstName}，你留下了一份`}<span>{text("独一无二的学习足迹", "your own learning profile")}</span></h1>
            <p>{text("这不只是一张成绩单，而是一幅帮助老师与家长看见优势、理解需要、规划下一步的华文成长地图。", "This is more than a score. It helps parents and tutors understand strengths, learning needs and the most helpful next step in Mandarin.")}</p>
          </div>
          <MandarinCompanion mood="celebrate" className="mandarin-result-mascot" label={text("小墨为你庆祝", "Xiao Mo celebrates your progress")} />
        </motion.div>

        {lead.status === "TIMEOUT" && (
          <div className="mt-4">
            <AdvisoryTimeNotice chinese={!isEnglish} completed />
          </div>
        )}

        <div className="mandarin-result-scroll">
          <div className="mandarin-result-seal" aria-label={text(`成长印记：${stage.title}`, `Learning stage: ${stage.englishTitle}`)}>
            <span>{stage.mark}</span><small>{text("成长印记", "Learning stage")}</small>
          </div>
          <div className="mandarin-result-stage">
            <span>{text("本次发现", "This journey reveals")}</span>
            <h2>{isEnglish ? stage.englishTitle : stage.title}</h2>
            <p>{isEnglish ? stage.englishMessage : stage.message}</p>
          </div>
          <div className="mandarin-result-score">
            <strong>{percentage}<small>%</small></strong>
            <span>{lead.totalScore ?? 0} / {lead.maxScore ?? 0} {text("成长点", "points")}</span>
          </div>
        </div>

        {Object.keys(dimensions).length > 0 && (
          <section className="mandarin-result-panel">
            <div className="mandarin-section-heading">
              <div className="mandarin-section-icon"><CompassGlyph className="h-6 w-6" /></div>
              <div><span>{text("家长也看得懂", "A clear view for parents")}</span><h2>{text("华文能力成长快照", "Mandarin learning snapshot")}</h2></div>
            </div>
            <p className="mandarin-result-intro">{text("每一项分数都是学习线索，不是标签。老师会结合孩子的作答过程，判断最适合的学习起点。", "Each score is a learning clue, not a label. The tutor will review how your child approached every task to identify the right learning starting point.")}</p>
            <div className="mandarin-result-dimensions">
              {Object.entries(dimensions).map(([key, score], index) => {
                const info = DIMENSIONS[key] ?? { mark: "探", name: key, englishName: "Learning discovery", insight: "这一项能力的学习表现", englishInsight: "Performance in this learning area." };
                return (
                  <motion.article
                    key={key}
                    initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: reduceMotion ? 0 : .28, delay: reduceMotion ? 0 : index * .05 }}
                  >
                    <span className="mandarin-dimension-mark">{info.mark}</span>
                    <div className="mandarin-dimension-copy"><h3>{isEnglish ? info.englishName : info.name}</h3><p>{isEnglish ? info.englishInsight : info.insight}</p></div>
                    <div className="mandarin-dimension-score"><strong>{Math.round(score)}%</strong><span><i style={{ width: `${Math.max(4, Math.min(100, score))}%` }} /></span></div>
                  </motion.article>
                );
              })}
            </div>
          </section>
        )}

        <div className="mandarin-result-columns">
          <section className="mandarin-result-panel next-step">
            <div className="mandarin-section-heading small">
              <div className="mandarin-section-icon"><BambooGlyph className="h-6 w-6" /></div>
              <div><span>{text("下一步不只是多做一张卷", "More than another worksheet")}</span><h2>{text("让学习真正接得上", "Connect learning to the right next step")}</h2></div>
            </div>
            <p>{text("负责老师会进一步查看孩子的答题记录、阅读理解与写作表达，再与家长确认一次免费的面对面评估与学习回顾。", "Your tutor will review the answers, reading comprehension and writing before arranging a free face-to-face assessment and learning review.")}</p>
            <ul>
              <li><CheckGlyph className="h-5 w-5" /><span>{text("看见孩子已经具备的能力", "Recognise current strengths")}</span></li>
              <li><CheckGlyph className="h-5 w-5" /><span>{text("找出最值得优先补强的环节", "Identify the most useful areas to strengthen")}</span></li>
              <li><CheckGlyph className="h-5 w-5" /><span>{text("规划清楚、可实行的华文学习路线", "Plan a clear and practical Mandarin pathway")}</span></li>
            </ul>
          </section>
          <aside className="mandarin-result-contact">
            <InkBrushGlyph className="h-8 w-8" />
            <span>{text("接下来", "What happens next")}</span>
            <h2>{text("负责老师会主动联系您", "Your tutor will contact you")}</h2>
            <p>{text("我们会配合家长方便的时间，确认免费面对面语言评估与学习回顾。没有压力，也不会强迫报名。", "We will arrange the free face-to-face language assessment and learning review at a convenient time—without pressure or a hard sell.")}</p>
          </aside>
        </div>

        <footer className="mandarin-result-footer">
          <div><ScrollGlyph className="h-5 w-5" /><span>{isEnglish ? "Mandarin placement assessment" : test.title}</span><b>{minutesUsed ? text(`${minutesUsed} 分钟完成`, `Completed in ${minutesUsed} min`) : text("已完成", "Completed")}</b></div>
          <Link href={mandarinHref("/test/chinese", locale)} className="mandarin-secondary-button"><strong>{text("返回华文探索馆", "Return to Mandarin discovery")}</strong><ArrowGlyph className="h-5 w-5" /></Link>
        </footer>
      </section>
    </main>
  );
}

function stageFor(score: number) {
  if (score >= 85) return { mark: "雅", title: "墨香小雅士", englishTitle: "Confident Mandarin scholar", message: "理解与表达已经相当稳健，下一步适合挑战更丰富的篇章与观点。", englishMessage: "Understanding and expression are strong; richer texts and ideas are the next challenge." };
  if (score >= 70) return { mark: "进", title: "稳步进阶者", englishTitle: "Steady progress maker", message: "主要能力已经连成一条清楚的学习线，继续强化细节会更有自信。", englishMessage: "Core skills are connecting well; strengthening details will build even more confidence." };
  if (score >= 50) return { mark: "芽", title: "新芽探索家", englishTitle: "Growing Mandarin explorer", message: "基础正在扎根，一些能力已经冒出新芽，适合用有趣而规律的方式继续累积。", englishMessage: "Foundations are taking root; enjoyable, regular practice will help these new skills grow." };
  return { mark: "启", title: "勇敢启程者", englishTitle: "Brave journey starter", message: "愿意尝试就是很好的开始。找对起点后，每一个字、每一句话都会慢慢变熟悉。", englishMessage: "Trying is a wonderful beginning. With the right starting point, every word and sentence will become more familiar." };
}

function safeJson(value: string) {
  try { return JSON.parse(value); } catch { return null; }
}
