"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { celebrate } from "@/components/kids/Confetti";
import { sound } from "@/lib/sounds";
import { seedyVoice } from "@/lib/seedy-voice";

/**
 * Brief cinematic shown on the result page before the CEFR card reveals.
 *
 * Sequence (~3s, skippable on tap):
 *   0.0s  — backdrop fades in, Seedy walks in from the left
 *   0.4s  — speech bubble: "You did it, {firstName}! Look what we collected 🎉"
 *   1.4s  — castle gates draw and open
 *   2.2s  — confetti burst + "celebrate" sound (applause + cheer)
 *   3.0s  — scene dissolves; parent unmounts after onDismiss
 */
export function EndOfQuestScene({
  show,
  firstName,
  voice = true,
  onDismiss,
}: {
  show: boolean;
  firstName: string;
  voice?: boolean;
  onDismiss: () => void;
}) {
  const playedRef = useRef(false);

  useEffect(() => {
    if (!show || playedRef.current) return;
    playedRef.current = true;

    const message = `You did it, ${firstName}! Look what we collected 🎉`;
    if (voice) seedyVoice.speak(message);

    // Sequenced timers
    const tConfetti = setTimeout(() => {
      celebrate();
      void sound().unlock().then(() => sound().play("celebrate"));
    }, 2200);
    const tSecond = setTimeout(() => celebrate(), 2800);
    const tDismiss = setTimeout(() => onDismiss(), 3400);

    return () => {
      clearTimeout(tConfetti);
      clearTimeout(tSecond);
      clearTimeout(tDismiss);
      seedyVoice.cancel();
    };
  }, [show, firstName, voice, onDismiss]);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          onClick={onDismiss}
          aria-label="Skip celebration"
          className="fixed inset-0 z-50 grid place-items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Warm backdrop */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 60%, #fde68a 0%, #fbbf24 30%, #ec4899 70%, #7c3aed 100%)",
            }}
          />

          {/* Drifting stars */}
          {Array.from({ length: 18 }).map((_, i) => (
            <motion.span
              key={i}
              aria-hidden
              className="absolute select-none text-2xl text-white/80"
              initial={{
                x: (Math.random() - 0.5) * 600,
                y: (Math.random() - 0.5) * 600,
                rotate: Math.random() * 180,
                opacity: 0,
              }}
              animate={{
                opacity: [0, 1, 0.6],
                y: ["0%", "-20%", "10%"],
                rotate: [0, 90, 180],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 1.5,
              }}
            >
              ✨
            </motion.span>
          ))}

          {/* Castle silhouette — simple inline SVG */}
          <motion.svg
            viewBox="0 0 320 220"
            className="pointer-events-none absolute bottom-[18%] w-[280px] sm:w-[400px]"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.4, type: "spring", stiffness: 100, damping: 18 }}
            aria-hidden
          >
            <defs>
              <linearGradient id="stone" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fef3c7" />
                <stop offset="100%" stopColor="#facc15" />
              </linearGradient>
            </defs>
            {/* Two side towers */}
            <rect x="30" y="60" width="50" height="160" fill="url(#stone)" stroke="#92400e" strokeWidth="3" />
            <rect x="240" y="60" width="50" height="160" fill="url(#stone)" stroke="#92400e" strokeWidth="3" />
            {/* Crenellations on towers */}
            <path d="M30 60 L30 50 L40 50 L40 60 L50 60 L50 50 L60 50 L60 60 L70 60 L70 50 L80 50 L80 60 Z" fill="#92400e" />
            <path d="M240 60 L240 50 L250 50 L250 60 L260 60 L260 50 L270 50 L270 60 L280 60 L280 50 L290 50 L290 60 Z" fill="#92400e" />
            {/* Centre wall */}
            <rect x="80" y="100" width="160" height="120" fill="url(#stone)" stroke="#92400e" strokeWidth="3" />
            {/* Centre top crenellations */}
            <path d="M80 100 L80 90 L95 90 L95 100 L110 100 L110 90 L125 90 L125 100 L140 100 L140 90 L155 90 L155 100 L170 100 L170 90 L185 90 L185 100 L200 100 L200 90 L215 90 L215 100 L230 100 L230 90 L240 90 L240 100 Z" fill="#92400e" />
            {/* Gate */}
            <motion.path
              d="M140 220 L140 160 Q160 130 180 160 L180 220 Z"
              fill="#7c2d12"
              stroke="#3f1e0e"
              strokeWidth="3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 1.6, duration: 0.8 }}
            />
            {/* Flag on right tower */}
            <line x1="265" y1="50" x2="265" y2="20" stroke="#1f2937" strokeWidth="2" />
            <motion.path
              d="M265 22 L290 28 L265 35 Z"
              fill="#ef4444"
              animate={{ skewY: [0, -4, 4, -4, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.svg>

          {/* Seedy walks in from left */}
          <motion.div
            className="absolute bottom-[40%] -translate-y-1/2"
            initial={{ x: -260, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 60, damping: 12 }}
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 0.5, repeat: 5 }}
            >
              <Image
                src="/brand/youseed-logo.png"
                alt=""
                width={120}
                height={120}
                className="drop-shadow-2xl"
                aria-hidden
              />
            </motion.div>
          </motion.div>

          {/* Speech bubble */}
          <motion.div
            className="pointer-events-none absolute top-[20%] mx-6 max-w-md rounded-3xl border-4 border-white bg-white/95 p-5 text-center shadow-2xl"
            initial={{ y: 24, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 320, damping: 22 }}
          >
            <p className="text-xs font-black uppercase tracking-widest text-pink-600">Seedy says</p>
            <p className="mt-2 text-xl font-black leading-snug text-slate-800 sm:text-2xl">
              You did it, {firstName}! 🎉
            </p>
            <p className="mt-1 text-base font-bold text-slate-600 sm:text-lg">
              Look what we collected!
            </p>
          </motion.div>

          {/* Skip hint */}
          <p className="pointer-events-none absolute bottom-6 text-[11px] font-black uppercase tracking-widest text-white/80">
            tap anywhere to continue
          </p>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
