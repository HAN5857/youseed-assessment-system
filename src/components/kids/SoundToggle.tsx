"use client";

import { useEffect, useState } from "react";
import { sound } from "@/lib/sounds";
import { s1EduPrefs } from "@/lib/s1-edu-flag";
import { seedyVoice } from "@/lib/seedy-voice";
import { useIsChineseTheme, useUiSubject } from "@/lib/ui-theme";
import { runnerCopy } from "@/lib/runner-i18n";

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
  const subject = useUiSubject();
  const chinese = useIsChineseTheme();
  const t = runnerCopy(subject);

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

  if (chinese) {
    return (
      <div className="mandarin-sound-controls" aria-label="声音控制">
        <button onClick={toggleMute} aria-label={muted ? t.soundOn : t.soundOff} className={`mandarin-sound-button ${!muted ? "is-active" : ""}`}>
          <SpeakerIcon muted={muted} />
        </button>
        {showMusic && (
          <button onClick={toggleMusic} aria-label={music ? t.musicOff : t.musicOn} className={`mandarin-sound-button ${music ? "is-active" : ""}`}>
            <MusicIcon />
          </button>
        )}
        {showVoice && (
          <button onClick={toggleVoice} aria-label={voice ? t.voiceOff : t.voiceOn} title={voice ? t.voiceIsOn : t.voiceIsOff} className={`mandarin-sound-button ${voice ? "is-active" : ""}`}>
            <VoiceIcon />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleMute}
        aria-label={muted ? t.soundOn : t.soundOff}
        className="kid-pill h-10 w-10 rounded-full bg-white/90 text-xl shadow hover:scale-105 active:scale-95"
      >
        {muted ? "🔇" : "🔊"}
      </button>
      {showMusic && (
        <button
          onClick={toggleMusic}
          aria-label={music ? t.musicOff : t.musicOn}
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
          aria-label={voice ? t.voiceOff : t.voiceOn}
          title={voice ? t.voiceIsOn : t.voiceIsOff}
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

function SpeakerIcon({ muted }: { muted: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden><path d="M4 10v4h3l4 3.5v-11L7 10H4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />{muted ? <path d="m15 9 5 5m0-5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /> : <path d="M15 9.5a3.5 3.5 0 0 1 0 5M17.5 7a7 7 0 0 1 0 10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />}</svg>;
}

function MusicIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden><path d="M9 18V6l10-2v12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><circle cx="6.5" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.8" /><circle cx="16.5" cy="16" r="2.5" stroke="currentColor" strokeWidth="1.8" /></svg>;
}

function VoiceIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden><rect x="9" y="3" width="6" height="12" rx="3" stroke="currentColor" strokeWidth="1.8" /><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3m-3 0h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}
