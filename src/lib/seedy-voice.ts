"use client";

// ─────────────────────────────────────────────────────────────────────────
// Seedy voice — thin wrapper over Web Speech API (window.speechSynthesis)
// ─────────────────────────────────────────────────────────────────────────
//
// Used by MascotSpeechBubble to read Seedy's lines aloud when the parent
// has the 🗣 voice toggle ON (default). Designed to:
//   - share one queue across the whole app (cancel previous before speak)
//   - pick a friendly female-leaning voice when available, fall back gracefully
//   - never throw if the API is missing (returns isSupported() === false)
//   - obey the master mute toggle (snd_muted)
//
// The same browser API is already used for LISTEN_FILL questions; we don't
// share state with that, but the autoplay-policy gesture-unlock that fires
// for sound effects also unlocks speech.

const VOICE_SETTINGS = {
  lang: "en-US",
  rate: 0.92,    // a touch slower for ages 7–8
  pitch: 1.10,   // a touch higher → friendlier
  volume: 1.0,
} as const;

let cachedVoice: SpeechSynthesisVoice | null = null;
let voicesWarmed = false;

function pickVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice) return cachedVoice;
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // Prefer voices that tend to read warmly for kids.
  const preferredNames = ["Samantha", "Karen", "Allison", "Tessa", "Susan", "Female"];
  const en = voices.filter((v) => v.lang?.startsWith("en"));
  for (const want of preferredNames) {
    const found = en.find((v) => v.name?.includes(want));
    if (found) { cachedVoice = found; return found; }
  }
  cachedVoice = en[0] ?? voices[0] ?? null;
  return cachedVoice;
}

function isMuted(): boolean {
  if (typeof window === "undefined") return true;
  return sessionStorage.getItem("snd_muted") === "1";
}

export const seedyVoice = {
  isSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  },

  /** Pre-warm the voice list — some browsers (Safari) populate async. */
  warm() {
    if (voicesWarmed || !this.isSupported()) return;
    voicesWarmed = true;
    try {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.addEventListener?.("voiceschanged", () => {
        cachedVoice = null; // re-pick once available
        pickVoice();
      });
    } catch { /* ignore */ }
  },

  /**
   * Speak a string. By default cancels any previous Seedy utterance so the
   * queue never piles up on rapid bubble changes.
   */
  speak(text: string, opts?: { interrupt?: boolean }) {
    if (!this.isSupported() || isMuted() || !text) return;
    try {
      if (opts?.interrupt !== false) window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const v = pickVoice();
      if (v) u.voice = v;
      u.lang = VOICE_SETTINGS.lang;
      u.rate = VOICE_SETTINGS.rate;
      u.pitch = VOICE_SETTINGS.pitch;
      u.volume = VOICE_SETTINGS.volume;
      window.speechSynthesis.speak(u);
    } catch { /* swallow — speech failure must never break the test */ }
  },

  /** Stop any active or queued Seedy utterance. */
  cancel() {
    if (!this.isSupported()) return;
    try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
  },
};
