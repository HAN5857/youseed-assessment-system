"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import { seedyVoice } from "@/lib/seedy-voice";

/**
 * Speech bubble for Seedy. Anchored visually below/right of the mascot.
 * Speaks via Web Speech API when `speak` is true. Auto-dismisses after
 * `autoDismissMs`. Can be dismissed by clicking the ✕ or anywhere on the bubble.
 *
 * The parent owns the message string and the dismiss callback — when the
 * message is null, the bubble unmounts (via AnimatePresence).
 */
export function MascotSpeechBubble({
  message,
  autoDismissMs = 3500,
  onDismiss,
  speak = true,
  anchor = "header",
}: {
  message: string | null;
  autoDismissMs?: number;
  onDismiss: () => void;
  speak?: boolean;
  /** "header" = positioned next to header mascot; "free" = caller positions */
  anchor?: "header" | "free";
}) {
  const spokenForRef = useRef<string | null>(null);

  // Speak the message when it appears (once per unique message)
  useEffect(() => {
    if (!message) return;
    if (spokenForRef.current === message) return;
    spokenForRef.current = message;
    if (speak) seedyVoice.speak(message);
    return () => { seedyVoice.cancel(); };
  }, [message, speak]);

  // Auto-dismiss timer
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDismiss, autoDismissMs);
    return () => clearTimeout(t);
  }, [message, autoDismissMs, onDismiss]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          role="status"
          aria-live="polite"
          className={
            anchor === "header"
              ? "pointer-events-auto fixed left-4 top-20 z-30 max-w-[280px] sm:left-20"
              : "pointer-events-auto z-30 max-w-[280px]"
          }
          initial={{ y: 8, opacity: 0, scale: 0.94 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -6, opacity: 0, scale: 0.94 }}
          transition={{ type: "spring", stiffness: 480, damping: 30 }}
        >
          <div className="relative rounded-2xl border-4 border-dashed border-pink-300 bg-white p-3 pr-7 shadow-xl">
            {/* Tail pointing up-left toward the mascot */}
            <div
              className="absolute left-3 -top-3 h-3 w-3 rotate-45 border-l-4 border-t-4 border-dashed border-pink-300 bg-white"
              aria-hidden
            />
            {/* Dismiss button */}
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss speech bubble"
              className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              ✕
            </button>
            <p className="text-sm font-bold leading-snug text-slate-700 sm:text-[15px]">
              {message}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
