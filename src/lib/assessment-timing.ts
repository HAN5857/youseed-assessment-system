const MS_PER_SECOND = 1_000;
const MS_PER_MINUTE = 60_000;

export type AssessmentTiming = {
  elapsedSec: number;
  remainingSec: number;
  isOvertime: boolean;
};

/**
 * Assessment duration is advisory: reaching the deadline never blocks input
 * or submits an attempt. This helper is shared by the page and submit API so
 * the browser display and the persisted completion status use one policy.
 */
export function getAssessmentTiming(
  startedAt: Date | string | number,
  durationMinutes: number,
  now: Date | string | number = Date.now(),
): AssessmentTiming {
  const startMs = toTimestamp(startedAt);
  const nowMs = toTimestamp(now);
  const durationMs = Math.max(0, durationMinutes) * MS_PER_MINUTE;
  const deadlineMs = startMs + durationMs;

  return {
    elapsedSec: Math.max(0, Math.floor((nowMs - startMs) / MS_PER_SECOND)),
    remainingSec: Math.max(0, Math.ceil((deadlineMs - nowMs) / MS_PER_SECOND)),
    isOvertime: nowMs >= deadlineMs,
  };
}

export function assessmentCompletionStatus(timing: AssessmentTiming): "COMPLETED" | "TIMEOUT" {
  return timing.isOvertime ? "TIMEOUT" : "COMPLETED";
}

function toTimestamp(value: Date | string | number): number {
  const timestamp = value instanceof Date ? value.getTime() : new Date(value).getTime();
  if (!Number.isFinite(timestamp)) throw new TypeError("Invalid assessment timestamp");
  return timestamp;
}
