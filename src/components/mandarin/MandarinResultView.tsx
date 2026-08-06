"use client";

import Link from "next/link";
import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { celebrate } from "@/components/kids/Confetti";
import { sound } from "@/lib/sounds";
import { ArrowGlyph, BambooGlyph, CheckGlyph, CompassGlyph, InkBrushGlyph, MandarinCompanion, ScrollGlyph } from "./MandarinGlyphs";

type Lead = {
  name: string; totalScore: number | null; maxScore: number | null; percentage: number | null;
  dimScores: string | null; submittedAt: Date | null; startedAt: Date;
};
type Test = { title: string; duration: number };

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
  const percentage = Math.round(lead.percentage ?? 0);
  const stage = stageFor(percentage);
  const firstName = lead.name.trim().split(/\s+/)[0] || lead.name;
  const dimensions: Record<string, number> = lead.dimScores ? safeJson(lead.dimScores) ?? {} : {};
  const minutesUsed = lead.submittedAt
    ? Math.max(1, Math.round((new Date(lead.submittedAt).getTime() - new Date(lead.startedAt).getTime()) / 60000))
    : null;

  useEffect(() => {
    celebrate();
    void sound().unlock().then(() => sound().play("celebrate"));
  }, []);

  return (
    <main className="mandarin-result min-h-dvh px-4 py-8 sm:py-12" lang="zh-Hans">
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
            <span className="mandarin-kicker light"><CheckGlyph className="h-5 w-5" /> 华文探索旅程 · 已完成</span>
            <h1>{firstName}，你留下了一份<span>独一无二的学习足迹</span></h1>
            <p>这不是一张只看分数的成绩单，而是一幅帮助老师与家长看见优势、理解需要、规划下一步的华文成长地图。</p>
            <p className="mandarin-english-subline light">A clear Mandarin learning profile for parents, tutors and the learner’s next step.</p>
          </div>
          <MandarinCompanion mood="celebrate" className="mandarin-result-mascot" />
        </motion.div>

        <div className="mandarin-result-scroll">
          <div className="mandarin-result-seal" aria-label={`成长印记：${stage.title}`}>
            <span>{stage.mark}</span><small>成长印记</small>
          </div>
          <div className="mandarin-result-stage">
            <span>本次发现<small>This journey reveals</small></span>
            <h2>{stage.title}<small>{stage.englishTitle}</small></h2>
            <p>{stage.message}<small>{stage.englishMessage}</small></p>
          </div>
          <div className="mandarin-result-score">
            <strong>{percentage}<small>%</small></strong>
            <span>{lead.totalScore ?? 0} / {lead.maxScore ?? 0} 成长点<small>Growth points</small></span>
          </div>
        </div>

        {Object.keys(dimensions).length > 0 && (
          <section className="mandarin-result-panel">
            <div className="mandarin-section-heading">
              <div className="mandarin-section-icon"><CompassGlyph className="h-6 w-6" /></div>
              <div><span>家长也看得懂<small>A clear view for parents</small></span><h2>华文能力成长快照<small>Mandarin learning snapshot</small></h2></div>
            </div>
            <p className="mandarin-result-intro">每一项分数都是学习线索，不是标签。老师会结合孩子的作答过程，判断最适合的学习起点。<small>Each score is a learning clue, not a label. The tutor will review how your child approached every task.</small></p>
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
                    <div className="mandarin-dimension-copy"><h3>{info.name}<small>{info.englishName}</small></h3><p>{info.insight}<small>{info.englishInsight}</small></p></div>
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
              <div><span>下一步不是多做一张卷<small>More than another worksheet</small></span><h2>让学习真正接得上<small>Connect learning to the right next step</small></h2></div>
            </div>
            <p>负责老师会进一步查看孩子的答题记录、阅读理解与写作表达，再与家长确认一次免费的面对面评估与学习回顾。<small>Your tutor will review the answers, reading and writing before arranging a free face-to-face assessment and learning review.</small></p>
            <ul>
              <li><CheckGlyph className="h-5 w-5" /><span>看见孩子已经具备的能力<small>Recognise current strengths</small></span></li>
              <li><CheckGlyph className="h-5 w-5" /><span>找出最值得优先补强的环节<small>Identify the most useful areas to strengthen</small></span></li>
              <li><CheckGlyph className="h-5 w-5" /><span>规划清楚、可实行的华文学习路线<small>Plan a clear and practical Mandarin pathway</small></span></li>
            </ul>
          </section>
          <aside className="mandarin-result-contact">
            <InkBrushGlyph className="h-8 w-8" />
            <span>接下来<small>What happens next</small></span>
            <h2>负责老师会主动联系您<small>Your tutor will contact you</small></h2>
            <p>我们会配合家长方便的时间，确认免费面对面语言评估与学习回顾。没有压力，也不会强迫报名。<small>We will arrange the free face-to-face language assessment and learning review at a convenient time—without pressure or a hard sell.</small></p>
          </aside>
        </div>

        <footer className="mandarin-result-footer">
          <div><ScrollGlyph className="h-5 w-5" /><span>{test.title}<small>Mandarin placement journey</small></span><b>{minutesUsed ? `${minutesUsed} 分钟完成` : "已完成"}<small>{minutesUsed ? `Completed in ${minutesUsed} min` : "Completed"}</small></b></div>
          <Link href="/test/chinese" className="mandarin-secondary-button"><span className="mandarin-bilingual-action"><strong>返回华文探索馆</strong><small>Return to Mandarin discovery</small></span><ArrowGlyph className="h-5 w-5" /></Link>
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
