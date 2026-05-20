"use client";

// Small supporting-text hint shown above the dominant question body on the
// upper-primary tier. Visual hierarchy:
//   1. Question content   (biggest, dominant)
//   2. Answer interaction (medium, interactive)
//   3. Instruction hint   (small, muted) ← this component
//
// Renders a tiny green info circle + muted-gray sentence-case text. Subtle
// enough to scan, never competes with the question.

export function InstructionHint({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="mb-3 flex items-start gap-2 sm:mb-4">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#18A65B"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-[3px] flex-none"
        aria-hidden
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
      <span className="text-[12px] font-normal leading-[1.5] text-[#6B7280] sm:text-[13px]">
        {text}
      </span>
    </div>
  );
}
