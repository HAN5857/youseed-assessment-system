import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { ResultView } from "@/components/ResultView";
import { ContactStatusForm } from "./ContactStatusForm";
import Link from "next/link";
import { AnswerBreakdown, type EnrichedAnswer } from "./AnswerBreakdown";

type Breakdown = {
  questionId: string;
  type: string;
  dimension: string;
  response: any;
  score: number;
  max: number;
  correct: boolean;
};

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const { id } = await params;

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      test: { select: { title: true, subject: true, level: true, duration: true } },
      tutor: { select: { name: true, email: true } },
    },
  });
  if (!lead) notFound();
  if (session.role !== "ADMIN" && lead.tutorId !== session.uid) {
    return <div className="p-10 text-center text-sm text-red-600">Forbidden.</div>;
  }

  const breakdown: Breakdown[] = lead.answers ? safeJson(lead.answers) ?? [] : [];

  // Enrich the breakdown with the actual question prompts + correct answers.
  // We look up the Question rows by id in one query for performance.
  let enriched: EnrichedAnswer[] = [];
  if (breakdown.length > 0) {
    const qIds = breakdown.map((b) => b.questionId);
    const qRows = await prisma.question.findMany({
      where: { id: { in: qIds } },
      select: { id: true, prompt: true, content: true, answer: true },
    });
    const byId = Object.fromEntries(qRows.map((q) => [q.id, q]));

    // Preserve the order they were answered in (the breakdown reflects test order)
    enriched = breakdown.map((b, idx) => {
      const q = byId[b.questionId];
      return {
        index: idx + 1,
        questionId: b.questionId,
        type: b.type,
        dimension: b.dimension,
        prompt: q?.prompt ?? "(question deleted)",
        content: q?.content ? safeJson(q.content) : null,
        correctAnswer: q?.answer ? safeJson(q.answer) : null,
        response: b.response ?? null,
        score: b.score,
        max: b.max,
        correct: b.correct,
      };
    });
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-6">
      <div className="flex items-center justify-between">
        <Link href="/admin" className="text-sm text-slate-500 hover:text-slate-700">
          ← Back to leads
        </Link>
        <div className="flex items-center gap-2">
          <a
            href={`/api/admin/leads/${lead.id}/answers.csv`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download answers CSV
          </a>
          <a
            href={`/api/admin/leads/${lead.id}/answers.csv?format=json`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            JSON
          </a>
        </div>
      </div>

      <div className="mt-4">
        <ResultView lead={lead as any} test={lead.test} mode="internal" />
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-800">CRM</h2>
            {session.role === "ADMIN" && (
              <p className="mt-1 text-xs text-slate-500">
                Owned by tutor <b>{lead.tutor.name}</b> ({lead.tutor.email})
              </p>
            )}
          </div>
        </div>
        <ContactStatusForm leadId={lead.id} initialStatus={lead.contactStatus} initialNotes={lead.notes ?? ""} />
      </div>

      {enriched.length > 0 && (
        <div className="mt-6">
          <AnswerBreakdown items={enriched} />
        </div>
      )}

      {enriched.length === 0 && lead.status === "IN_PROGRESS" && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          This attempt is still in progress — no answers to display yet.
        </div>
      )}
    </div>
  );
}

function safeJson(s: string) { try { return JSON.parse(s); } catch { return null; } }
