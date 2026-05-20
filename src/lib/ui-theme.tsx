"use client";

// ─────────────────────────────────────────────────────────────────────────
// UI theme primitive — shared kid components branch between palettes
// without duplicating every renderer.
//
//   mode: "playful" (rainbow) | "calm" (YouSeed green + white)
//   tier: "primary" (S1-S3)   | "upper-primary" (S4-S6, more academic)
//
// Default is { mode: "playful", tier: "primary" } so any component that
// forgets to wrap its tree keeps the legacy appearance.
// ─────────────────────────────────────────────────────────────────────────

import { createContext, useContext, type ReactNode } from "react";

export type UiThemeMode = "playful" | "calm";
export type UiThemeTier = "primary" | "upper-primary";

type UiThemeValue = { mode: UiThemeMode; tier: UiThemeTier };

const UiThemeContext = createContext<UiThemeValue>({ mode: "playful", tier: "primary" });

export function UiThemeProvider({
  mode,
  tier = "primary",
  children,
}: {
  mode: UiThemeMode;
  tier?: UiThemeTier;
  children: ReactNode;
}) {
  return (
    <UiThemeContext.Provider value={{ mode, tier }}>
      {children}
    </UiThemeContext.Provider>
  );
}

// Back-compat: useUiTheme() still returns the mode string so existing
// callers compile unchanged. New callers can use useUiTier() for the tier.
export function useUiTheme(): UiThemeMode {
  return useContext(UiThemeContext).mode;
}

export function useUiTier(): UiThemeTier {
  return useContext(UiThemeContext).tier;
}
