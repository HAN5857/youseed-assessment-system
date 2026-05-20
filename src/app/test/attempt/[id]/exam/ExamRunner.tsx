"use client";

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
import { dimensionTheme, milestoneForProgress } from "@/lib/dimension-theme";
import { useS1Edu } from "@/lib/s1-edu-flag";
import { getStickerPool } from "@/lib/s1-stickers";
import { speedyCopy, S1_MODULE_BOUNDARIES, type SeedyAnchor } from "@/lib/s1-edu-config";
import { useIdleTimeout } from "@/lib/use-idle-timeout";
import { AdventureMap } from "@/components/edu-s1/AdventureMap";
import { MascotSpeechBubble } from "@/components/edu-s1/MascotSpeechBubble";
import { PracticeRound } from "@/components/edu-s1/PracticeRound";
import { ChapterInterstitial, type ChapterId } from "@/components/edu-s1/ChapterInterstitial";

type Q = {
  id: string; type: string; dimension: string; score: number;
  prompt: string; mediaUrl?: string | null; content: any;
};

const ENCOURAGE = [
  "You're doing great!", "Keep it up!", "Awesome!", "You're a star!",
  "Nice one!", "Superb!", "Fantastic!", "Way to go!", "Brilliant!", "Smart move!",
];

const CORNER_STICKERS = ["⭐", "🌈", "🎈", "🎀", "🌟", "✨", "💫", "🎊", "🪄", "🍭"];

export function ExamRunner({
  leadId, title, subject, level, studentName, remainingSec, questions, initialResponses,
}: {
  leadId: string;
  title: string;
  subject?: string;
  level?: string;
  studentName?: string;
  remainingSec: number;
  questions: Q[];
  initialResponses: Record<string, any>;
  // Accepted for prop-shape parity with CalmExamRunner — playful runner is
  // S2/S3-only via current gating, so tier is always "primary" here.
  tier?: "primary" | "upper-primary";
}) {
  // S1 Edutainment flags — when subject/level isn't S1-English, every flag is false.
  const edu = useS1Edu({ test: { subject: subject ?? null, level: level ?? null } });
  // Themed sticker pool (forest set on S1; default elsewhere).
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

  // Mascot + sticker explosion controllers
  const [mascotReaction, setMascotReaction] = useState<Reaction>("idle");
  const [mascotPulse, setMascotPulse] = useState(0);
  const [stickerBurst, setStickerBurst] = useState(0); // increments per fire
  const [showStickers, setShowStickers] = useState(false);

  // S1 Edutainment state
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

  // Unlock audio + auto-start BGM on mount
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

  // Timer
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

  // Tab-blur counter
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

  // Autosave every 20s
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
      showToast(ENCOURAGE[Math.floor(Math.random() * ENCOURAGE.length)]);
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

  // Trigger mascot reaction on a fresh answer change.
  // When the S1 edu upgrade is active, debounce by 600ms so the mascot only
  // reacts to *committed* answers — not to every keystroke inside FILL inputs.
  // Otherwise (legacy mode), keep the original instant-fire behaviour.
  useEffect(() => {
    const serial = JSON.stringify(responses);
    if (serial === prevResponseSerialRef.current) return;
    if (prevResponseSerialRef.current === "") {
      // First mount — no reaction, just record baseline
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
  const theme = dimensionTheme(q?.dimension ?? "");

  const answeredSet = useMemo(() => {
    const s = new Set<number>();
    questions.forEach((qq, i) => { if (responses[qq.id] != null) s.add(i); });
    return s;
  }, [responses, questions]);
  const answeredCount = answeredSet.size;

  // Milestone detection — fires when answered count crosses a threshold.
  // Also triggers a sticker explosion.
  useEffect(() => {
    if (answeredCount > prevAnsweredRef.current) {
      const m = milestoneForProgress(answeredCount, questions.length);
      if (m) {
        setMilestone(m);
        sound().play("success");
        // Fire sticker explosion
        setStickerBurst((b) => b + 1);
        setShowStickers(true);
        const t1 = setTimeout(() => setShowStickers(false), 1700);
        const t2 = setTimeout(() => setMilestone(null), 2400);
        prevAnsweredRef.current = answeredCount;
        return () => { clearTimeout(t1); clearTimeout(t2); };
      }
    }
    prevAnsweredRef.current = answeredCount;
  }, [answeredCount, questions.length]);

  // ── S1 Edutainment effects ──────────────────────────────────────────
  // Greeting fires once on first scored-question mount (after practice)
  useEffect(() => {
    if (!edu.mascotSpeech || !practiceComplete || greetedRef.current) return;
    greetedRef.current = true;
    setSpeechAnchor("greeting");
  }, [edu.mascotSpeech, practiceComplete]);

  // Chapter interstitials: fire on entering a module boundary, once per module
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
      // Speech bubble follows the chapter (after interstitial dismisses)
      setSpeechAnchor(`round-${hit[0]}` as SeedyAnchor);
    }
  }, [idx, edu.chapterInterstitial, practiceComplete]);

  // Halfway + late-test pep talks (effort-framed)
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

  // Idle nudge — once per question after 30s of no input
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

  // Resolve current Seedy speech message (or null when nothing to say)
  const seedyMessage = speechAnchor
    ? speedyCopy(speechAnchor, { name: studentName ?? "friend" })
    : null;

  // Mark practice complete + persist (called by PracticeRound onComplete)
  function completePractice() {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(`s1edu_practice_${leadId}`, "1");
    }
    setPracticeComplete(true);
  }

  // Stable random sticker pair per question
  const sticker1 = CORNER_STICKERS[idx % CORNER_STICKERS.length];
  const sticker2 = CORNER_STICKERS[(idx * 7 + 3) % CORNER_STICKERS.length];

  // Page-transition variants — slide direction depends on next/prev
  const pageVariants = {
    enter: (dir: 1 | -1) => ({
      x: dir === 1 ? 80 : -80,
      opacity: 0,
      scale: 0.96,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: 1 | -1) => ({
      x: dir === 1 ? -60 : 60,
      opacity: 0,
      scale: 0.97,
    }),
  };

  return (
    <div className="kid-bg relative flex min-h-screen flex-col">
      {/* Sticker explosion overlay (mounted at root so it covers full viewport) */}
      <StickerExplosion show={showStickers} key={`burst-${stickerBurst}`} pool={stickerPool} />

      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b-4 border-white/60 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden sm:block">
              <MascotReaction reaction={mascotReaction} pulseKey={mascotPulse} size={48} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-slate-700 sm:text-base">{title}</p>
              <p className="text-xs font-bold text-slate-500">
                Q{idx + 1} of {questions.length} · {answeredCount} done
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`rounded-2xl border-2 px-3 py-1.5 font-mono text-base font-black tabular-nums shadow-sm sm:text-lg ${
              timeLow ? "border-red-300 bg-red-50 text-red-700 kid-pulse" : "border-violet-200 bg-violet-50 text-violet-700"
            }`}>
              ⏰ {mm}:{ss}
            </div>
            <SoundToggle showMusic={true} />
          </div>
        </div>
        <div className={`mx-auto max-w-5xl px-4 pb-3 ${edu.adventureMap ? "bg-gradient-to-r from-pink-500/85 via-violet-500/85 to-amber-500/85 -mx-0 rounded-b-2xl py-3 px-4" : ""}`}>
          {edu.adventureMap ? (
            <AdventureMap total={questions.length} answered={answeredSet} current={idx} />
          ) : (
            <StarProgress total={questions.length} answered={answeredSet} current={idx} />
          )}
        </div>
      </header>

      {/* Body */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        {/* Practice round gate — must complete before scored questions appear */}
        {edu.practiceRound && !practiceComplete ? (
          <PracticeRound onComplete={completePractice} />
        ) : (
        <>
        {/* AnimatePresence drives slide-in/slide-out per question */}
        <div className="relative">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={idx}
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 220, damping: 26 }}
              className={`relative overflow-visible rounded-[28px] border-4 border-white bg-gradient-to-br ${theme.bg} p-5 shadow-[0_10px_0_rgba(0,0,0,0.04),0_20px_50px_rgba(15,23,42,0.1)] sm:p-8`}
            >
              {/* Top coloured ribbon with shimmer */}
              <div className={`kid-ribbon-shine absolute -top-1 left-6 right-6 h-2 rounded-b-full bg-gradient-to-r ${theme.gradient}`} />

              {/* Corner stickers */}
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

              {/* Dimension chip + points */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${theme.gradient} px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow`}>
                  <span className="text-base">{theme.emoji}</span>
                  {theme.label}
                </span>
                <span className={`rounded-full border-2 border-current bg-white px-2.5 py-0.5 text-xs font-bold ${theme.accent}`}>
                  {q.score} ⭐ points
                </span>
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

        {/* Nav buttons */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            onClick={goPrev}
            disabled={idx === 0}
            className="rounded-full border-2 border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-600 shadow hover:bg-slate-50 disabled:opacity-40"
          >
            ← Back
          </button>
          {idx < questions.length - 1 ? (
            <button onClick={goNext} className="kid-btn">Next →</button>
          ) : (
            <button
              onClick={() => { sound().play("click"); setShowFinish(true); }}
              disabled={submitting}
              className="kid-btn kid-btn-green"
            >
              {submitting ? "Submitting… 🎉" : "Finish! 🏁"}
            </button>
          )}
        </div>
        </>
        )}
      </main>

      {/* Seedy speech bubble — anchored beneath the header mascot */}
      {edu.mascotSpeech && (
        <MascotSpeechBubble
          message={seedyMessage}
          onDismiss={() => setSpeechAnchor(null)}
          speak={edu.voiceMascot}
        />
      )}

      {/* Chapter interstitial — fullscreen overlay between modules */}
      {edu.chapterInterstitial && (
        <ChapterInterstitial
          chapter={activeChapter}
          onDismiss={() => setActiveChapter(null)}
        />
      )}

      {/* Encouragement toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="pointer-events-none fixed left-1/2 top-28 z-50 -translate-x-1/2 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 px-6 py-2 text-sm font-black text-white shadow-xl"
            initial={{ y: -20, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
          >
            {toast} ✨
          </motion.div>
        )}
      </AnimatePresence>

      {/* Milestone banner */}
      <AnimatePresence>
        {milestone && (
          <motion.div
            className="pointer-events-none fixed left-1/2 top-40 z-50 -translate-x-1/2"
            initial={{ y: -40, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 240, damping: 18 }}
          >
            <div className="rounded-3xl bg-gradient-to-r from-amber-400 via-pink-500 to-violet-500 px-6 py-3 text-center text-base font-black text-white shadow-2xl sm:text-lg">
              {milestone}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom finish confirm dialog */}
      <FinishDialog
        open={showFinish}
        answered={answeredCount}
        total={questions.length}
        onCancel={() => setShowFinish(false)}
        onConfirm={() => { setShowFinish(false); void handleSubmit(false); }}
      />
    </div>
  );
}
