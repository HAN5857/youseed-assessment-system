import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

const STATUS_LABEL: Record<string, string> = {
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  TIMEOUT: "Timed out",
  ABANDONED: "Abandoned",
};
const STATUS_COLOR: Record<string, string> = {
  IN_PROGRESS: "bg-amber-100 text-amber-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  TIMEOUT: "bg-orange-100 text-orange-800",
  ABANDONED: "bg-slate-100 text-slate-700",
};
const CONTACT_COLOR: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-800",
  CONTACTED: "bg-purple-100 text-purple-800",
  ENROLLED: "bg-emerald-100 text-emerald-800",
  LOST: "bg-rose-100 text-rose-800",
};

export default async function LeadsListPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const where = session.role === "ADMIN" ? {} : { tutorId: session.uid };
  const [leads, totals] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: { test: { select: { title: true, subject: true } } },
      orderBy: { startedAt: "desc" },
      take: 200,
    }),
    prisma.lead.groupBy({ by: ["status"], where, _count: true }),
  ]);

  const counts = Object.fromEntries(totals.map((t) => [t.status, t._count])) as Record<string, number>;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-sm text-slate-600">
            {leads.length} most recent {session.role === "TUTOR" ? "of your" : "across all"} prospects.
          </p>
        </div>
        <a
          href="/api/admin/leads/export"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Export CSV
        </a>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(["COMPLETED","IN_PROGRESS","TIMEOUT","ABANDONED"] as const).map((s) => (
          <div key={s} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="text-xs uppercase tracking-wide text-slate-500">{STATUS_LABEL[s]}</div>
            <div className="mt-1 text-2xl font-bold text-slate-800">{counts[s] ?? 0}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Test</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Level</th>
              <th className="px-4 py-3">CRM</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{l.name}</div>
                  <div className="text-xs text-slate-500">{l.email}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-slate-800">{l.test.title}</div>
                  <div className="text-xs text-slate-500">{l.test.subject}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[l.status] ?? "bg-slate-100"}`}>
                    {STATUS_LABEL[l.status] ?? l.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs">
                  {l.percentage != null ? `${l.percentage}%` : "—"}
                </td>
                <td className="px-4 py-3 font-semibold">{l.level ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CONTACT_COLOR[l.contactStatus] ?? "bg-slate-100"}`}>
                    {l.contactStatus}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {l.submittedAt ? new Date(l.submittedAt).toLocaleString() : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/leads/${l.id}`} className="text-sm font-medium text-indigo-600 hover:underline">
                    View →
                  </Link>
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-500">
                  No leads yet. Generate a passkey and share the test link.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
