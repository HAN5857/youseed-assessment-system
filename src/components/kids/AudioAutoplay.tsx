"use client";

// Global audio bootstrapper.
// Browsers BLOCK audio from playing until the user interacts with the page.
// This component listens for the first pointer/keyboard/touch event anywhere
// on the site — once that fires, it unlocks the AudioContext and auto-starts
// the background music (unless the user has explicitly muted or paused music).
//
// Effect: the user taps "Start my test" (or anywhere else) → music just starts.
// No dedicated "play music" button press needed.

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { sound } from "@/lib/sounds";

// Routes that should NOT auto-play music (admin / tutor side stays quiet).
const QUIET_ROUTES = ["/admin"];

export function AudioAutoplay() {
  const pathname = usePathname();

  useEffect(() => {
    // Admin side: no music, and stop it if it was playing.
    if (QUIET_ROUTES.some((p) => pathname?.startsWith(p))) {
      sound().stopMusic();
      return;
    }

    const muted = sessionStorage.getItem("snd_muted") === "1";
    const musicPref = sessionStorage.getItem("snd_music");
    const musicOff = musicPref === "0"; // only off if explicitly opted-out

    if (muted || musicOff) return;

    // If context already unlocked (user interacted earlier this session), start right away.
    const engine = sound();
    if (!engine.musicPlaying) {
      void engine.unlock().then(() => {
        if (!engine.musicPlaying && !engine.muted) {
          sessionStorage.setItem("snd_music", "1");
          engine.startMusic();
        }
      });
    }

    // Also attach a one-shot listener in case the above failed (first-ever visit).
    const handler = async () => {
      const e = sound();
      await e.unlock();
      if (!e.musicPlaying && !e.muted) {
        sessionStorage.setItem("snd_music", "1");
        e.startMusic();
      }
      // Clean up — we only need the FIRST gesture
      window.removeEventListener("pointerdown", handler);
      window.removeEventListener("keydown", handler);
      window.removeEventListener("touchstart", handler);
    };
    window.addEventListener("pointerdown", handler, { once: false });
    window.addEventListener("keydown", handler, { once: false });
    window.addEventListener("touchstart", handler, { once: false });

    return () => {
      window.removeEventListener("pointerdown", handler);
      window.removeEventListener("keydown", handler);
      window.removeEventListener("touchstart", handler);
    };
  }, [pathname]);

  return null;
}
