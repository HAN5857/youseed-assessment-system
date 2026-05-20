"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export type Reaction = "idle" | "peek" | "cheer" | "clap";

const variants = {
  idle: {
    y: 0, x: 0, rotate: 0, scale: 1,
    transition: { type: "spring" as const, stiffness: 200, damping: 18 },
  },
  peek: {
    y: [-2, -12, -2],
    rotate: [0, -6, 0],
    transition: { duration: 0.7, ease: "easeOut" as const },
  },
  cheer: {
    y: [0, -16, 0, -8, 0],
    rotate: [0, -8, 8, -4, 0],
    scale: [1, 1.12, 1.08, 1.05, 1],
    transition: { duration: 0.9, ease: "easeOut" as const },
  },
  clap: {
    rotate: [0, -10, 10, -8, 8, 0],
    scale: [1, 1.06, 1.06, 1.04, 1.02, 1],
    transition: { duration: 0.7, ease: "easeOut" as const },
  },
};

/**
 * Reactive mascot — drives a Framer Motion variant based on `reaction` prop.
 * Every time `reaction` changes, the variant re-fires.
 * `pulseKey` lets the parent re-trigger the same reaction (since changing the
 * key forces remount → re-animation).
 */
export function MascotReaction({
  reaction = "idle",
  pulseKey = 0,
  size = 56,
}: {
  reaction?: Reaction;
  pulseKey?: number;
  size?: number;
}) {
  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <motion.div
        key={`${reaction}-${pulseKey}`}
        variants={variants}
        initial="idle"
        animate={reaction}
        style={{ width: size, height: size }}
        aria-hidden
      >
        <Image
          src="/brand/youseed-logo.png"
          alt=""
          width={size}
          height={size}
          className="h-full w-full object-contain drop-shadow-md"
        />
      </motion.div>

      {/* Cheer/clap emit a few sparkle particles */}
      <AnimatePresence>
        {(reaction === "cheer" || reaction === "clap") && (
          <motion.span
            key={`sparkle-${pulseKey}`}
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {Array.from({ length: 5 }).map((_, i) => {
              const angle = (i / 5) * Math.PI * 2;
              return (
                <motion.span
                  key={i}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-base"
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0.4],
                    x: Math.cos(angle) * (size * 0.9),
                    y: Math.sin(angle) * (size * 0.9),
                  }}
                  transition={{ duration: 0.7, delay: i * 0.04 }}
                  aria-hidden
                >
                  ✨
                </motion.span>
              );
            })}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
