import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

export default async function TestDetailPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const { id } = await params;
  const test = await prisma.test.findUnique({
    where: { id },
    include: {
      questions: { include: { question: true }, orderBy: { order: "asc" } },
    },
  });
  if (!test) notFound();

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <Link href="/admin/tests" className="text-sm text-slate-500 hover:text-slate-700">← Back to tests</Link>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">{test.title}</h1>
      <p className="text-sm text-slate-600">
        {test.subject} · {test.duration} min · {test.questions.length} questions
      </p>

      <div className="mt-6 space-y-3">
        {test.questions.map((ql, i) => {
          const q = ql.question;
          return (
            <div key={q.id} className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs text-slate-500 mr-2">#{i + 1}</span>
                  <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">{q.type}</span>
                  <span className="ml-2 text-xs text-slate-500">{q.dimension} · L{q.level} · {q.score} pts</span>
                </div>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{q.prompt}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
