import { prisma } from "@/lib/db";
import { readAttemptCookie } from "@/lib/attempt-guard";
import { notFound, redirect } from "next/navigation";
import { ResultView } from "@/components/ResultView";

export default async function StudentResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const guard = await readAttemptCookie(id);
  if (!guard) redirect("/test");

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: { test: { select: { title: true, subject: true, duration: true } } },
  });
  if (!lead) notFound();
  if (lead.status === "IN_PROGRESS") {
    redirect(`/test/${id}/exam`);
  }

  return <ResultView lead={lead} test={lead.test} mode="student" />;
}
