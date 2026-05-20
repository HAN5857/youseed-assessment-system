"use client";

// ─────────────────────────────────────────────────────────────────────────
// CalmExamRunner — visually identical to ExamRunner (all animations,
// mascot, AdventureMap, ChapterInterstitial, PracticeRound, sticker
// explosions, milestones, encouragement toasts, ribbon shine, corner
// stickers preserved). The only difference is the palette: YouSeed
// green/white instead of the playful pink/violet/yellow rainbow.
//
// Gated on S1 English + NEXT_PUBLIC_S1_CALM_FLAG=1.
// LINT: keep timer + autosave + tab-blur + submit logic in sync with
//       ./ExamRunner.tsx — they share the same backend contract.
// ─────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { getRenderer, FallbackRenderer } from "@/components/question-renderers";
import { sound } from "@/lib/sounds";
import { MascotReaction, type Reaction } from "@/components/kids/MascotReaction";
import { SoundToggle } from "@/components/kids/SoundToggle";
import { StarProgress } from "@/components/kids/StarProgress";
import { FinishDialog } from "@/components/kids/FinishDialog";
import { StickerExplosion } from "@/components/kids/StickerExplosion";
import { dimensionThemeCalm, milestoneForProgress } from "@/lib/dimension-theme";
import { useS1Edu } from "@/lib/s1-edu-flag";
import { getStickerPool } from "@/lib/s1-stickers";
import { speedyCopy, S1_MODULE_BOUNDARIES, type SeedyAnchor } from "@/lib/s1-edu-config";
import { useIdleTimeout } from "@/lib/use-idle-timeout";
import { AdventureMap } from "@/components/edu-s1/AdventureMap";
import { MascotSpeechBubble } from "@/components/edu-s1/MascotSpeechBubble";
import { PracticeRound } from "@/components/edu-s1/PracticeRound";
import { ChapterInterstitial, type ChapterId } from "@/components/edu-s1/ChapterInterstitial";
import { UiThemeProvider } from "@/lib/ui-theme";

type Q = {
  id: string; type: string; dimension: string; score: number;
  prompt: string; mediaUrl?: string | null; content: any;
};

const ENCOURAGE_PRIMARY = [
  "You're doing great!", "Keep it up!", "Awesome!", "You're a star!",
  "Nice one!", "Superb!", "Fantastic!", "Way to go!", "Brilliant!", "Smart move!",
];
// Upper-primary: confidence-building but academic, no exclamations or "you're a star".
const ENCOURAGE_UPPER = [
  "Good.", "Nice.", "Well done.", "On track.", "Keep going.",
  "Solid choice.", "Steady.", "Good thinking.", "Looking strong.", "Confident answer.",
];

const CORNER_STICKERS = ["⭐", "🌈", "🎈", "🎀", "🌟", "✨", "💫", "🎊", "🪄", "🍭"];

export function CalmExamRunner({
  leadId, title, subject, level, studentName, remainingSec, questions, initialResponses,
  tier = "primary",
}: {
  leadId: string;
  title: string;
  subject?: string;
  level?: string;
  studentName?: string;
  remainingSec: number;
  questions: Q[];
  initialResponses: Record<string, any>;
  /**
   * "primary" (S1-S3): playful decorations, corner stickers, ✨ toasts, ⭐ chips,
   *   bouncier spring transitions.
   * "upper-primary" (S4-S6): cleaner academic look — no corner stickers, no playful
   *   toast emoji, "marks" not "⭐ points", subtler springs. Same green theme,
   *   same framer-motion page slide system, same micro-interactions.
   */
  tier?: "primary" | "upper-primary";
}) {
  const upper = tier === "upper-primary";
  const edu = useS1Edu({ test: { subject: subject ?? null, level: level ?? null } });
  const stickerPool = useMemo(() => getStickerPool(subject, level), [subject, level]);
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [responses, setResponses] = useState<Record<string, any>>(initialResponses);
  const [secondsLeft, setSecondsLeft] = useState(remainingSec);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [milestone, setMilestone] = useState<string | null>(null);
  const [showFinish, setShowFinish] = useState(false);

  const [mascotReaction, setMascotReaction] = useState<Reaction>("idle");
  const [mascotPulse, setMascotPulse] = useState(0);
  const [stickerBurst, setStickerBurst] = useState(0);
  const [showStickers, setShowStickers] = useState(false);

  const [practiceComplete, setPracticeComplete] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(`s1edu_practice_${leadId}`) === "1";
  });
  const [speechAnchor, setSpeechAnchor] = useState<SeedyAnchor | null>(null);
  const [activeChapter, setActiveChapter] = useState<ChapterId | null>(null);
  const shownChaptersRef = useRef<Set<ChapterId>>(new Set());
  const greetedRef = useRef(false);
  const halfwayFiredRef = useRef(false);
  const lateFiredRef = useRef(false);
  const nudgedQuestionsRef = useRef<Set<number>>(new Set());

  const blurDelta = useRef(0);
  const submittedRef = useRef(false);
  const prevAnsweredRef = useRef(0);
  const prevResponseSerialRef = useRef<string>("");

  useEffect(() => {
    (async () => {
      const e = sound();
      await e.unlock();
      const muted = sessionStorage.getItem("snd_muted") === "1";
      const musicOff = sessionStorage.getItem("snd_music") === "0";
      if (!muted && !musicOff) {
        sessionStorage.setItem("snd_music", "1");
        e.startMusic();
      }
    })();
    return () => { sound().stopMusic(); };
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          handleSubmit(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onBlur = () => { blurDelta.current += 1; };
    const onVis = () => { if (document.hidden) blurDelta.current += 1; };
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  useEffect(() => {
    const t = setInterval(() => { void autosave(); }, 20000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [responses]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (submittedRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  async function autosave() {
    const delta = blurDelta.current;
    blurDelta.current = 0;
    try {
      await fetch(`/api/lead/${leadId}/autosave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses, tabBlurDelta: delta }),
      });
    } catch { /* ignore */ }
  }

  async function handleSubmit(timedOut = false) {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    sound().stopMusic();
    sound().play("finish");
    try {
      await fetch(`/api/lead/${leadId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses, timedOut }),
      });
      router.push(`/test/attempt/${leadId}/result`);
    } catch {
      submittedRef.current = false;
      setSubmitting(false);
      alert("Submission failed. Please try again.");
    }
  }

  function goNext() {
    if (idx < questions.length - 1) {
      sound().play("next");
      const list = upper ? ENCOURAGE_UPPER : ENCOURAGE_PRIMARY;
      showToast(list[Math.floor(Math.random() * list.length)]);
      setDirection(1);
      setIdx(idx + 1);
    }
  }
  function goPrev() {
    if (idx > 0) {
      sound().play("click");
      setDirection(-1);
      setIdx(idx - 1);
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1400);
  }

  useEffect(() => {
    const serial = JSON.stringify(responses);
    if (serial === prevResponseSerialRef.current) return;
    if (prevResponseSerialRef.current === "") {
      prevResponseSerialRef.current = serial;
      return;
    }
    const debounceMs = edu.toneDownReactions ? 600 : 0;
    const fire = () => {
      const moods: Reaction[] = ["peek", "cheer", "clap"];
      setMascotReaction(moods[Math.floor(Math.random() * moods.length)]);
      setMascotPulse((p) => p + 1);
      prevResponseSerialRef.current = serial;
    };
    if (debounceMs === 0) {
      fire();
      const t = setTimeout(() => setMascotReaction("idle"), 950);
      return () => clearTimeout(t);
    }
    const debounceT = setTimeout(fire, debounceMs);
    const idleT = setTimeout(() => setMascotReaction("idle"), debounceMs + 950);
    return () => { clearTimeout(debounceT); clearTimeout(idleT); };
  }, [responses, edu.toneDownReactions]);

  const q = questions[idx];
  const Renderer = q ? getRenderer(q.type) ?? FallbackRenderer : FallbackRenderer;
  const theme = dimensionThemeCalm(q?.dimension ?? "");

  const answeredSet = useMemo(() => {
    const s = new Set<number>();
    questions.forEach((qq, i) => { if (responses[qq.id] != null) s.add(i); });
    return s;
  }, [responses, questions]);
  const answeredCount = answeredSet.size;

  useEffect(() => {
    if (answeredCount > prevAnsweredRef.current) {
      const raw = milestoneForProgress(answeredCount, questions.length);
      // Upper-primary: strip the leading emoji + soften copy.
      const m = raw && upper
        ? raw.replace(/^\W+\s*/u, "")     // drop leading emoji + whitespace
             .replace("you've got this!", "great pace.")
             .replace("So close!", "Nearly done.")
             .replace("One more to go!", "One more to answer.")
             .replace("Great start!", "Good start.")
        : raw;
      if (m) {
        setMilestone(m);
        sound().play("success");
        // Sticker burst only on primary tier — older students find it noisy.
        if (!upper) {
          setStickerBurst((b) => b + 1);
          setShowStickers(true);
        }
        const t1 = upper ? null : setTimeout(() => setShowStickers(false), 1700);
        const t2 = setTimeout(() => setMilestone(null), upper ? 1800 : 2400);
        prevAnsweredRef.current = answeredCount;
        return () => { if (t1) clearTimeout(t1); clearTimeout(t2); };
      }
    }
    prevAnsweredRef.current = answeredCount;
  }, [answeredCount, questions.length, upper]);

  useEffect(() => {
    if (!edu.mascotSpeech || !practiceComplete || greetedRef.current) return;
    greetedRef.current = true;
    setSpeechAnchor("greeting");
  }, [edu.mascotSpeech, practiceComplete]);

  useEffect(() => {
    if (!edu.chapterInterstitial || !practiceComplete) return;
    const map: Array<[ChapterId, number]> = [
      ["vocab",   S1_MODULE_BOUNDARIES.vocab],
      ["grammar", S1_MODULE_BOUNDARIES.grammar],
      ["reading", S1_MODULE_BOUNDARIES.reading],
      ["writing", S1_MODULE_BOUNDARIES.writing],
    ];
    const hit = map.find(([, atIdx]) => atIdx === idx);
    if (hit && !shownChaptersRef.current.has(hit[0])) {
      shownChaptersRef.current.add(hit[0]);
      setActiveChapter(hit[0]);
      setSpeechAnchor(`round-${hit[0]}` as SeedyAnchor);
    }
  }, [idx, edu.chapterInterstitial, practiceComplete]);

  useEffect(() => {
    if (!edu.mascotSpeech) return;
    const half = Math.floor(questions.length / 2);
    if (!halfwayFiredRef.current && answeredCount === half) {
      halfwayFiredRef.current = true;
      setSpeechAnchor("halfway");
    }
    if (!lateFiredRef.current && answeredCount === questions.length - 2) {
      lateFiredRef.current = true;
      setSpeechAnchor("late");
    }
  }, [answeredCount, questions.length, edu.mascotSpeech]);

  const idle = useIdleTimeout(30_000, [idx, JSON.stringify(responses)]);
  useEffect(() => {
    if (!edu.idleNudge || !practiceComplete) return;
    if (idle && !nudgedQuestionsRef.current.has(idx)) {
      nudgedQuestionsRef.current.add(idx);
      setSpeechAnchor("idle");
    }
  }, [idle, idx, edu.idleNudge, practiceComplete]);

  const mm = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const ss = (secondsLeft % 60).toString().padStart(2, "0");
  const timeLow = secondsLeft < 60;

  const seedyMessage = speechAnchor
    ? speedyCopy(speechAnchor, { name: studentName ?? "friend" })
    : null;

  function completePractice() {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(`s1edu_practice_${leadId}`, "1");
    }
    setPracticeComplete(true);
  }

  const sticker1 = CORNER_STICKERS[idx % CORNER_STICKERS.length];
  const sticker2 = CORNER_STICKERS[(idx * 7 + 3) % CORNER_STICKERS.length];

  // Upper-primary uses a slightly more restrained slide + no scale bounce.
  // Primary keeps the original 80px slide + 0.96 scale spring.
  const pageVariants = upper
    ? {
        enter:  (dir: 1 | -1) => ({ x: dir === 1 ? 48 : -48, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit:   (dir: 1 | -1) => ({ x: dir === 1 ? -36 : 36, opacity: 0 }),
      }
    : {
        enter:  (dir: 1 | -1) => ({ x: dir === 1 ? 80 : -80, opacity: 0, scale: 0.96 }),
        center: { x: 0, opacity: 1, scale: 1 },
        exit:   (dir: 1 | -1) => ({ x: dir === 1 ? -60 : 60, opacity: 0, scale: 0.97 }),
      };
  const pageTransition = upper
    ? { type: "spring" as const, stiffness: 280, damping: 32 }
    : { type: "spring" as const, stiffness: 220, damping: 26 };

  return (
    <UiThemeProvider mode="calm" tier={tier}>
      <div className={`calm-ui ${upper ? "calm-ui-upper" : ""} kid-bg-green relative flex min-h-screen flex-col`}>
        <StickerExplosion show={showStickers} key={`burst-${stickerBurst}`} pool={stickerPool} />

        {/* Top bar */}
        <header className={`sticky top-0 z-10 backdrop-blur ${upper ? "border-b border-[#DDEFE4] bg-white/90" : "border-b-4 border-white/60 bg-white/80"}`}>
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="hidden sm:block">
                <MascotReaction reaction={mascotReaction} pulseKey={mascotPulse} size={upper ? 40 : 48} />
              </div>
              <div className="min-w-0">
                <p className={`truncate text-slate-800 ${upper ? "text-sm font-semibold sm:text-base" : "text-sm font-black sm:text-base"}`}>{title}</p>
                <p className={`text-xs ${upper ? "font-medium text-[#6B7280]" : "font-bold text-slate-500"}`}>
                  Question {idx + 1} of {questions.length} · {answeredCount} answered
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {upper ? (
                <div
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-mono text-base font-bold tabular-nums sm:text-lg ${
                    timeLow
                      ? "border-red-200 bg-red-50 text-red-700 kid-pulse"
                      : "border-[#DDEFE4] bg-[#EAF8F0] text-[#138a4a]"
                  }`}
                  aria-label="Time remaining"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <circle cx="12" cy="13" r="8" />
                    <path d="M12 9v4l2.5 2" />
                    <path d="M9 2h6" />
                  </svg>
                  {mm}:{ss}
                </div>
              ) : (
                <div className={`rounded-2xl border-2 px-3 py-1.5 font-mono text-base font-black tabular-nums shadow-sm sm:text-lg ${
                  timeLow ? "border-red-300 bg-red-50 text-red-700 kid-pulse" : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}>
                  ⏰ {mm}:{ss}
                </div>
              )}
              <SoundToggle showMusic={true} />
            </div>
          </div>
          <div className={`mx-auto max-w-5xl px-4 pb-3 ${edu.adventureMap ? "bg-gradient-to-r from-emerald-500/85 via-green-500/85 to-teal-500/85 -mx-0 rounded-b-2xl py-3 px-4" : ""}`}>
            {edu.adventureMap ? (
              <AdventureMap total={questions.length} answered={answeredSet} current={idx} />
            ) : (
              <StarProgress total={questions.length} answered={answeredSet} current={idx} />
            )}
          </div>
        </header>

        {/* Body */}
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
          {edu.practiceRound && !practiceComplete ? (
            <PracticeRound onComplete={completePractice} />
          ) : (
          <>
          <div className="relative">
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.div
                key={idx}
                custom={direction}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={pageTransition}
                className={
                  upper
                    ? `relative overflow-visible rounded-2xl border border-[#DDEFE4] bg-white p-6 shadow-[0_2px_8px_rgba(15,23,42,0.04),0_16px_40px_rgba(15,23,42,0.06)] sm:p-8`
                    : `relative overflow-visible rounded-[28px] border-4 border-white bg-gradient-to-br ${theme.bg} p-5 shadow-[0_10px_0_rgba(0,0,0,0.04),0_20px_50px_rgba(15,23,42,0.1)] sm:p-8`
                }
              >
                {/* Top ribbon — same shine animation in both tiers; thinner + monochrome on upper. */}
                {upper ? (
                  <div className="absolute -top-px left-8 right-8 h-1 rounded-b-full bg-[#18A65B]" />
                ) : (
                  <div className={`kid-ribbon-shine absolute -top-1 left-6 right-6 h-2 rounded-b-full bg-gradient-to-r ${theme.gradient}`} />
                )}

                {/* Corner stickers — only for primary tier. */}
                {!upper && (
                  <>
                    <span
                      className="pointer-events-none absolute -right-2 -top-4 select-none text-3xl kid-float"
                      style={{ animationDelay: "0.2s" }}
                      aria-hidden
                    >
                      {sticker1}
                    </span>
                    <span
                      className="pointer-events-none absolute -left-2 bottom-6 select-none text-3xl kid-float"
                      style={{ animationDelay: "0.9s" }}
                      aria-hidden
                    >
                      {sticker2}
                    </span>
                  </>
                )}

                {/* Upper-primary topic icon — soft green-gradient badge with ring,
                    shadow, entry bounce + gentle float. Driven by content.topicIcon
                    so questions with their own media/passage (audio, reading) skip
                    the decoration. */}
                {upper && q.content?.topicIcon && (
                  <div
                    key={`topic-${idx}`}
                    className="pointer-events-none absolute right-5 top-5 kid-float"
                    aria-hidden
                  >
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#EAF8F0] to-[#DDEFE4] text-3xl shadow-[0_4px_14px_rgba(24,166,91,0.15)] ring-1 ring-[#DDEFE4] kid-bounce-in sm:h-16 sm:w-16 sm:text-[34px]">
                      <span className="select-none">{q.content.topicIcon}</span>
                    </div>
                  </div>
                )}

                <div className={`mb-4 flex flex-wrap items-center gap-2 ${upper && q.content?.topicIcon ? "min-h-[60px] pr-20 sm:min-h-[68px] sm:pr-24" : ""}`}>
                  {upper ? (
                    <>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF8F0] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#138a4a]">
                        {theme.label}
                      </span>
                      <span className="rounded-full border border-[#DDEFE4] bg-white px-2.5 py-0.5 text-[11px] font-semibold text-[#6B7280]">
                        {q.score} {q.score === 1 ? "mark" : "marks"}
                      </span>
                      {q.content?.topicLabel && (
                        <span className="rounded-full border border-[#DDEFE4] bg-[#F7FBF8] px-2.5 py-0.5 text-[11px] font-semibold text-[#6B7280]">
                          {q.content.topicLabel}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <span className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${theme.gradient} px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow`}>
                        <span className="text-base">{theme.emoji}</span>
                        {theme.label}
                      </span>
                      <span className={`rounded-full border-2 border-current bg-white px-2.5 py-0.5 text-xs font-bold ${theme.accent}`}>
                        {q.score} ⭐ points
                      </span>
                    </>
                  )}
                </div>

                <Renderer
                  prompt={q.prompt}
                  mediaUrl={q.mediaUrl ?? null}
                  content={q.content}
                  value={responses[q.id]}
                  onChange={(next) => setResponses({ ...responses, [q.id]: next })}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              onClick={goPrev}
              disabled={idx === 0}
              className={
                upper
                  ? "rounded-full border border-[#DDEFE4] bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-[#F7FBF8] disabled:cursor-not-allowed disabled:opacity-40"
                  : "rounded-full border-2 border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-600 shadow hover:bg-slate-50 disabled:opacity-40"
              }
            >
              ← Back
            </button>
            {idx < questions.length - 1 ? (
              upper ? (
                <button
                  onClick={goNext}
                  className="inline-flex items-center gap-2 rounded-full bg-[#18A65B] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:brightness-110 active:translate-y-px"
                >
                  Next
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button onClick={goNext} className="kid-btn kid-btn-green">Next →</button>
              )
            ) : (
              upper ? (
                <button
                  onClick={() => { sound().play("click"); setShowFinish(true); }}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-full bg-[#18A65B] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:brightness-110 active:translate-y-px disabled:opacity-60"
                >
                  {submitting ? "Submitting…" : "Submit"}
                </button>
              ) : (
                <button
                  onClick={() => { sound().play("click"); setShowFinish(true); }}
                  disabled={submitting}
                  className="kid-btn kid-btn-green"
                >
                  {submitting ? "Submitting… 🎉" : "Finish! 🏁"}
                </button>
              )
            )}
          </div>
          </>
          )}
        </main>

        {edu.mascotSpeech && (
          <MascotSpeechBubble
            message={seedyMessage}
            onDismiss={() => setSpeechAnchor(null)}
            speak={edu.voiceMascot}
          />
        )}

        {edu.chapterInterstitial && (
          <ChapterInterstitial
            chapter={activeChapter}
            onDismiss={() => setActiveChapter(null)}
          />
        )}

        <AnimatePresence>
          {toast && (
            <motion.div
              className={
                upper
                  ? "pointer-events-none fixed left-1/2 top-24 z-50 -translate-x-1/2 rounded-full bg-[#18A65B] px-5 py-1.5 text-xs font-semibold text-white shadow-lg"
                  : "pointer-events-none fixed left-1/2 top-28 z-50 -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-2 text-sm font-black text-white shadow-xl"
              }
              initial={{ y: -20, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 350, damping: 22 }}
            >
              {upper ? toast : `${toast} ✨`}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {milestone && (
            <motion.div
              className="pointer-events-none fixed left-1/2 top-40 z-50 -translate-x-1/2"
              initial={{ y: -40, opacity: 0, scale: upper ? 0.92 : 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 240, damping: 18 }}
            >
              <div className={
                upper
                  ? "rounded-2xl border border-[#DDEFE4] bg-white px-5 py-2.5 text-center text-sm font-semibold text-[#138a4a] shadow-xl"
                  : "rounded-3xl bg-gradient-to-r from-lime-400 via-green-500 to-emerald-500 px-6 py-3 text-center text-base font-black text-white shadow-2xl sm:text-lg"
              }>
                {milestone}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <FinishDialog
          variant="calm"
          open={showFinish}
          answered={answeredCount}
          total={questions.length}
          onCancel={() => setShowFinish(false)}
          onConfirm={() => { setShowFinish(false); void handleSubmit(false); }}
        />
      </div>
    </UiThemeProvider>
  );
}
