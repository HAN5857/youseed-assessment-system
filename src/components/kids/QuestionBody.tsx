"use client";

// Dominant question body text used by Single/Fill/Reading on the
// upper-primary tier. Renders the prompt with two specialisations:
//   1. Runs of 3+ underscores (e.g. "There ______ a big park") are turned
//      into a green underline span so the student's eye lands on the blank.
//      The underline pulses gently to invite attention.
//   2. The rest of the text uses a bigger, semi-bold dark-slate body style
//      so the question is the dominant element on screen.
//
// Sizing variant prop:
//   "large"  — Single / Fill (default): text-[24px] sm:text-[28px]
//   "medium" — Reading prompt header  : text-[19px] sm:text-[22px]

export function QuestionBody({
  text,
  size = "large",
}: {
  text: string;
  size?: "large" | "medium";
}) {
  const cls =
    size === "medium"
      ? "whitespace-pre-wrap text-[19px] font-semibold leading-snug text-[#1F2937] sm:text-[22px]"
      : "whitespace-pre-wrap text-[24px] font-semibold leading-snug text-[#1F2937] sm:text-[30px]";

  const parts = text.split(/(_{3,})/g);
  return (
    <p className={cls}>
      {parts.map((p, i) =>
        /^_{3,}$/.test(p) ? (
          <span
            key={i}
            className="kid-blank inline-block min-w-[3.5em] translate-y-[-2px] select-none border-b-[3px] border-[#18A65B] text-transparent"
            aria-label="blank to fill in"
          >
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </p>
  );
}
