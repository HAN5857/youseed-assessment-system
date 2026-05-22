import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LeadsFilters } from "./LeadsFilters";
import type { Prisma } from "@prisma/client";

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

export const dynamic = "force-dynamic";

export default async function LeadsListPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    contact?: string;
    level?: string;
    tutor?: string;
    test?: string;
  }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const sp = await searchParams;
  const isAdmin = session.role === "ADMIN";

  // Build the Prisma where clause from URL params.
  const where: Prisma.LeadWhereInput = {};
  if (!isAdmin) where.tutorId = session.uid;
  if (sp.status) where.status = sp.status;
  if (sp.contact) where.contactStatus = sp.contact;
  if (sp.level) where.level = sp.level;
  if (sp.test) where.testId = sp.test;
  if (sp.tutor && isAdmin) where.tutorId = sp.tutor;
  if (sp.q && sp.q.trim()) {
    const q = sp.q.trim();
    where.OR = [
      { name:     { contains: q } },
      { email:    { contains: q } },
      { phone:    { contains: q } },
      { location: { contains: q } },
    ];
  }

  // Fetch filtered leads + the full set of summary counts (counts always
  // reflect tutor scope, not the active filter — they answer "how many
  // total" not "how many match my filter").
  const baseScope: Prisma.LeadWhereInput = isAdmin ? {} : { tutorId: session.uid };
  const [leads, totals, tutors, tests] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: {
        test: { select: { title: true, subject: true, level: true } },
        tutor: { select: { id: true, name: true, email: true } },
      },
      orderBy: { startedAt: "desc" },
      take: 500,
    }),
    prisma.lead.groupBy({ by: ["status"], where: baseScope, _count: true }),
    isAdmin
      ? prisma.user.findMany({
          where: { active: true, role: { in: ["TUTOR", "ADMIN"] } },
          select: { id: true, name: true, email: true },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
    prisma.test.findMany({
      where: { active: true },
      select: { id: true, title: true, level: true },
      orderBy: { level: "asc" },
    }),
  ]);

  const counts = Object.fromEntries(totals.map((t) => [t.status, t._count])) as Record<string, number>;
  const hasActiveFilter = !!(sp.q || sp.status || sp.contact || sp.level || sp.tutor || sp.test);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-sm text-slate-600">
            {hasActiveFilter
              ? `${leads.length} matching ${isAdmin ? "across all prospects" : "of your prospects"}.`
              : `${leads.length} most recent ${isAdmin ? "across all prospects" : "of your prospects"}.`}
          </p>
        </div>
        <a
          href={`/api/admin/leads/export${hasActiveFilter ? `?${new URLSearchParams(sp as Record<string, string>).toString()}` : ""}`}
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

      <LeadsFilters showTutor={isAdmin} tutors={tutors} tests={tests} />

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Test</th>
                {isAdmin && <th className="px-4 py-3">Tutor</th>}
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
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <div className="text-slate-800">{l.tutor.name}</div>
                      <div className="text-xs text-slate-500">{l.tutor.email}</div>
                    </td>
                  )}
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
                  <td colSpan={isAdmin ? 9 : 8} className="px-4 py-12 text-center text-sm text-slate-500">
                    {hasActiveFilter
                      ? "No leads match the current filters. Try clearing them above."
                      : "No leads yet. Generate a passkey and share the test link."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
