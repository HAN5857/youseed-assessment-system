"use client";

// ─────────────────────────────────────────────────────────────────────────
// UI theme primitive — shared kid components branch between palettes
// without duplicating every renderer.
//
//   mode:    "playful" (rainbow) | "calm" (YouSeed green + white)
//   tier:    "primary" (S1-S3)   | "upper-primary" (S4-S6, more academic)
//   subject: "english" | "chinese" | "bahasa-melayu" | …
//
// `subject` is the newest axis. It lets shared components apply a
// language- or culture-flavoured skin (Mandarin red+gold, Melayu batik,
// etc.) without adding a subject prop to every callsite.
//
// Default is { mode: "playful", tier: "primary", subject: "english" } so
// any component that forgets to wrap its tree keeps the legacy look.
// ─────────────────────────────────────────────────────────────────────────

import { createContext, useContext, type ReactNode } from "react";

export type UiThemeMode = "playful" | "calm";
export type UiThemeTier = "primary" | "upper-primary";
export type UiThemeSubject = string; // free-form (English, chinese, bahasa-melayu, …)

type UiThemeValue = { mode: UiThemeMode; tier: UiThemeTier; subject: UiThemeSubject };

const UiThemeContext = createContext<UiThemeValue>({
  mode: "playful",
  tier: "primary",
  subject: "english",
});

export function UiThemeProvider({
  mode,
  tier = "primary",
  subject = "english",
  children,
}: {
  mode: UiThemeMode;
  tier?: UiThemeTier;
  subject?: UiThemeSubject;
  children: ReactNode;
}) {
  return (
    <UiThemeContext.Provider value={{ mode, tier, subject }}>
      {children}
    </UiThemeContext.Provider>
  );
}

// Back-compat: useUiTheme() still returns the mode string so existing
// callers compile unchanged. New callers can use useUiTier() / useUiSubject().
export function useUiTheme(): UiThemeMode {
  return useContext(UiThemeContext).mode;
}

export function useUiTier(): UiThemeTier {
  return useContext(UiThemeContext).tier;
}

export function useUiSubject(): UiThemeSubject {
  return useContext(UiThemeContext).subject;
}

/** Convenience — true when the surrounding theme is on the Chinese subject. */
export function useIsChineseTheme(): boolean {
  const s = useContext(UiThemeContext).subject.toLowerCase();
  return s === "chinese" || s === "zh" || s === "zh-cn";
}
