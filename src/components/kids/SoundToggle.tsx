"use client";

import { useEffect, useState } from "react";
import { sound } from "@/lib/sounds";
import { s1EduPrefs } from "@/lib/s1-edu-flag";
import { seedyVoice } from "@/lib/seedy-voice";

export function SoundToggle({
  showMusic = true,
  showVoice = true,
}: {
  showMusic?: boolean;
  showVoice?: boolean;
}) {
  const [muted, setMuted] = useState(false);
  const [music, setMusic] = useState(false);
  const [voice, setVoice] = useState(true); // default ON (locked decision)

  useEffect(() => {
    // Persist across the session. Music defaults to ON (only off if explicitly opted out).
    const m = sessionStorage.getItem("snd_muted") === "1";
    const musicPref = sessionStorage.getItem("snd_music");
    const bg = musicPref !== "0"; // default true
    setMuted(m);
    setMusic(bg);
    setVoice(s1EduPrefs.getVoiceMascot()); // default true via the prefs lib
    const e = sound();
    e.setMuted(m);
    seedyVoice.warm();
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
    if (next) { e.stopMusic(); seedyVoice.cancel(); }
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

  const toggleVoice = async () => {
    const e = sound();
    await e.unlock();
    const next = !voice;
    setVoice(next);
    s1EduPrefs.setVoiceMascot(next);
    if (!next) seedyVoice.cancel();
    if (!muted) e.play("click");
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
      {showVoice && (
        <button
          onClick={toggleVoice}
          aria-label={voice ? "Turn Seedy's voice off" : "Turn Seedy's voice on"}
          title={voice ? "Seedy is talking 🌱" : "Seedy is quiet"}
          className={`kid-pill h-10 w-10 rounded-full text-xl shadow hover:scale-105 active:scale-95 ${
            voice ? "bg-emerald-300" : "bg-white/90"
          }`}
        >
          🗣
        </button>
      )}
    </div>
  );
}
