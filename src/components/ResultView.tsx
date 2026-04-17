"use client";

import { getLevel, DEFAULT_BANDS } from "@/lib/level";
import Link from "next/link";
import { useEffect } from "react";
import { celebrate } from "@/components/kids/Confetti";
import { Mascot } from "@/components/kids/Mascot";
import { sound } from "@/lib/sounds";

type LeadLite = {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  location: string;
  subject: string;
  status: string;
  totalScore: number | null;
  maxScore: number | null;
  percentage: number | null;
  level: string | null;
  dimScores: string | null;
  submittedAt: Date | null;
  startedAt: Date;
  tabBlurCount: number;
  answers: string | null;
};

type TestLite = { title: string; subject: string; duration: number };

const KID_LABELS: Record<string, { label: string; blurb: string }> = {
  "C2": { label: "SUPER SUPERSTAR!", blurb: "You're like a real-life language master. Amazing work!" },
  "C1": { label: "AMAZING!",         blurb: "You speak and read like a pro. Super impressive!" },
  "B2": { label: "AWESOME!",         blurb: "You're really confident in most situations. Keep it up!" },
  "B1": { label: "GREAT JOB!",       blurb: "You can handle familiar topics — time to level up!" },
  "A2": { label: "NICE WORK!",       blurb: "You know the basics well. Let's build from here!" },
  "A1": { label: "GOOD START!",      blurb: "You've taken your first steps — every expert started here!" },
  "Pre-A1": { label: "BRAVE EXPLORER!", blurb: "Exploring a new language is brave. We'll help you grow!" },
};

export function ResultView({
  lead, test, mode,
}: {
  lead: LeadLite;
  test: TestLite;
  mode: "student" | "internal";
}) {
  const pct = lead.percentage ?? 0;
  const band = getLevel(pct);
  const dims: Record<string, number> = lead.dimScores ? safeJson(lead.dimScores) ?? {} : {};
  const minutesUsed = lead.submittedAt
    ? Math.round((new Date(lead.submittedAt).getTime() - new Date(lead.startedAt).getTime()) / 60000)
    : null;

  const kidCopy = KID_LABELS[band.code] ?? KID_LABELS["A1"];
  const firstName = lead.name.split(/\s+/)[0] || lead.name;

  // Celebrate on mount (student mode only) — confetti + big applause + fanfare
  useEffect(() => {
    if (mode === "student") {
      celebrate();
      void sound().unlock().then(() => {
        sound().play("celebrate");
        setTimeout(() => celebrate(), 600);
      });
    }
  }, [mode]);

  return (
    <main className={mode === "student" ? "kid-bg relative min-h-screen px-4 py-10" : "min-h-screen bg-slate-50 px-4 py-10"}>
      <div className="relative z-10 mx-auto max-w-3xl">
        {mode === "student" && (
          <div className="mb-4 flex justify-center">
            <Mascot mood="cheer" size={160} />
          </div>
        )}

        <div className="kid-card p-6 sm:p-10">
          {/* Header breadcrumb + greeting */}
          <div className="text-center">
            <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-700">
              {test.subject} · Language Proficiency Assessment
            </span>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-800 sm:text-4xl">
              {mode === "student" ? <>🎉 Hi {lead.name}!</> : <>Result for {lead.name}</>}
            </h1>
          </div>

          {/* Level hero */}
          <div className="mt-8 flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-br from-pink-500 via-violet-500 to-indigo-600 p-8 text-center text-white shadow-2xl sm:p-10">
            <div className="text-xs font-black uppercase tracking-widest opacity-80">
              Your level
            </div>
            <div className="relative">
              <div className="text-7xl font-black sm:text-8xl drop-shadow kid-bounce-in">
                {band.code}
              </div>
              <span className="absolute -right-4 -top-4 text-4xl kid-sparkle">✨</span>
              <span className="absolute -left-6 top-2 text-3xl kid-sparkle">⭐</span>
            </div>
            <div className="text-xl font-black sm:text-2xl">{kidCopy.label}</div>

            {/* Two prominent stat chunks */}
            <div className="grid w-full max-w-sm grid-cols-2 gap-3 rounded-2xl bg-white/20 p-4 backdrop-blur sm:p-5">
              <div className="border-r border-white/25 pr-3 text-center">
                <div className="text-3xl font-black leading-none sm:text-4xl">{pct}%</div>
                <div className="mt-1.5 text-[10px] font-black uppercase tracking-widest opacity-80 sm:text-xs">
                  Your score
                </div>
              </div>
              <div className="pl-3 text-center">
                <div className="text-3xl font-black leading-none sm:text-4xl">
                  {lead.totalScore}
                  <span className="text-xl opacity-70 sm:text-2xl"> / {lead.maxScore}</span>
                </div>
                <div className="mt-1.5 text-[10px] font-black uppercase tracking-widest opacity-80 sm:text-xs">
                  ⭐ Stars earned
                </div>
              </div>
            </div>

            <p className="max-w-md text-base font-semibold opacity-95">{kidCopy.blurb}</p>
          </div>

          {/* Your snapshot */}
          {Object.keys(dims).length > 0 && (
            <div className="mt-8">
              <h2 className="mb-1 text-center text-sm font-black uppercase tracking-wider text-slate-600">
                🔍 Your snapshot
              </h2>
              <p className="mb-4 text-center text-xs italic text-slate-500">
                Based on a quick 15-min check. A full picture takes more than one test!
              </p>
              <div className="space-y-3">
                {Object.entries(dims)
                  .sort((a, b) => b[1] - a[1])
                  .map(([dim, score]) => {
                    const emoji = DIM_EMOJI[dim] ?? "💫";
                    const color = score >= 75 ? "from-emerald-400 to-teal-500"
                              : score >= 60 ? "from-sky-400 to-indigo-500"
                              : score >= 40 ? "from-amber-400 to-orange-500"
                              : "from-rose-400 to-pink-500";
                    return (
                      <div key={dim} className="rounded-2xl border-2 border-slate-100 bg-white p-3">
                        <div className="mb-1 flex items-center justify-between text-sm font-bold">
                          <span className="flex items-center gap-2">
                            <span className="text-xl">{emoji}</span>
                            <span className="text-slate-700">{dim}</span>
                          </span>
                          <span className="text-slate-600">{score}%</span>
                        </div>
                        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-3 rounded-full bg-gradient-to-r ${color} transition-all`}
                            style={{ width: `${Math.max(3, score)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* CTA — student only */}
          {mode === "student" && (
            <div className="mt-8 rounded-3xl border-4 border-dashed border-violet-300 bg-gradient-to-br from-violet-50 to-pink-50 p-6 text-left sm:p-8">
              <div className="text-center">
                <div className="text-4xl">🚀</div>
                <h3 className="mt-2 text-xl font-black text-violet-900 sm:text-2xl">
                  Ready to go from {band.code} to{" "}
                  <span className="text-pink-600">{nextLevel(band.code)}</span>?
                </h3>
              </div>

              <div className="mt-4 space-y-3 text-sm font-medium text-slate-700 sm:text-[15px]">
                <p>
                  This quick test gives us a helpful <b>snapshot</b> — but a 15-minute
                  assessment can only tell us so much. Every child has unique strengths
                  and blind spots that only show up in real conversation.
                </p>
                <p>
                  That&apos;s why our tutor will personally meet with{" "}
                  <b className="text-violet-700">{firstName}</b> to understand the full
                  picture — including <b>speaking</b>, <b>confidence</b>, and{" "}
                  <b>learning style</b>.
                </p>
              </div>

              <div className="mt-5 rounded-2xl border-2 border-violet-200 bg-white/70 p-4">
                <div className="mb-2 text-center text-sm font-black uppercase tracking-wider text-violet-700">
                  🎁 Your complimentary 30-min face-to-face session includes:
                </div>
                <ul className="space-y-1.5 text-sm font-medium text-slate-700">
                  <li className="flex gap-2">
                    <span>✅</span>
                    <span>A relaxed 1-on-1 with your child — <i>parents warmly welcome to join!</i></span>
                  </li>
                  <li className="flex gap-2">
                    <span>✅</span>
                    <span>Honest feedback on strengths and gaps</span>
                  </li>
                  <li className="flex gap-2">
                    <span>✅</span>
                    <span>A personalised language learning roadmap built together, on the spot</span>
                  </li>
                </ul>
              </div>

              <p className="mt-4 text-center text-sm font-semibold text-violet-800">
                No pressure. No hard sell. Just clarity and a clear next step for your child. 💛
              </p>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <a
                  href={`https://wa.me/?text=Hi!%20I%27m%20${encodeURIComponent(firstName)}%27s%20parent.%20We%20just%20finished%20the%20free%20language%20assessment%20and%20would%20love%20to%20book%20the%20complimentary%2030-min%20face-to-face%20session.`}
                  className="kid-btn kid-btn-green inline-flex"
                >
                  💬 WhatsApp a Tutor
                </a>
                <a
                  href={`mailto:hello@example.com?subject=${encodeURIComponent("30-min session booking — " + firstName)}&body=${encodeURIComponent("Hi! We just completed the free language assessment and would like to book the complimentary 30-min face-to-face session.")}`}
                  className="inline-flex items-center justify-center rounded-full border-2 border-violet-300 bg-white px-5 py-3 text-sm font-bold text-violet-700 hover:bg-violet-50"
                >
                  📧 Email Us
                </a>
              </div>
            </div>
          )}

          {/* Test summary */}
          <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs font-bold text-slate-500">
            <div className="rounded-xl bg-slate-50 p-2">
              <div className="text-lg">📅</div>
              {lead.submittedAt
                ? new Date(lead.submittedAt).toLocaleDateString("en-GB", {
                    day: "2-digit", month: "short", year: "numeric",
                  })
                : "—"}
            </div>
            <div className="rounded-xl bg-slate-50 p-2">
              <div className="text-lg">⏱</div>
              {minutesUsed != null ? `Completed in ${minutesUsed} min` : "—"}
            </div>
            <div className="rounded-xl bg-slate-50 p-2">
              <div className="text-lg">✅</div>
              Submitted
            </div>
          </div>

          {/* Internal extras */}
          {mode === "internal" && (
            <div className="mt-6 grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm sm:grid-cols-2">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Lead contact</div>
                <div>📧 {lead.email}</div>
                <div>📱 {lead.phone}</div>
                <div>📍 {lead.location} · age {lead.age}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Integrity</div>
                <div>Tab blur events: <b>{lead.tabBlurCount}</b></div>
                <div>Status: <b>{lead.status}</b></div>
              </div>
            </div>
          )}

          {/* Band legend */}
          <details className="mt-6 rounded-2xl border-2 border-slate-100 bg-white p-4">
            <summary className="cursor-pointer text-sm font-black text-slate-600">
              › What does {band.code} mean? →
            </summary>
            <div className="mt-3 space-y-1.5 text-xs">
              {DEFAULT_BANDS.map((b) => (
                <div key={b.code} className="flex gap-3">
                  <span className={`inline-flex w-14 justify-center rounded px-1.5 py-0.5 font-mono font-black ${
                    b.code === band.code ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-700"
                  }`}>{b.code}</span>
                  <span className="font-bold">{b.label}</span>
                  <span className="text-slate-500">≥ {b.min}%</span>
                </div>
              ))}
            </div>
          </details>

          {mode === "student" && (
            <div className="mt-6 text-center">
              <Link href="/" className="text-sm font-bold text-slate-500 hover:text-violet-600">
                🏠 Back to home
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

const DIM_EMOJI: Record<string, string> = {
  VOCAB: "📚",
  GRAMMAR: "🧩",
  READING: "📖",
  LISTENING: "👂",
  WRITING: "✍️",
  SPEAKING: "🎤",
};

function nextLevel(code: string) {
  const order = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];
  const i = order.indexOf(code);
  return i >= 0 && i < order.length - 1 ? order[i + 1] : "C2+";
}

function safeJson(s: string) {
  try { return JSON.parse(s); } catch { return null; }
}
