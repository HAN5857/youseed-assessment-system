import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { ResultView } from "@/components/ResultView";
import { ContactStatusForm } from "./ContactStatusForm";
import Link from "next/link";

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
    include: { test: { select: { title: true, subject: true, duration: true } } },
  });
  if (!lead) notFound();
  if (session.role !== "ADMIN" && lead.tutorId !== session.uid) {
    return <div className="p-10 text-center text-sm text-red-600">Forbidden.</div>;
  }

  // Parse breakdown if completed
  const breakdown: any[] = lead.answers ? safeJson(lead.answers) ?? [] : [];

  return (
    <div className="mx-auto max-w-4xl px-6 py-6">
      <Link href="/admin" className="text-sm text-slate-500 hover:text-slate-700">← Back to leads</Link>

      <div className="mt-4">
        <ResultView lead={lead as any} test={lead.test} mode="internal" />
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate-800">CRM</h2>
        <ContactStatusForm leadId={lead.id} initialStatus={lead.contactStatus} initialNotes={lead.notes ?? ""} />
      </div>

      {breakdown.length > 0 && (
        <details className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
          <summary className="cursor-pointer text-base font-semibold text-slate-800">
            Per-question breakdown ({breakdown.length} items)
          </summary>
          <div className="mt-4 space-y-2">
            {breakdown.map((b, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
                <span className="font-mono w-6">{i + 1}.</span>
                <div className="flex-1">
                  <div className="text-slate-700">
                    <b>{b.type}</b> · {b.dimension}
                  </div>
                  <div className="mt-1 text-slate-500">
                    Response: <code className="rounded bg-white px-1">{JSON.stringify(b.response)}</code>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    b.correct ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {b.score}/{b.max}
                </span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function safeJson(s: string) { try { return JSON.parse(s); } catch { return null; } }
