"use client";

import { useEffect, useState } from "react";
import { sound } from "@/lib/sounds";

export function SoundToggle({ showMusic = true }: { showMusic?: boolean }) {
  const [muted, setMuted] = useState(false);
  const [music, setMusic] = useState(false);

  useEffect(() => {
    // Persist across the session. Music defaults to ON (only off if explicitly opted out).
    const m = sessionStorage.getItem("snd_muted") === "1";
    const musicPref = sessionStorage.getItem("snd_music");
    const bg = musicPref !== "0"; // default true, only false if user turned it off
    setMuted(m);
    setMusic(bg);
    const e = sound();
    e.setMuted(m);
    // Note: music auto-start is handled by <AudioAutoplay> on first user gesture;
    // we don't try to start here because browsers block audio before any gesture.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMute = async () => {
    const e = sound();
    await e.unlock();
    const next = !muted;
    setMuted(next);
    sessionStorage.setItem("snd_muted", next ? "1" : "0");
    e.setMuted(next);
    if (!next) e.play("click");
    if (next) e.stopMusic();
    if (!next && music) e.startMusic();
  };

  const toggleMusic = async () => {
    const e = sound();
    await e.unlock();
    const next = !music;
    setMusic(next);
    sessionStorage.setItem("snd_music", next ? "1" : "0");
    if (next && !muted) { e.startMusic(); e.play("click"); }
    else e.stopMusic();
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleMute}
        aria-label={muted ? "Unmute sounds" : "Mute sounds"}
        className="kid-pill h-10 w-10 rounded-full bg-white/90 text-xl shadow hover:scale-105 active:scale-95"
      >
        {muted ? "🔇" : "🔊"}
      </button>
      {showMusic && (
        <button
          onClick={toggleMusic}
          aria-label={music ? "Pause music" : "Play music"}
          className={`kid-pill h-10 w-10 rounded-full text-xl shadow hover:scale-105 active:scale-95 ${
            music ? "bg-yellow-300" : "bg-white/90"
          }`}
        >
          🎵
        </button>
      )}
    </div>
  );
}
