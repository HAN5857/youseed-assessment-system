"use client";

import { motion } from "framer-motion";
import { S1_MAP_STATIONS } from "@/lib/s1-edu-config";

/**
 * Journey-style progress visual for S1. Replaces StarProgress when S1 edu is on.
 *
 * Visual: a wavy horizontal path of N nodes. Answered nodes are gold-filled,
 * the current node pulses, and the named "stations" (Word Forest, Grammar
 * Bridge, Story Vale, Sentence Castle) sit beneath their anchor indices.
 *
 * On viewports < 640px the map collapses to a compact dot-strip so it doesn't
 * monopolise the header.
 */
export function AdventureMap({
  total,
  answered,
  current,
}: {
  total: number;
  answered: Set<number>;
  current: number;
}) {
  // Width budgeted via flex; spacing computed via grid columns.
  return (
    <div className="w-full">
      {/* Path of nodes */}
      <div
        className="grid items-center gap-[2px]"
        style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: total }).map((_, i) => {
          const done = answered.has(i);
          const isCurrent = i === current;
          const station = S1_MAP_STATIONS.find((s) => s.atIndex === i);
          return (
            <div key={i} className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.025, type: "spring", stiffness: 400, damping: 22 }}
                className="relative"
              >
                <div
                  className={[
                    "grid h-6 w-6 place-items-center rounded-full text-[11px] font-black transition-colors sm:h-7 sm:w-7 sm:text-xs",
                    done
                      ? "bg-amber-400 text-orange-700 shadow-inner"
                      : "bg-white/40 text-white/70 ring-1 ring-white/40",
                    isCurrent ? "ring-2 ring-white" : "",
                  ].join(" ")}
                  aria-label={`Question ${i + 1} ${done ? "answered" : "not answered"}`}
                >
                  {done ? "★" : "·"}
                </div>
                {isCurrent && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
                    style={{ boxShadow: "0 0 0 3px rgba(255,255,255,0.6)" }}
                    aria-hidden
                  />
                )}
                {station && (
                  <span
                    className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 select-none text-base"
                    aria-hidden
                    title={station.name}
                  >
                    {station.emoji}
                  </span>
                )}
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Station labels (desktop only — too cramped on mobile) */}
      <div
        className="mt-7 hidden items-start sm:grid"
        style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
        aria-hidden
      >
        {Array.from({ length: total }).map((_, i) => {
          const station = S1_MAP_STATIONS.find((s) => s.atIndex === i);
          return (
            <div key={i} className="flex justify-center">
              {station && (
                <span className="whitespace-nowrap text-[10px] font-black uppercase tracking-wider text-white/80">
                  {station.name}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
