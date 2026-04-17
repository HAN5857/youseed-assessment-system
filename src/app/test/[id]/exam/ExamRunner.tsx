"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getRenderer, FallbackRenderer } from "@/components/question-renderers";
import { sound } from "@/lib/sounds";
import { Mascot } from "@/components/kids/Mascot";
import { SoundToggle } from "@/components/kids/SoundToggle";
import { StarProgress } from "@/components/kids/StarProgress";
import { FinishDialog } from "@/components/kids/FinishDialog";

type Q = {
  id: string; type: string; dimension: string; score: number;
  prompt: string; mediaUrl?: string | null; content: any;
};

const ENCOURAGE = [
  "You're doing great!", "Keep it up!", "Awesome!", "You're a star!",
  "Nice one!", "Superb!", "Fantastic!", "Way to go!",
];

export function ExamRunner({
  leadId, title, remainingSec, questions, initialResponses,
}: {
  leadId: string;
  title: string;
  remainingSec: number;
  questions: Q[];
  initialResponses: Record<string, any>;
}) {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>(initialResponses);
  const [secondsLeft, setSecondsLeft] = useState(remainingSec);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [animKey, setAnimKey] = useState(0);
  const [showFinish, setShowFinish] = useState(false);
  const blurDelta = useRef(0);
  const submittedRef = useRef(false);

  // On mount: unlock audio + auto-start background music (unless user previously muted)
  useEffect(() => {
    (async () => {
      const e = sound();
      await e.unlock();
      const muted = sessionStorage.getItem("snd_muted") === "1";
      const musicOff = sessionStorage.getItem("snd_music") === "0"; // explicit off
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
      router.push(`/test/${leadId}/result`);
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
      setIdx(idx + 1);
      setAnimKey((k) => k + 1);
    }
  }
  function goPrev() {
    if (idx > 0) {
      sound().play("click");
      setIdx(idx - 1);
      setAnimKey((k) => k + 1);
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1400);
  }

  const q = questions[idx];
  const Renderer = q ? getRenderer(q.type) ?? FallbackRenderer : FallbackRenderer;

  const answeredSet = useMemo(() => {
    const s = new Set<number>();
    questions.forEach((qq, i) => { if (responses[qq.id] != null) s.add(i); });
    return s;
  }, [responses, questions]);
  const answeredCount = answeredSet.size;

  const mm = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const ss = (secondsLeft % 60).toString().padStart(2, "0");
  const timeLow = secondsLeft < 60;

  return (
    <div className="kid-bg relative flex min-h-screen flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b-4 border-white/60 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden sm:block"><Mascot mood="cheer" size={44} /></div>
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
        <div className="mx-auto max-w-5xl px-4 pb-3">
          <StarProgress total={questions.length} answered={answeredSet} current={idx} />
        </div>
      </header>

      {/* Body */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <div key={animKey} className="kid-card p-5 sm:p-8 kid-slide-in">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-gradient-to-r from-pink-500 to-violet-500 px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow">
              {q.dimension}
            </span>
            <span className="text-xs font-bold text-slate-500">{q.score} ⭐ points</span>
          </div>
          <Renderer
            prompt={q.prompt}
            mediaUrl={q.mediaUrl ?? null}
            content={q.content}
            value={responses[q.id]}
            onChange={(next) => setResponses({ ...responses, [q.id]: next })}
          />
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
      </main>

      {/* Encouragement toast */}
      {toast && (
        <div className="pointer-events-none fixed left-1/2 top-28 z-50 -translate-x-1/2 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 px-6 py-2 text-sm font-black text-white shadow-xl kid-bounce-in">
          {toast} ✨
        </div>
      )}

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
