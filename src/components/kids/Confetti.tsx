"use client";

import confetti from "canvas-confetti";

export function fireConfetti(options?: { origin?: { x?: number; y?: number }; particleCount?: number }) {
  const defaults = {
    spread: 90,
    ticks: 200,
    gravity: 1,
    decay: 0.94,
    startVelocity: 35,
    colors: ["#fbbf24", "#ec4899", "#a855f7", "#14b8a6", "#fb923c", "#38bdf8"],
  };
  confetti({ ...defaults, particleCount: options?.particleCount ?? 80, origin: options?.origin ?? { y: 0.6 } });
}

export function celebrate() {
  // Three bursts from both sides for a celebration effect
  const end = Date.now() + 800;
  const frame = () => {
    confetti({ particleCount: 7, angle: 60, spread: 60, origin: { x: 0, y: 0.8 },
      colors: ["#fbbf24", "#ec4899", "#a855f7", "#14b8a6"] });
    confetti({ particleCount: 7, angle: 120, spread: 60, origin: { x: 1, y: 0.8 },
      colors: ["#fb923c", "#38bdf8", "#10b981", "#fde047"] });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}
