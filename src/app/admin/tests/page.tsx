import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function TestsListPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const tests = await prisma.test.findMany({
    include: { _count: { select: { questions: true, leads: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Tests</h1>
      <p className="text-sm text-slate-600">All test papers. Tap a row to inspect questions.</p>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Questions</th>
              <th className="px-4 py-3">Leads</th>
              <th className="px-4 py-3">Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tests.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">
                  <Link href={`/admin/tests/${t.id}`} className="hover:text-indigo-600">{t.title}</Link>
                </td>
                <td className="px-4 py-3">{t.subject}</td>
                <td className="px-4 py-3">{t.duration} min</td>
                <td className="px-4 py-3">{t._count.questions}</td>
                <td className="px-4 py-3">{t._count.leads}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    t.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
                  }`}>{t.active ? "Active" : "Draft"}</span>
                </td>
              </tr>
            ))}
            {tests.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">No tests yet. Run the seed.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-slate-500">
        Question authoring UI is in v2. For now, edit questions via the seed file or directly in the DB.
      </p>
    </div>
  );
}
