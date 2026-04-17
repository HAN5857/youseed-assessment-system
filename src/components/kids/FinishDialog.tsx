"use client";

import { useEffect } from "react";
import { Mascot } from "./Mascot";
import { sound } from "@/lib/sounds";

export function FinishDialog({
  open,
  answered,
  total,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  answered: number;
  total: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (open) sound().play("click");
  }, [open]);

  if (!open) return null;

  const allAnswered = answered === total;
  const pct = Math.round((answered / total) * 100);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="finish-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog card */}
      <div className="relative w-full max-w-md">
        {/* Floating mascot on top */}
        <div className="pointer-events-none absolute left-1/2 -top-14 -translate-x-1/2 z-10">
          <div className="rounded-full bg-white/80 p-2 shadow-lg">
            <Mascot mood={allAnswered ? "cheer" : "think"} size={96} />
          </div>
        </div>

        <div className="kid-card relative overflow-hidden p-6 pt-14 sm:p-8 sm:pt-16 kid-bounce-in">
          {/* Sparkles */}
          <span className="absolute -top-2 right-6 text-3xl kid-sparkle">✨</span>
          <span className="absolute top-10 left-4 text-2xl kid-sparkle" style={{ animationDelay: "0.3s" }}>⭐</span>
          <span className="absolute bottom-20 right-8 text-2xl kid-sparkle" style={{ animationDelay: "0.6s" }}>🌟</span>

          <h2 id="finish-title" className="text-center text-2xl font-black tracking-tight text-slate-800 sm:text-3xl">
            {allAnswered ? <>Ready to finish? 🎉</> : <>Almost there! 💪</>}
          </h2>
          <p className="mt-2 text-center text-base font-semibold text-slate-600">
            {allAnswered
              ? "You answered every question — great job!"
              : `You've answered ${total - answered} more to try. Want to keep going?`}
          </p>

          {/* Progress visualisation */}
          <div className="mt-5 rounded-2xl bg-gradient-to-br from-violet-100 to-pink-100 p-5">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-violet-700">Answered</div>
                <div className="text-4xl font-black text-violet-900">
                  {answered}<span className="text-xl text-violet-400">/{total}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-black uppercase tracking-wider text-pink-700">Complete</div>
                <div className="text-4xl font-black text-pink-600">{pct}%</div>
              </div>
            </div>
            <div className="mt-3 h-4 w-full overflow-hidden rounded-full bg-white/70 shadow-inner">
              <div
                className="h-4 rounded-full bg-gradient-to-r from-pink-400 via-violet-500 to-indigo-500 transition-all"
                style={{ width: `${Math.max(4, pct)}%` }}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => { sound().play("click"); onCancel(); }}
              className="rounded-full border-2 border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
            >
              {allAnswered ? "Let me check again" : "Keep trying 💪"}
            </button>
            <button
              type="button"
              onClick={() => { sound().play("click"); onConfirm(); }}
              className={`kid-btn ${allAnswered ? "kid-btn-green" : ""}`}
            >
              {allAnswered ? "Yes, finish! 🏁" : "Finish anyway 🏁"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
