import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { assessmentCompletionStatus, getAssessmentTiming } from "../src/lib/assessment-timing";
import { scoreAnswer } from "../src/lib/question-types";

const start = new Date("2026-01-01T00:00:00.000Z");

// Normal countdown and exact boundary.
assert.deepEqual(getAssessmentTiming(start, 20, new Date("2026-01-01T00:19:59.000Z")), {
  elapsedSec: 1_199,
  remainingSec: 1,
  isOvertime: false,
});
assert.equal(assessmentCompletionStatus(getAssessmentTiming(start, 20, new Date("2026-01-01T00:20:00.000Z"))), "TIMEOUT");

// Far beyond the recommended duration remains a valid, deterministic state.
const farOvertime = getAssessmentTiming(start, 20, new Date("2026-01-03T00:00:00.000Z"));
assert.equal(farOvertime.remainingSec, 0);
assert.equal(farOvertime.isOvertime, true);
assert.equal(assessmentCompletionStatus(farOvertime), "TIMEOUT");

// Scoring is independent from elapsed time: a correct response still earns
// its full mark after the attempt is classified as overtime.
const scored = scoreAnswer("SINGLE", { key: "B" }, { key: "B" }, 4, {});
assert.equal(scored.score, 4);
assert.equal(scored.correct, true);

// Regression guard: neither runner may auto-submit when its timer reaches 0.
for (const relative of [
  "src/app/test/attempt/[id]/exam/ExamRunner.tsx",
  "src/app/test/attempt/[id]/exam/CalmExamRunner.tsx",
]) {
  const source = readFileSync(resolve(relative), "utf8");
  assert.doesNotMatch(source, /handleSubmit\(true\)/, `${relative} must not auto-submit on expiry`);
  assert.match(source, /<AdvisoryTimeNotice/, `${relative} must show the overtime notice`);
}

const submitRoute = readFileSync(resolve("src/app/api/lead/[id]/submit/route.ts"), "utf8");
assert.match(submitRoute, /getAssessmentTiming\(lead\.startedAt, lead\.test\.duration, submittedAt\)/);
assert.match(submitRoute, /assessmentCompletionStatus\(timing\)/);
assert.doesNotMatch(submitRoute, /parsed\.data\.timedOut/);

const autosaveRoute = readFileSync(resolve("src/app/api/lead/[id]/autosave/route.ts"), "utf8");
assert.match(autosaveRoute, /updateMany/);
assert.match(autosaveRoute, /status: "IN_PROGRESS"/);

console.log("Advisory timer verification passed: boundary, overtime, scoring, runners, submit API, and autosave guard.");
