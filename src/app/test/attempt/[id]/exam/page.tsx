import { prisma } from "@/lib/db";
import { readAttemptCookie } from "@/lib/attempt-guard";
import { redirect, notFound } from "next/navigation";
import { ExamRunner } from "./ExamRunner";
import { CalmExamRunner } from "./CalmExamRunner";
import { isS1Calm, levelTier } from "@/lib/s1-calm-flag";
import { getAssessmentTiming } from "@/lib/assessment-timing";

export default async function ExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const guard = await readAttemptCookie(id);
  if (!guard) redirect("/test");

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      test: {
        include: {
          questions: {
            orderBy: { order: "asc" },
            include: { question: true },
          },
        },
      },
      // The owning tutor's organisation supplies per-brand student branding.
      tutor: { include: { org: { select: { name: true, logoUrl: true, brandColor: true, active: true } } } },
    },
  });
  if (!lead) notFound();
  if (lead.status !== "IN_PROGRESS") {
    redirect(`/test/attempt/${id}/result`);
  }

  // Strip the answer key before sending to client!
  const questions = lead.test.questions.map((ql) => {
    const q = ql.question;
    return {
      id: q.id,
      type: q.type,
      dimension: q.dimension,
      score: q.score,
      prompt: q.prompt,
      mediaUrl: q.mediaUrl,
      content: q.content ? safeJson(q.content) : {},
    };
  });

  // Duration is advisory. A lead that has reached 00:00 remains IN_PROGRESS
  // until the student explicitly submits it.
  const { remainingSec } = getAssessmentTiming(lead.startedAt, lead.test.duration);

  // Restore any prior autosaved responses (when status=IN_PROGRESS, lead.answers stores responses map)
  const savedResponses = lead.answers ? safeJson(lead.answers) : {};

  const isCalm = isS1Calm(lead.test.subject, lead.test.level);
  const Runner = isCalm ? CalmExamRunner : ExamRunner;
  const tier = isCalm ? levelTier(lead.test.level) : "primary";

  // No organisation branding is shown to students. The platform is
  // multi-tenant and the student-facing exam must stay org-neutral — no org
  // logo, name, or accent colour ever reaches the runner.
  const brand = null;

  return (
    <Runner
      leadId={lead.id}
      title={lead.test.title}
      subject={lead.test.subject}
      level={lead.test.level}
      studentName={lead.name}
      remainingSec={remainingSec}
      questions={questions}
      initialResponses={savedResponses ?? {}}
      tier={tier}
      brand={brand}
    />
  );
}

function safeJson(s: string) {
  try { return JSON.parse(s); } catch { return null; }
}
