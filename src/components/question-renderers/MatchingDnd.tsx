"use client";
import { Reorder, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { RendererProps } from "./index";
import { sound } from "@/lib/sounds";
import { useUiTheme } from "@/lib/ui-theme";

const COLOURS_PLAYFUL = [
  "from-pink-100 to-rose-100 border-pink-300",
  "from-sky-100 to-cyan-100 border-sky-300",
  "from-yellow-100 to-amber-100 border-yellow-300",
  "from-emerald-100 to-teal-100 border-emerald-300",
  "from-violet-100 to-fuchsia-100 border-violet-300",
  "from-orange-100 to-red-100 border-orange-300",
];

const COLOURS_CALM = [
  "from-emerald-100 to-green-100 border-emerald-300",
  "from-teal-100 to-cyan-100 border-teal-300",
  "from-lime-100 to-green-100 border-lime-300",
  "from-green-100 to-emerald-100 border-green-300",
  "from-emerald-50 to-teal-100 border-emerald-200",
  "from-teal-50 to-emerald-100 border-teal-200",
];

type LeftItem = string | { text: string; icon?: string };
type ChipItem = { id: number; text: string };

/**
 * Drag-and-drop matching: left column is fixed; right column is a Reorder.Group.
 * Student drags right chips up/down so each chip lines up with the matching left
 * sentence. Each row's pair = (left[i], items[i]).
 */
export function MatchingDndRenderer({ prompt, content, value, onChange }: RendererProps) {
  const theme = useUiTheme();
  const calm = theme === "calm";
  const colours = calm ? COLOURS_CALM : COLOURS_PLAYFUL;
  const rawLeft: LeftItem[] = content?.left ?? [];
  const right: string[] = content?.right ?? [];

  // Initialise from existing answer (if returning) OR a deterministic shuffle
  const [items, setItems] = useState<ChipItem[]>(() => {
    const existingPairs = value?.pairs as Record<string, number> | undefined;
    if (existingPairs && Object.keys(existingPairs).length === rawLeft.length) {
      return rawLeft.map((_, leftIdx) => {
        const rightIdx = existingPairs[String(leftIdx)] ?? leftIdx;
        return { id: rightIdx, text: right[rightIdx] ?? "" };
      });
    }
    const indices = right.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = (i * 7 + 3) % (i + 1);
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices.map((idx) => ({ id: idx, text: right[idx] }));
  });

  const firstSync = useRef(true);
  useEffect(() => {
    const pairs: Record<string, number> = {};
    items.forEach((chip, leftIdx) => { pairs[String(leftIdx)] = chip.id; });
    onChange({ pairs });
    if (!firstSync.current) sound().play("select");
    firstSync.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const hintChip = calm
    ? "mb-5 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700"
    : "mb-5 inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700";
  const chipBorder = calm ? "border-emerald-300" : "border-violet-300";
  const chipHandle = calm ? "text-emerald-400" : "text-violet-400";

  return (
    <div>
      <p className="mb-4 whitespace-pre-wrap text-2xl font-bold leading-snug text-slate-800 sm:text-3xl">
        {prompt}
      </p>
      <p className={hintChip}>
        ✋ Drag the right cards to match each sentence!
      </p>

      <div className="grid grid-cols-[1fr_auto_1fr] gap-3 sm:gap-4">
        {/* LEFT — fixed column */}
        <div className="space-y-3">
          {rawLeft.map((raw, i) => {
            const item = typeof raw === "string" ? { text: raw, icon: undefined } : raw;
            return (
              <div
                key={i}
                className={`flex min-h-[88px] items-center gap-3 rounded-2xl border-4 bg-gradient-to-br ${colours[i % colours.length]} p-4`}
              >
                <span
                  className="grid h-9 w-9 flex-none place-items-center rounded-full bg-white text-sm font-black text-slate-700 shadow-sm"
                  aria-hidden
                >
                  {i + 1}
                </span>
                {item.icon && (
                  <span
                    className="flex-none text-3xl kid-float"
                    style={{ animationDelay: `${i * 0.15}s` }}
                    aria-hidden
                  >
                    {item.icon}
                  </span>
                )}
                <span className="min-w-0 flex-1 break-words text-sm font-bold text-slate-800 sm:text-base">
                  {item.text}
                </span>
              </div>
            );
          })}
        </div>

        {/* CONNECTORS */}
        <div className="flex flex-col items-center gap-3">
          {rawLeft.map((_, i) => (
            <motion.span
              key={i}
              className="grid min-h-[88px] place-items-center text-2xl text-slate-400"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
              aria-hidden
            >
              →
            </motion.span>
          ))}
        </div>

        {/* RIGHT — draggable Reorder.Group */}
        <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-3">
          {items.map((chip) => (
            <Reorder.Item
              key={chip.id}
              value={chip}
              dragListener
              whileDrag={{ scale: 1.06, rotate: -1, zIndex: 10, boxShadow: "0 18px 40px rgba(15,23,42,0.18)" }}
              transition={{ type: "spring", stiffness: 500, damping: 32 }}
              className={`flex min-h-[88px] cursor-grab items-center gap-3 rounded-2xl border-4 bg-white p-4 shadow-md active:cursor-grabbing ${chipBorder}`}
            >
              <span className={`flex-none text-2xl ${chipHandle}`} aria-hidden>≡</span>
              <span className="flex-1 break-words text-base font-black text-slate-800 sm:text-lg">
                {chip.text}
              </span>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>
    </div>
  );
}
