"use client";

import { AnimatePresence, motion } from "framer-motion";

const DEFAULT_STICKERS = ["⭐", "🌈", "🎈", "🎀", "🌟", "✨", "💫", "🎊", "🪄", "🍭", "🦄", "🏆"];

/**
 * Scatter ~14 stickers from the centre of the viewport outward in random
 * directions, with rotation and a slight gravity drift.
 *
 * Pass `pool` to override the sticker pool (e.g. themed forest set for S1).
 * When omitted, falls back to the generic celebratory pool.
 */
export function StickerExplosion({
  show,
  count = 14,
  durationMs = 1600,
  pool,
}: {
  show: boolean;
  count?: number;
  durationMs?: number;
  pool?: readonly string[];
}) {
  const stickers = pool && pool.length > 0 ? pool : DEFAULT_STICKERS;

  return (
    <AnimatePresence>
      {show && (
        <div className="pointer-events-none fixed inset-0 z-40 grid place-items-center">
          {Array.from({ length: count }).map((_, i) => {
            const sticker = stickers[i % stickers.length];
            // Random direction + distance, weighted upward then drifting down
            const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
            const distance = 220 + Math.random() * 140;
            const xEnd = Math.cos(angle) * distance;
            const yMid = Math.sin(angle) * distance - 60; // jump up a bit first
            const yEnd = yMid + 80 + Math.random() * 60; // gravity drag
            const rot = (Math.random() - 0.5) * 540;
            const dur = (durationMs / 1000) * (0.85 + Math.random() * 0.3);

            return (
              <motion.span
                key={i}
                className="absolute select-none text-4xl drop-shadow-lg"
                initial={{ opacity: 0, scale: 0, x: 0, y: 0, rotate: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  scale: [0, 1.2, 1, 0.8],
                  x: [0, xEnd * 0.6, xEnd],
                  y: [0, yMid, yEnd],
                  rotate: [0, rot * 0.5, rot],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: dur,
                  ease: "easeOut",
                  times: [0, 0.2, 0.7, 1],
                }}
                aria-hidden
              >
                {sticker}
              </motion.span>
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
}
