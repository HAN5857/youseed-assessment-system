"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { sound } from "@/lib/sounds";
import { OptionCard } from "@/components/kids/OptionCard";

/**
 * One unscored warm-up question that teaches the UI before the scored test.
 * Selected response is *not* added to the scoring response map. Tap-to-skip
 * is always visible. Auto-completes on "Got it!" once an option is picked.
 */
export function PracticeRound({ onComplete }: { onComplete: () => void }) {
  const [picked, setPicked] = useState<string | null>(null);

  const options = [
    { key: "A", text: "Great!" },
    { key: "B", text: "Okay" },
    { key: "C", text: "A little nervous" },
    { key: "D", text: "Excited!" },
  ];

  const finish = () => {
    sound().play("next");
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 240, damping: 26 }}
      className="relative overflow-visible rounded-[28px] border-4 border-white bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-5 shadow-[0_10px_0_rgba(0,0,0,0.04),0_20px_50px_rgba(15,23,42,0.1)] sm:p-8"
    >
      {/* Decorative ribbon */}
      <div className="absolute -top-1 left-6 right-6 h-2 rounded-b-full bg-gradient-to-r from-emerald-400 via-pink-400 to-amber-400 kid-ribbon-shine" />

      {/* "Practice — doesn't count" chip */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow">
          ✨ Warm-up
        </span>
        <span className="rounded-full border-2 border-emerald-300 bg-white px-2.5 py-0.5 text-xs font-bold text-emerald-700">
          this one doesn&apos;t count 💛
        </span>
      </div>

      <p className="mb-6 whitespace-pre-wrap text-2xl font-bold leading-snug text-slate-800 sm:text-3xl">
        How are you feeling today?
      </p>
      <p className="mb-5 text-sm font-semibold text-slate-600">
        Pick any answer — there&apos;s no right or wrong. We&apos;re just stretching!
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((o, i) => (
          <OptionCard
            key={o.key}
            index={i}
            badge={o.key}
            text={o.text}
            selected={picked === o.key}
            onSelect={() => setPicked(o.key)}
          />
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => { sound().play("click"); onComplete(); }}
          className="rounded-full border-2 border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-500 shadow hover:bg-slate-50"
        >
          Skip warm-up
        </button>
        <button
          type="button"
          onClick={finish}
          disabled={!picked}
          className="kid-btn kid-btn-green disabled:opacity-50"
        >
          Got it! Let&apos;s start →
        </button>
      </div>
    </motion.div>
  );
}
