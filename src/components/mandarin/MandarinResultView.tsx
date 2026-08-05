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

const DIMENSIONS: Record<string, { mark: string; name: string; insight: string }> = {
  VOCAB: { mark: "字", name: "字词理解", insight: "辨认词语，并在语境中理解意思" },
  GRAMMAR: { mark: "句", name: "句子运用", insight: "组织句子，掌握表达规律" },
  READING: { mark: "读", name: "阅读理解", insight: "抓住重点，并从文字中寻找线索" },
  LISTENING: { mark: "听", name: "聆听理解", insight: "听清信息，连接声音与意思" },
  PHONICS: { mark: "音", name: "拼音能力", insight: "辨认音节、声调与正确读音" },
  WRITING: { mark: "写", name: "书面表达", insight: "把观察与想法写成完整内容" },
  SPEAKING: { mark: "说", name: "口语表达", insight: "清楚、有信心地表达想法" },
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
          </div>
          <MandarinCompanion mood="celebrate" className="mandarin-result-mascot" />
        </motion.div>

        <div className="mandarin-result-scroll">
          <div className="mandarin-result-seal" aria-label={`成长印记：${stage.title}`}>
            <span>{stage.mark}</span><small>成长印记</small>
          </div>
          <div className="mandarin-result-stage">
            <span>本次发现</span>
            <h2>{stage.title}</h2>
            <p>{stage.message}</p>
          </div>
          <div className="mandarin-result-score">
            <strong>{percentage}<small>%</small></strong>
            <span>{lead.totalScore ?? 0} / {lead.maxScore ?? 0} 成长点</span>
          </div>
        </div>

        {Object.keys(dimensions).length > 0 && (
          <section className="mandarin-result-panel">
            <div className="mandarin-section-heading">
              <div className="mandarin-section-icon"><CompassGlyph className="h-6 w-6" /></div>
              <div><span>家长也看得懂</span><h2>华文能力成长快照</h2></div>
            </div>
            <p className="mandarin-result-intro">每一项分数都是学习线索，不是标签。老师会结合孩子的作答过程，判断最适合的学习起点。</p>
            <div className="mandarin-result-dimensions">
              {Object.entries(dimensions).map(([key, score], index) => {
                const info = DIMENSIONS[key] ?? { mark: "探", name: key, insight: "这一项能力的学习表现" };
                return (
                  <motion.article
                    key={key}
                    initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: reduceMotion ? 0 : .28, delay: reduceMotion ? 0 : index * .05 }}
                  >
                    <span className="mandarin-dimension-mark">{info.mark}</span>
                    <div className="mandarin-dimension-copy"><h3>{info.name}</h3><p>{info.insight}</p></div>
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
              <div><span>下一步不是多做一张卷</span><h2>让学习真正接得上</h2></div>
            </div>
            <p>负责老师会进一步查看孩子的答题记录、阅读理解与写作表达，再与家长确认一次免费的面对面评估与学习回顾。</p>
            <ul>
              <li><CheckGlyph className="h-5 w-5" /><span>看见孩子已经具备的能力</span></li>
              <li><CheckGlyph className="h-5 w-5" /><span>找出最值得优先补强的环节</span></li>
              <li><CheckGlyph className="h-5 w-5" /><span>规划清楚、可实行的华文学习路线</span></li>
            </ul>
          </section>
          <aside className="mandarin-result-contact">
            <InkBrushGlyph className="h-8 w-8" />
            <span>接下来</span>
            <h2>负责老师会主动联系您</h2>
            <p>我们会配合家长方便的时间，确认免费面对面语言评估与学习回顾。没有压力，也不会强迫报名。</p>
          </aside>
        </div>

        <footer className="mandarin-result-footer">
          <div><ScrollGlyph className="h-5 w-5" /><span>{test.title}</span><b>{minutesUsed ? `${minutesUsed} 分钟完成` : "已完成"}</b></div>
          <Link href="/test/chinese" className="mandarin-secondary-button">返回华文探索馆 <ArrowGlyph className="h-5 w-5" /></Link>
        </footer>
      </section>
    </main>
  );
}

function stageFor(score: number) {
  if (score >= 85) return { mark: "雅", title: "墨香小雅士", message: "理解与表达已经相当稳健，下一步适合挑战更丰富的篇章与观点。" };
  if (score >= 70) return { mark: "进", title: "稳步进阶者", message: "主要能力已经连成一条清楚的学习线，继续强化细节会更有自信。" };
  if (score >= 50) return { mark: "芽", title: "新芽探索家", message: "基础正在扎根，一些能力已经冒出新芽，适合用有趣而规律的方式继续累积。" };
  return { mark: "启", title: "勇敢启程者", message: "愿意尝试就是很好的开始。找对起点后，每一个字、每一句话都会慢慢变熟悉。" };
}

function safeJson(value: string) {
  try { return JSON.parse(value); } catch { return null; }
}
