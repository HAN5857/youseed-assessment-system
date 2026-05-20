"use client";
import { motion, LayoutGroup } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { RendererProps } from "./index";
import { sound } from "@/lib/sounds";
import { useUiTheme } from "@/lib/ui-theme";

/**
 * Tap-to-place sentence builder with FLIP animation.
 *
 * Tap a word in the Bank → flies down into the next sentence slot.
 * Tap a placed word → flies back into the Bank.
 */
export function OrderingDndRenderer({ prompt, content, value, onChange }: RendererProps) {
  const theme = useUiTheme();
  const calm = theme === "calm";
  const items: string[] = content?.items ?? [];

  const [placed, setPlaced] = useState<number[]>(() => {
    const saved: number[] | undefined = value?.order;
    if (saved && saved.length > 0 && saved.every((i) => i >= 0 && i < items.length)) {
      return saved;
    }
    return [];
  });

  const firstSync = useRef(true);
  useEffect(() => {
    onChange({ order: placed });
    if (!firstSync.current) {
      sound().play(placed.length > 0 ? "select" : "click");
    }
    firstSync.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placed]);

  const placedSet = new Set(placed);
  const bank = items.map((_, i) => i).filter((i) => !placedSet.has(i));
  const allPlaced = placed.length === items.length;

  const place = (idx: number) => {
    if (placedSet.has(idx)) return;
    setPlaced((p) => [...p, idx]);
  };
  const remove = (idx: number) => {
    setPlaced((p) => p.filter((i) => i !== idx));
  };

  // Both themes share the emerald accent for the sentence zone — recoloring
  // is mostly identity here. The hint chip and the bank-button hover colour
  // are the only places that drift toward green-only in calm mode.
  const hintChip = calm
    ? "mb-5 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700"
    : "mb-5 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700";
  const bankButtonHover = calm ? "hover:border-emerald-500" : "hover:border-emerald-400";

  return (
    <LayoutGroup>
      <div>
        <p className="mb-2 whitespace-pre-wrap text-2xl font-bold leading-snug text-slate-800 sm:text-3xl">
          {prompt}
        </p>
        <p className={hintChip}>
          ✋ Tap a word to add it. Tap again to remove it.
        </p>

        {/* WORD BANK */}
        <div className="mb-3 rounded-2xl border-2 border-slate-200 bg-slate-50/80 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              📦 Word Bank
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              {bank.length} left
            </span>
          </div>
          <div className="flex min-h-[60px] flex-wrap items-center gap-2">
            {bank.length === 0 ? (
              <span className="text-sm font-bold italic text-slate-400">
                Empty — all words placed! ✨
              </span>
            ) : (
              bank.map((idx) => (
                <motion.button
                  key={idx}
                  type="button"
                  layoutId={`word-${idx}`}
                  onClick={() => place(idx)}
                  whileHover={{ y: -3, scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 480, damping: 30 }}
                  className={`cursor-pointer rounded-2xl border-4 border-slate-300 bg-white px-4 py-3 text-base font-black text-slate-800 shadow-md sm:text-lg ${bankButtonHover}`}
                >
                  {items[idx]}
                </motion.button>
              ))
            )}
          </div>
        </div>

        {/* SENTENCE ZONE */}
        <div className={`rounded-3xl border-4 border-dashed p-4 transition-colors sm:p-5 ${
          allPlaced ? "border-emerald-500 bg-emerald-50" : "border-emerald-300 bg-emerald-50/40"
        }`}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
              ✍️ Your Sentence
            </span>
            <span className="text-[10px] font-bold text-emerald-600">
              {placed.length}/{items.length}
            </span>
          </div>

          <div className="flex min-h-[68px] flex-wrap items-center gap-2">
            {placed.length === 0 ? (
              <span className="text-sm font-bold italic text-emerald-700/60">
                Tap a word above to start building your sentence…
              </span>
            ) : (
              placed.map((idx, pos) => (
                <motion.button
                  key={idx}
                  type="button"
                  layoutId={`word-${idx}`}
                  onClick={() => remove(idx)}
                  whileHover={{ y: -3, scale: 1.04 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 480, damping: 30 }}
                  className="group flex cursor-pointer items-center gap-1.5 rounded-2xl border-4 border-emerald-500 bg-white px-3 py-2.5 text-base font-black text-slate-800 shadow-md sm:text-lg"
                >
                  <span
                    className="grid h-6 w-6 flex-none place-items-center rounded-full bg-emerald-500 text-[11px] font-black text-white"
                    aria-hidden
                  >
                    {pos + 1}
                  </span>
                  <span className="break-words">{items[idx]}</span>
                  <span
                    className="ml-0.5 text-xs text-slate-400 opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden
                    title="Tap to remove"
                  >
                    ✕
                  </span>
                </motion.button>
              ))
            )}
          </div>
        </div>

        {/* Read-back */}
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 480, damping: 30 }}
          className={`mt-4 rounded-2xl border-2 p-4 ${
            allPlaced ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white"
          }`}
        >
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Your sentence so far
          </div>
          <div className="mt-1 min-h-[1.75rem] text-base font-semibold text-slate-700 sm:text-lg">
            {placed.length === 0 ? (
              <span className="italic text-slate-400">…</span>
            ) : (
              placed.map((i) => items[i]).join(" ")
            )}
          </div>
        </motion.div>
      </div>
    </LayoutGroup>
  );
}
