import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { readAttemptCookie } from "@/lib/attempt-guard";
import { scoreAnswer } from "@/lib/question-types";
import { getLevel } from "@/lib/level";

const schema = z.object({
  responses: z.record(z.string(), z.any()),
  timedOut: z.boolean().optional(),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const guard = await readAttemptCookie(id);
  if (!guard) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "BAD_REQUEST" }, { status: 400 });

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
  if (lead.status !== "IN_PROGRESS") {
    // Idempotent: return existing result
    return NextResponse.json({ ok: true, alreadySubmitted: true });
  }

  const links = await prisma.questionLink.findMany({
    where: { testId: lead.testId },
    include: { question: true },
    orderBy: { order: "asc" },
  });

  let totalScore = 0;
  let maxScore = 0;
  const dimTotal: Record<string, number> = {};
  const dimMax: Record<string, number> = {};
  const breakdown: Array<{
    questionId: string;
    type: string;
    dimension: string;
    response: any;
    score: number;
    max: number;
    correct: boolean;
  }> = [];

  for (const link of links) {
    const q = link.question;
    const max = q.score;
    maxScore += max;
    dimMax[q.dimension] = (dimMax[q.dimension] ?? 0) + max;

    const response = parsed.data.responses[q.id];
    const content = q.content ? safeJson(q.content) : {};
    const correctAnswer = q.answer ? safeJson(q.answer) : null;
    const result = scoreAnswer(q.type, correctAnswer, response, max, content);

    totalScore += result.score;
    dimTotal[q.dimension] = (dimTotal[q.dimension] ?? 0) + result.score;

    breakdown.push({
      questionId: q.id,
      type: q.type,
      dimension: q.dimension,
      response: response ?? null,
      score: result.score,
      max,
      correct: result.correct,
    });
  }

  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 1000) / 10 : 0;
  const level = getLevel(percentage);
  const dimScores: Record<string, number> = {};
  for (const k of Object.keys(dimMax)) {
    dimScores[k] = Math.round(((dimTotal[k] ?? 0) / dimMax[k]) * 1000) / 10;
  }

  await prisma.lead.update({
    where: { id },
    data: {
      status: parsed.data.timedOut ? "TIMEOUT" : "COMPLETED",
      submittedAt: new Date(),
      totalScore,
      maxScore,
      percentage,
      level: level.code,
      dimScores: JSON.stringify(dimScores),
      answers: JSON.stringify(breakdown),
    },
  });

  return NextResponse.json({ ok: true, leadId: id });
}

function safeJson(s: string | null | undefined) {
  if (!s) return null;
  try { return JSON.parse(s); } catch { return null; }
}
