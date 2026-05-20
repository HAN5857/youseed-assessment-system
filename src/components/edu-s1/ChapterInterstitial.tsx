"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { sound } from "@/lib/sounds";

export type ChapterId = "vocab" | "grammar" | "reading" | "writing";

const CHAPTERS: Record<ChapterId, { number: string; title: string; subtitle: string; emoji: string; gradient: string }> = {
  vocab:   { number: "Round 1", title: "Word Forest",     subtitle: "Look closely at each word",     emoji: "🔤", gradient: "from-pink-400 to-rose-500" },
  grammar: { number: "Round 2", title: "Grammar Bridge",  subtitle: "Pick the one that sounds right", emoji: "📝", gradient: "from-sky-400 to-indigo-500" },
  reading: { number: "Round 3", title: "Story Vale",      subtitle: "Take your time and read",        emoji: "📖", gradient: "from-amber-400 to-orange-500" },
  writing: { number: "Round 4", title: "Sentence Castle", subtitle: "Let's build sentences together", emoji: "✍️", gradient: "from-emerald-400 to-teal-500" },
};

/**
 * Brief full-card overlay shown when entering a new module. Auto-dismisses
 * after 1.6s; tap anywhere to dismiss earlier. Plays a soft transition sound.
 */
export function ChapterInterstitial({
  chapter,
  onDismiss,
  autoDismissMs = 1600,
}: {
  chapter: ChapterId | null;
  onDismiss: () => void;
  autoDismissMs?: number;
}) {
  useEffect(() => {
    if (!chapter) return;
    sound().play("whoosh");
    const t = setTimeout(onDismiss, autoDismissMs);
    return () => clearTimeout(t);
  }, [chapter, autoDismissMs, onDismiss]);

  return (
    <AnimatePresence>
      {chapter && (
        <motion.button
          type="button"
          onClick={onDismiss}
          aria-label="Continue"
          className="fixed inset-0 z-40 grid place-items-center bg-slate-900/30 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.94 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -12, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 360, damping: 26 }}
            className={`mx-4 max-w-md rounded-3xl bg-gradient-to-br ${CHAPTERS[chapter].gradient} p-8 text-center text-white shadow-2xl sm:p-10`}
          >
            <motion.div
              className="text-6xl drop-shadow"
              animate={{ y: [0, -8, 0], rotate: [0, -6, 6, 0] }}
              transition={{ duration: 0.8 }}
              aria-hidden
            >
              {CHAPTERS[chapter].emoji}
            </motion.div>
            <p className="mt-3 text-xs font-black uppercase tracking-widest opacity-80">
              {CHAPTERS[chapter].number}
            </p>
            <h2 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
              {CHAPTERS[chapter].title}
            </h2>
            <p className="mt-2 text-sm font-semibold opacity-90 sm:text-base">
              {CHAPTERS[chapter].subtitle}
            </p>
            <p className="mt-5 text-[10px] font-bold uppercase tracking-widest opacity-70">
              tap to begin
            </p>
          </motion.div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
