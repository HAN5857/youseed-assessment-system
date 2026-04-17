"use client";
import type { RendererProps } from "./index";
import { useState, useRef } from "react";
import { OptionCard } from "@/components/kids/OptionCard";
import { sound } from "@/lib/sounds";

export function ListeningRenderer({ prompt, mediaUrl, content, value, onChange }: RendererProps) {
  const options: { key: string; text: string }[] = content?.options ?? [];
  const selected = value?.key as string | undefined;
  const maxPlays: number = content?.maxPlays ?? 2;
  const [plays, setPlays] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = async () => {
    if (plays >= maxPlays || !audioRef.current) return;
    sound().play("click");
    audioRef.current.currentTime = 0;
    try {
      await audioRef.current.play();
      setIsPlaying(true);
      setPlays((p) => p + 1);
    } catch { /* audio file missing or blocked */ }
  };

  return (
    <div>
      <p className="mb-4 whitespace-pre-wrap text-2xl font-bold leading-snug text-slate-800 sm:text-3xl">
        {prompt}
      </p>
      <div className="mb-6 flex flex-col items-center gap-3 rounded-3xl border-4 border-violet-200 bg-violet-50 p-6 sm:flex-row">
        <button
          type="button"
          onClick={play}
          disabled={plays >= maxPlays}
          className={`kid-btn kid-btn-blue text-2xl ${isPlaying ? "kid-pulse" : ""}`}
        >
          <span className="mr-2 text-2xl">🎧</span>
          {plays === 0 ? "Play audio" : "Play again"}
        </button>
        <div className="flex-1 text-center sm:text-left">
          <div className="text-sm font-semibold text-violet-700">You can listen</div>
          <div className="text-lg font-black text-violet-900">{maxPlays - plays} times</div>
        </div>
        {mediaUrl && (
          <audio
            ref={audioRef}
            src={mediaUrl}
            preload="auto"
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((o, i) => (
          <OptionCard
            key={o.key}
            index={i}
            badge={o.key}
            text={o.text}
            selected={selected === o.key}
            onSelect={() => onChange({ key: o.key })}
          />
        ))}
      </div>
    </div>
  );
}
