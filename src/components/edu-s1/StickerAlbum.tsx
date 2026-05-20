"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { sound } from "@/lib/sounds";

/**
 * Animated sticker album shown on the result page (S1 only).
 *
 * Renders one sticker for each completed question (max = pool length, which
 * is 20 for S1's forest theme). Stickers pop in with a stagger.
 */
export function StickerAlbum({
  earned,
  pool,
}: {
  earned: number;
  pool: readonly string[];
}) {
  const total = Math.min(earned, pool.length);
  const stickers = pool.slice(0, total);
  const [savedToast, setSavedToast] = useState(false);

  const onSave = () => {
    sound().play("success");
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1800);
  };

  return (
    <motion.section
      className="mt-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, type: "spring", stiffness: 240, damping: 26 }}
    >
      <div className="text-center">
        <h2 className="text-xl font-black tracking-tight text-slate-800 sm:text-2xl">
          🦋 Your Sticker Album
        </h2>
        <p className="mt-1 text-sm font-bold text-slate-500">
          You collected{" "}
          <span className="text-pink-600">{total}</span>{" "}
          {total === 1 ? "sticker" : "stickers"}!
        </p>
      </div>

      <div className="mt-4 rounded-3xl border-4 border-amber-200 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-4 shadow-inner sm:p-6">
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-5 sm:gap-3">
          {stickers.map((emoji, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -25, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{
                delay: 0.6 + i * 0.05,
                type: "spring",
                stiffness: 460,
                damping: 18,
              }}
              whileHover={{ scale: 1.15, rotate: 6 }}
              className="grid aspect-square place-items-center rounded-2xl border-2 border-amber-300 bg-white text-3xl shadow-sm sm:text-4xl"
            >
              {emoji}
            </motion.div>
          ))}
          {/* Empty slots if earned < pool length */}
          {Array.from({ length: pool.length - total }).map((_, i) => (
            <motion.div
              key={`empty-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 + total * 0.05 + i * 0.02 }}
              className="grid aspect-square place-items-center rounded-2xl border-2 border-dashed border-amber-200 bg-white/40 text-2xl text-amber-300"
              aria-hidden
            >
              ·
            </motion.div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-xs font-bold text-slate-500">
            Show this to your tutor — they&apos;ll be so proud! 💛
          </span>
          <button
            type="button"
            onClick={onSave}
            className="rounded-full border-2 border-amber-400 bg-white px-3 py-1.5 text-xs font-bold text-amber-700 shadow-sm hover:bg-amber-50 active:scale-95"
          >
            ⭐ Save album
          </button>
        </div>
      </div>

      {savedToast && (
        <motion.div
          className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-emerald-500 px-5 py-2 text-sm font-black text-white shadow-xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
        >
          ✅ Album saved to your screen — ask a parent to take a screenshot!
        </motion.div>
      )}
    </motion.section>
  );
}
