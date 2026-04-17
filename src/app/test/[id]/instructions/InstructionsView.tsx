"use client";

import { useState } from "react";
import Link from "next/link";
import { sound } from "@/lib/sounds";
import { SoundToggle } from "@/components/kids/SoundToggle";

type Lang = "en" | "bm" | "zh";

type Props = {
  leadId: string;
  studentName: string;
  testTitle: string;
  testSubject: string;
  duration: number;
  passingScore: number;
  totalQuestions: number;
  dimensionCounts: [string, number][];
};

const COPY: Record<Lang, {
  brand: string;
  titleLead: string;
  titleAccent: string;
  greeting: (name: string) => string;
  statsLabels: { q: string; t: string; p: string };
  sectionSkills: string;
  sectionReminders: string;
  timeUnit: string;
  remindersList: string[];
  pep: string;
  cancel: string;
  start: string;
  dimensionNames: Record<string, { emoji: string; name: string }>;
  questionsWord: (n: number) => string;
}> = {
  en: {
    brand: "🦁 Anak Bijak English",
    titleLead: "English Language ",
    titleAccent: "Proficiency Assessment",
    greeting: (n) => `Hi ${n}!`,
    statsLabels: { q: "Questions", t: "Time Limit", p: "To Pass" },
    sectionSkills: "What we'll test",
    sectionReminders: "Remember these",
    timeUnit: " min",
    remindersList: [
      "🕐|Your timer starts when you click <b>Start Test</b>.",
      "💾|Answers save by themselves every 20 seconds — don't panic!",
      "🤔|Stuck on a question? Just guess — no marks lost for trying!",
      "🚫|Don't close the tab or switch to other apps — we'll know. 👀",
      "🎯|You only get <b>one chance</b>, so take your time and do your best!",
    ],
    pep: "Take a deep breath, sit comfortably, and let's go! You've got this!",
    cancel: "Cancel",
    start: "Start Test ▶",
    dimensionNames: {
      VOCAB:     { emoji: "🔤", name: "Vocabulary" },
      GRAMMAR:   { emoji: "📝", name: "Grammar" },
      READING:   { emoji: "📖", name: "Reading" },
      LISTENING: { emoji: "👂", name: "Listening" },
      WRITING:   { emoji: "✍️", name: "Writing" },
      SPEAKING:  { emoji: "🎤", name: "Speaking" },
    },
    questionsWord: (n) => `${n} question${n === 1 ? "" : "s"}`,
  },
  bm: {
    brand: "🦁 Anak Bijak English",
    titleLead: "Penilaian Kemahiran ",
    titleAccent: "Bahasa Inggeris",
    greeting: (n) => `Hai ${n}!`,
    statsLabels: { q: "Soalan", t: "Masa", p: "Untuk Lulus" },
    sectionSkills: "Apa yang kami uji",
    sectionReminders: "Perkara untuk diingat",
    timeUnit: " min",
    remindersList: [
      "🕐|Pemasa akan bermula sebaik sahaja kamu tekan <b>Mula Ujian</b>.",
      "💾|Jawapan kamu akan disimpan secara automatik setiap 20 saat — jangan risau!",
      "🤔|Tak pasti? Teka sahaja — tiada markah ditolak untuk jawapan salah!",
      "🚫|Jangan tutup tab atau bertukar ke aplikasi lain — sistem akan merekodnya. 👀",
      "🎯|Kamu hanya ada <b>satu peluang</b>, jadi ambil masa dan buat yang terbaik!",
    ],
    pep: "Tarik nafas panjang, duduk dengan selesa, dan jom mula! Kamu pasti boleh!",
    cancel: "Batal",
    start: "Mula Ujian ▶",
    dimensionNames: {
      VOCAB:     { emoji: "🔤", name: "Perbendaharaan" },
      GRAMMAR:   { emoji: "📝", name: "Tatabahasa" },
      READING:   { emoji: "📖", name: "Bacaan" },
      LISTENING: { emoji: "👂", name: "Pendengaran" },
      WRITING:   { emoji: "✍️", name: "Penulisan" },
      SPEAKING:  { emoji: "🎤", name: "Lisan" },
    },
    questionsWord: (n) => `${n} soalan`,
  },
  zh: {
    brand: "🦁 Anak Bijak English",
    titleLead: "英语能力",
    titleAccent: "评估测试",
    greeting: (n) => `嗨，${n}！`,
    statsLabels: { q: "道题目", t: "答题时间", p: "通过分数" },
    sectionSkills: "我们会测试这些",
    sectionReminders: "温馨小提醒",
    timeUnit: "分钟",
    remindersList: [
      "🕐|按下 <b>开始测验</b> 后，计时器就会立刻启动哦。",
      "💾|你的答案每 20 秒会自动保存一次 —— 别紧张！",
      "🤔|不会做？勇敢猜一猜吧，答错也不会扣分！",
      "🚫|请不要关闭此页面或切换到其他应用 —— 系统会自动记录。👀",
      "🎯|你只有 <b>一次机会</b>，慢慢来，全力以赴加油！",
    ],
    pep: "深呼吸一下，坐好，我们出发咯！你一定做得到的！",
    cancel: "取消",
    start: "开始测验 ▶",
    dimensionNames: {
      VOCAB:     { emoji: "🔤", name: "词汇" },
      GRAMMAR:   { emoji: "📝", name: "语法" },
      READING:   { emoji: "📖", name: "阅读" },
      LISTENING: { emoji: "👂", name: "听力" },
      WRITING:   { emoji: "✍️", name: "写作" },
      SPEAKING:  { emoji: "🎤", name: "口语" },
    },
    questionsWord: (n) => `${n} 道题`,
  },
};

export function InstructionsView({
  leadId, studentName, duration, passingScore, totalQuestions, dimensionCounts,
}: Props) {
  const [lang, setLang] = useState<Lang>("en");
  const t = COPY[lang];

  return (
    <div className="rules-ui" lang={lang === "zh" ? "zh" : lang === "bm" ? "ms" : "en"}>
      {/* Floating doodles */}
      <span className="doodle d1">✏️</span>
      <span className="doodle d2">⭐</span>
      <span className="doodle d3">📚</span>
      <span className="doodle d4">🎈</span>
      <span className="doodle d5">🌈</span>

      {/* Sound controls float in the top-right corner */}
      <div className="fixed right-4 top-4 z-20"><SoundToggle /></div>

      <div className="ab-wrap">
        <div className="ab-card">
          {/* Header: brand tag + language switcher */}
          <div className="ab-header">
            <span className="brand-tag">{t.brand}</span>
            <div className="lang-switch" role="tablist" aria-label="Choose language">
              {(["en", "bm", "zh"] as Lang[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  className={lang === l ? "active" : ""}
                  aria-selected={lang === l}
                  onClick={() => { sound().play("click"); setLang(l); }}
                >
                  {l === "en" ? "EN" : l === "bm" ? "BM" : "中文"}
                </button>
              ))}
            </div>
          </div>

          <h1>
            {t.titleLead}
            <span className="accent">{t.titleAccent}</span>
          </h1>
          <p className="greeting">
            {t.greeting(studentName)} <span className="wave">👋</span>
          </p>

          {/* Stats */}
          <div className="stats">
            <div className="stat q">
              <span className="ico">❓</span>
              <div className="num">{totalQuestions}</div>
              <div className="lbl">{t.statsLabels.q}</div>
            </div>
            <div className="stat t">
              <span className="ico">⏱️</span>
              <div className="num">{duration}<span style={{ fontSize: 18 }}>{t.timeUnit}</span></div>
              <div className="lbl">{t.statsLabels.t}</div>
            </div>
            <div className="stat p">
              <span className="ico">🏆</span>
              <div className="num">{passingScore}%</div>
              <div className="lbl">{t.statsLabels.p}</div>
            </div>
          </div>

          {/* Skills grid */}
          <div className="section">
            <div className="section-title">
              <span className="emoji">🎯</span> {t.sectionSkills}
            </div>
            <div className="skills">
              {dimensionCounts.map(([dim, count]) => {
                const info = t.dimensionNames[dim] ?? { emoji: "💫", name: dim };
                return (
                  <div key={dim} className="skill">
                    <span className="emoji">{info.emoji}</span>
                    <div className="name">{info.name}</div>
                    <div className="count">{t.questionsWord(count)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reminders */}
          <div className="section">
            <div className="section-title">
              <span className="emoji">📏</span> {t.sectionReminders}
            </div>
            <div className="reminders">
              <ul>
                {t.remindersList.map((line, i) => {
                  const [ico, text] = line.split("|");
                  return (
                    <li key={i}>
                      <span className="bullet-ico">{ico}</span>
                      <span dangerouslySetInnerHTML={{ __html: text }} />
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Pep talk */}
          <div className="pep">
            <span className="rocket">🚀</span> {t.pep}
          </div>

          {/* Actions */}
          <div className="actions">
            <Link href="/test" className="btn btn-cancel">{t.cancel}</Link>
            <Link
              href={`/test/${leadId}/exam`}
              className="btn btn-start"
              onClick={() => sound().play("whoosh")}
            >
              {t.start}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
