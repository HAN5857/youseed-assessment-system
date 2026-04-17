"use client";

// Fills with colored stars as the student progresses.
// Answered = gold star, current = pulsing, not yet = grey outline.

export function StarProgress({
  total,
  answered,
  current,
}: {
  total: number;
  answered: Set<number>;
  current: number;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Array.from({ length: total }).map((_, i) => {
        const isAnswered = answered.has(i);
        const isCurrent = i === current;
        return (
          <div
            key={i}
            className={[
              "grid place-items-center rounded-full h-7 w-7 text-sm transition-all",
              isAnswered ? "bg-yellow-300 text-orange-600 shadow-inner" : "bg-white/40 text-white/60",
              isCurrent ? "kid-pulse ring-2 ring-white" : "",
            ].join(" ")}
            aria-label={`Question ${i + 1} ${isAnswered ? "answered" : "not answered"}`}
          >
            {isAnswered ? "★" : "☆"}
          </div>
        );
      })}
    </div>
  );
}
