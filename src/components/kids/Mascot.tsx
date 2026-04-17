"use client";

// Brand mark component. Renders the YouSeed logo PNG with mood-based motion.
// Kept as a component (not inline <Image>) so every page uses the same source
// of truth — logo swap or animation tweak propagates everywhere.

import Image from "next/image";
import clsx from "clsx";

export type MascotMood = "happy" | "cheer" | "think" | "wave";

const MOTION: Record<MascotMood, string> = {
  happy: "",              // static (when used as a small header icon)
  cheer: "kid-wiggle",    // excited celebration
  think: "kid-float",     // gentle up/down (instructions, contemplative)
  wave: "kid-bounce",     // hero bounce (landing page greeting)
};

export function Mascot({
  mood = "happy",
  size = 120,
  className,
}: {
  mood?: MascotMood;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={clsx("inline-block select-none", MOTION[mood], className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <Image
        src="/brand/youseed-logo.png"
        alt=""
        width={size}
        height={size}
        priority={size >= 120}
        className="h-full w-full object-contain drop-shadow-md"
      />
    </div>
  );
}
