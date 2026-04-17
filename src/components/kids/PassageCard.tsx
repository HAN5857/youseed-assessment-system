"use client";

// Reusable notebook-paper card for reading passages.
// Used by ReadingRenderer and by Single/Multi renderers when content.passage is set.

export function PassageCard({
  text,
  hint = "📚 Take your time — read it twice!",
}: {
  text: string;
  hint?: string;
}) {
  return (
    <div className="relative">
      <div
        className="relative overflow-hidden rounded-3xl border-4 border-amber-200 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 py-6 pl-12 pr-5 shadow-[0_10px_25px_rgba(161,98,7,0.15)] sm:py-7 sm:pl-14 sm:pr-7"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent 0, transparent 33px, rgba(251, 191, 36, 0.22) 33px, rgba(251, 191, 36, 0.22) 34px)",
          backgroundAttachment: "local",
        }}
      >
        {/* Red margin line */}
        <div
          className="pointer-events-none absolute bottom-0 top-0 w-[2px] bg-rose-300/70"
          style={{ left: "40px" }}
          aria-hidden
        />

        {/* Spiral-binding dots down the left edge */}
        <div className="pointer-events-none absolute bottom-3 left-2 top-3 flex flex-col justify-around" aria-hidden>
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="block h-3.5 w-3.5 rounded-full bg-white shadow-[inset_0_2px_3px_rgba(0,0,0,0.2)] ring-2 ring-amber-300"
            />
          ))}
        </div>

        {/* Corner doodle */}
        <span className="pointer-events-none absolute right-3 top-3 text-2xl opacity-70" aria-hidden>
          ✏️
        </span>

        {/* Passage text */}
        <p
          className="relative whitespace-pre-wrap text-[17px] font-medium leading-[34px] tracking-wide text-slate-800 sm:text-lg sm:leading-[36px]"
          style={{ fontFamily: "'Comic Sans MS', 'Fredoka', 'Nunito', system-ui, sans-serif" }}
        >
          {text}
        </p>
      </div>

      {/* Bookmark ribbon */}
      <div
        className="pointer-events-none absolute -top-2 right-10 h-16 w-8 bg-gradient-to-b from-pink-500 to-rose-600 shadow-md"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 75%, 0 100%)" }}
        aria-hidden
      />

      {hint && (
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
          {hint}
        </div>
      )}
    </div>
  );
}
