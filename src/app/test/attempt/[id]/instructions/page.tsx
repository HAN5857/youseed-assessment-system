import { prisma } from "@/lib/db";
import { readAttemptCookie } from "@/lib/attempt-guard";
import { redirect, notFound } from "next/navigation";
import { InstructionsView } from "./InstructionsView";

export default async function InstructionsPage({
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
          questions: { include: { question: { select: { dimension: true } } } },
        },
      },
    },
  });
  if (!lead) notFound();
  if (lead.status !== "IN_PROGRESS") redirect(`/test/attempt/${id}/result`);

  // Aggregate dimension counts
  const dimensionCounts = new Map<string, number>();
  for (const ql of lead.test.questions) {
    const d = ql.question.dimension;
    dimensionCounts.set(d, (dimensionCounts.get(d) ?? 0) + 1);
  }

  return (
    <InstructionsView
      leadId={lead.id}
      studentName={lead.name}
      testTitle={lead.test.title}
      testSubject={lead.test.subject}
      duration={lead.test.duration}
      passingScore={lead.test.passingScore}
      totalQuestions={lead.test.questions.length}
      dimensionCounts={Array.from(dimensionCounts.entries())}
    />
  );
}
