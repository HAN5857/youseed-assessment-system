import { prisma } from "@/lib/db";
import { readAttemptCookie } from "@/lib/attempt-guard";
import { redirect, notFound } from "next/navigation";
import { ExamRunner } from "./ExamRunner";

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

  // Compute remaining seconds based on startedAt
  const elapsedSec = Math.floor((Date.now() - new Date(lead.startedAt).getTime()) / 1000);
  const totalSec = lead.test.duration * 60;
  const remainingSec = Math.max(0, totalSec - elapsedSec);

  // Restore any prior autosaved responses (when status=IN_PROGRESS, lead.answers stores responses map)
  const savedResponses = lead.answers ? safeJson(lead.answers) : {};

  return (
    <ExamRunner
      leadId={lead.id}
      title={lead.test.title}
      remainingSec={remainingSec}
      questions={questions}
      initialResponses={savedResponses ?? {}}
    />
  );
}

function safeJson(s: string) {
  try { return JSON.parse(s); } catch { return null; }
}
