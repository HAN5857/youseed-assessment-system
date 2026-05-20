"use client";

// ─────────────────────────────────────────────────────────────────────────
// S1 Edutainment feature-flag system
// ─────────────────────────────────────────────────────────────────────────
//
// Single source of truth for whether the edutainment upgrade is active and
// which sub-features are turned on. Every edu-only component must check
// `useS1Edu(lead?)` before rendering its enhanced behaviour, otherwise it
// must fall back to the legacy UI exactly as before.
//
// Activation requires THREE conditions:
//   1. Master env flag is "1"  (NEXT_PUBLIC_S1_EDU_FLAG)
//   2. Lead's test.subject === "english"
//   3. Lead's test.level   === "standard-1"
//
// Sub-features can additionally be flipped off at runtime via sessionStorage
// keys (parent toggles on the instructions page). They default to the values
// chosen during the design review.

import { useEffect, useState } from "react";

export type S1EduFlags = {
  /** Master switch — false means render the legacy UI. */
  active: boolean;

  // Always-on when active
  practiceRound: boolean;
  adventureMap: boolean;
  chapterInterstitial: boolean;
  mascotSpeech: boolean;
  idleNudge: boolean;
  stickerAlbum: boolean;
  endOfQuestScene: boolean;
  toneDownReactions: boolean;

  // Persona toggles — driven by sessionStorage; default = decision-locked value
  voiceMascot: boolean;     // default ON
  softPause: boolean;       // default OFF
  confidenceDial: boolean;  // default OFF
};

type LeadCtx = { test?: { subject?: string | null; level?: string | null } };

const ENV_ON = process.env.NEXT_PUBLIC_S1_EDU_FLAG === "1";

// sessionStorage keys (kept short, prefixed `s1edu_`)
const SS_VOICE = "s1edu_voice";
const SS_SOFT_PAUSE = "s1edu_softpause";
const SS_CONFIDENCE = "s1edu_confidence";

/** Default values when the sessionStorage key has never been set. */
const DEFAULTS = {
  voiceMascot: true,
  softPause: false,
  confidenceDial: false,
};

function readPref(key: string, fallback: boolean): boolean {
  if (typeof window === "undefined") return fallback;
  const v = sessionStorage.getItem(key);
  if (v === null) return fallback;
  return v === "1";
}

function isS1English(lead?: LeadCtx | null): boolean {
  return (
    !!lead &&
    lead.test?.subject?.toLowerCase() === "english" &&
    lead.test?.level?.toLowerCase() === "standard-1"
  );
}

/**
 * Hook — call inside a client component, optionally pass the lead so the flag
 * can also be gated by subject/level. When called without a lead, only the
 * env switch is consulted (useful in places we know are S1-only by route).
 */
export function useS1Edu(lead?: LeadCtx | null): S1EduFlags {
  const [voiceMascot, setVoice] = useState<boolean>(DEFAULTS.voiceMascot);
  const [softPause, setSoft] = useState<boolean>(DEFAULTS.softPause);
  const [confidenceDial, setConf] = useState<boolean>(DEFAULTS.confidenceDial);

  // Re-read sessionStorage on mount + when toggles are dispatched.
  useEffect(() => {
    const sync = () => {
      setVoice(readPref(SS_VOICE, DEFAULTS.voiceMascot));
      setSoft(readPref(SS_SOFT_PAUSE, DEFAULTS.softPause));
      setConf(readPref(SS_CONFIDENCE, DEFAULTS.confidenceDial));
    };
    sync();
    window.addEventListener("s1edu:prefs-changed", sync);
    window.addEventListener("storage", sync); // cross-tab safety
    return () => {
      window.removeEventListener("s1edu:prefs-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const subjectLevelOk = lead === undefined ? true : isS1English(lead);
  const active = ENV_ON && subjectLevelOk;

  return {
    active,
    practiceRound: active,
    adventureMap: active,
    chapterInterstitial: active,
    mascotSpeech: active,
    idleNudge: active,
    stickerAlbum: active,
    endOfQuestScene: active,
    toneDownReactions: active,
    voiceMascot: active && voiceMascot,
    softPause: active && softPause,
    confidenceDial: active && confidenceDial,
  };
}

/**
 * Pref setters. Components call these to flip a parent toggle. They write
 * sessionStorage and dispatch `s1edu:prefs-changed` so any mounted hooks
 * re-sync without a page reload.
 */
export const s1EduPrefs = {
  setVoiceMascot(on: boolean) { write(SS_VOICE, on); },
  setSoftPause(on: boolean) { write(SS_SOFT_PAUSE, on); },
  setConfidenceDial(on: boolean) { write(SS_CONFIDENCE, on); },

  getVoiceMascot(): boolean { return readPref(SS_VOICE, DEFAULTS.voiceMascot); },
  getSoftPause(): boolean { return readPref(SS_SOFT_PAUSE, DEFAULTS.softPause); },
  getConfidenceDial(): boolean { return readPref(SS_CONFIDENCE, DEFAULTS.confidenceDial); },
};

function write(key: string, on: boolean) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(key, on ? "1" : "0");
  window.dispatchEvent(new Event("s1edu:prefs-changed"));
}
