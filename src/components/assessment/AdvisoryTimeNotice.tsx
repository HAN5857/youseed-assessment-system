export function AdvisoryTimeNotice({
  chinese = false,
  completed = false,
}: {
  chinese?: boolean;
  completed?: boolean;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        "flex items-start gap-3 rounded-xl border px-3 py-2.5 text-left shadow-sm sm:items-center sm:px-4",
        chinese
          ? "border-[#e2c47f] bg-[#fff8e8] text-[#694d16]"
          : "border-amber-300 bg-amber-50 text-amber-950",
      ].join(" ")}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-0.5 h-5 w-5 shrink-0 sm:mt-0"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
        <path d="M8 2h8" />
      </svg>
      {chinese ? (
        <div className="min-w-0 leading-snug">
          <strong className="block text-sm font-extrabold sm:text-[15px]">
            {completed ? "已超过建议时间 · 成绩已正常计算" : "已超过建议时间 · 请继续作答"}
          </strong>
          <span className="mt-0.5 block text-xs font-medium text-[#796331] sm:text-[13px]">
            {completed
              ? "所有提交的答案均已计分；此标记只记录完成时间。"
              : "你的答案会继续保存，提交后也会正常计算成绩。"}
          </span>
          <span className="mt-0.5 block text-[10px] font-semibold text-[#88795a] sm:text-[11px]">
            {completed
              ? "Time exceeded · All submitted answers were scored normally."
              : "Time exceeded · You can continue. All submitted answers will be scored normally."}
          </span>
        </div>
      ) : (
        <div className="min-w-0 leading-snug">
          <strong className="block text-sm font-extrabold sm:text-[15px]">
            {completed ? "Time exceeded · Score calculated normally" : "Time exceeded · Please continue"}
          </strong>
          <span className="mt-0.5 block text-xs font-medium text-amber-900 sm:text-[13px]">
            {completed
              ? "All submitted answers were scored. This badge only records the completion time."
              : "Your answers will keep saving and your submitted work will be scored normally."}
          </span>
        </div>
      )}
    </div>
  );
}
