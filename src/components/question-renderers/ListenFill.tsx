"use client";
import type { RendererProps } from "./index";
import { useEffect, useRef, useState } from "react";
import { sound } from "@/lib/sounds";
import { useUiTheme } from "@/lib/ui-theme";

export function ListenFillRenderer({ prompt, content, value, onChange }: RendererProps) {
  const theme = useUiTheme();
  const calm = theme === "calm";
  const speakText: string = content?.speakText ?? "";
  const maxPlays: number = content?.maxPlays ?? 3;
  const lang: string = content?.lang ?? "en-US";
  const [plays, setPlays] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);
  const cancelledRef = useRef(false);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      cancelledRef.current = true;
      try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
    };
  }, []);

  const play = () => {
    if (plays >= maxPlays || !supported || !speakText) return;
    sound().play("click");
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(speakText);
      u.lang = lang;
      u.rate = 0.85;
      u.pitch = 1.05;
      u.volume = 1.0;
      u.onstart = () => setIsSpeaking(true);
      u.onend = () => setIsSpeaking(false);
      u.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(u);
      setPlays((p) => p + 1);
    } catch {
      setIsSpeaking(false);
    }
  };

  // Palette swap: audio card violet → emerald; play button blue → green;
  // input box yellow → green. Structure (sparkle, kid-pulse, kid-sparkle,
  // ✨ glyph, kid-btn) preserved.
  const audioCard = calm
    ? "mb-6 flex flex-col items-center gap-3 rounded-3xl border-4 border-emerald-200 bg-emerald-50 p-6 sm:flex-row"
    : "mb-6 flex flex-col items-center gap-3 rounded-3xl border-4 border-violet-200 bg-violet-50 p-6 sm:flex-row";
  const playButtonClasses = calm
    ? `kid-btn kid-btn-green text-xl ${isSpeaking ? "kid-pulse" : ""}`
    : `kid-btn kid-btn-blue text-xl ${isSpeaking ? "kid-pulse" : ""}`;
  const meterLabel = calm ? "text-sm font-semibold text-emerald-700" : "text-sm font-semibold text-violet-700";
  const meterValue = calm ? "text-lg font-black text-emerald-900" : "text-lg font-black text-violet-900";
  const inputClasses = calm
    ? "w-full rounded-2xl border-4 border-emerald-300 bg-emerald-50 px-5 py-5 text-2xl font-bold text-slate-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 shadow-inner"
    : "w-full rounded-2xl border-4 border-yellow-300 bg-yellow-50 px-5 py-5 text-2xl font-bold text-slate-800 outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-200 shadow-inner";

  return (
    <div>
      <p className="mb-4 whitespace-pre-wrap text-2xl font-bold leading-snug text-slate-800 sm:text-3xl">
        {prompt}
      </p>

      <div className={audioCard}>
        <button
          type="button"
          onClick={play}
          disabled={plays >= maxPlays || !supported}
          className={playButtonClasses}
          aria-label="Play the audio clip"
        >
          <span className="mr-2 text-2xl" aria-hidden>🎧</span>
          {plays === 0 ? "Play audio" : "Listen again"}
        </button>
        <div className="flex-1 text-center sm:text-left">
          {supported ? (
            <>
              <div className={meterLabel}>You can listen</div>
              <div className={meterValue}>
                {Math.max(0, maxPlays - plays)} / {maxPlays} times left
              </div>
            </>
          ) : (
            <div className="text-sm font-bold text-rose-700">
              Audio isn&apos;t supported by this browser. Please use Chrome, Edge, or Safari.
            </div>
          )}
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          autoComplete="off"
          value={value?.text ?? ""}
          onChange={(e) => onChange({ text: e.target.value })}
          className={inputClasses}
          placeholder="✏️ Type what you heard…"
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-2xl kid-sparkle" aria-hidden>✨</span>
      </div>
    </div>
  );
}
