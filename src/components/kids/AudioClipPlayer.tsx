"use client";

// Audio clip player used by SINGLE (phonics S4-6) and LISTEN_FILL.
//   src:        absolute or root-relative URL to an audio file (mp3/wav/etc).
//   speakText:  TTS fallback used only when src is not provided (S1-3 phonics).
//   maxPlays:   plays counter limit (default 3).
// Theme-aware via useUiTheme — green palette on calm, violet on playful.
// LINT: do not block submit if audio fails to load — phonics questions in the
//       database still have the spelling description; audio is supplementary.

import { useEffect, useRef, useState } from "react";
import { sound } from "@/lib/sounds";
import { useUiTheme } from "@/lib/ui-theme";

export function AudioClipPlayer({
  src,
  speakText,
  maxPlays = 3,
  lang = "en-US",
}: {
  src?: string;
  speakText?: string;
  maxPlays?: number;
  lang?: string;
}) {
  const theme = useUiTheme();
  const calm = theme === "calm";
  const [plays, setPlays] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ttsSupported = useRef(false);

  useEffect(() => {
    ttsSupported.current = typeof window !== "undefined" && "speechSynthesis" in window;
    return () => {
      try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
      audioRef.current?.pause();
    };
  }, []);

  const remaining = Math.max(0, maxPlays - plays);
  const disabled = remaining === 0;

  const play = async () => {
    if (disabled) return;
    sound().play("click");
    if (src) {
      try {
        if (!audioRef.current) {
          audioRef.current = new Audio(src);
          audioRef.current.onplay = () => setIsPlaying(true);
          audioRef.current.onended = () => setIsPlaying(false);
          audioRef.current.onerror = () => setIsPlaying(false);
        }
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
        setPlays((p) => p + 1);
      } catch {
        setIsPlaying(false);
      }
      return;
    }
    if (speakText && ttsSupported.current) {
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(speakText);
        u.lang = lang;
        u.rate = 0.85;
        u.pitch = 1.0;
        u.volume = 1.0;
        u.onstart = () => setIsPlaying(true);
        u.onend = () => setIsPlaying(false);
        u.onerror = () => setIsPlaying(false);
        window.speechSynthesis.speak(u);
        setPlays((p) => p + 1);
      } catch {
        setIsPlaying(false);
      }
    }
  };

  const cardClass = calm
    ? "flex flex-col items-center gap-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-5 sm:flex-row"
    : "flex flex-col items-center gap-3 rounded-2xl border-2 border-violet-200 bg-violet-50 p-5 sm:flex-row";

  const buttonClass = calm
    ? `inline-flex items-center gap-2 rounded-full bg-[#18A65B] px-6 py-3 text-base font-bold text-white shadow-md transition hover:brightness-110 active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed ${isPlaying ? "kid-pulse" : ""}`
    : `kid-btn kid-btn-blue text-base ${isPlaying ? "kid-pulse" : ""}`;

  const meterLabel = calm ? "text-xs font-semibold uppercase tracking-wider text-emerald-700" : "text-sm font-semibold text-violet-700";
  const meterValue = calm ? "text-base font-bold text-emerald-900" : "text-lg font-black text-violet-900";

  return (
    <div className={cardClass} role="group" aria-label="Audio clip">
      <button type="button" onClick={play} disabled={disabled} className={buttonClass} aria-label="Play audio clip">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M8 5v14l11-7L8 5z" fill="currentColor" />
        </svg>
        {plays === 0 ? "Play audio" : "Listen again"}
      </button>
      <div className="flex-1 text-center sm:text-left">
        <div className={meterLabel}>You can listen</div>
        <div className={meterValue}>{remaining} / {maxPlays} times left</div>
      </div>
    </div>
  );
}
