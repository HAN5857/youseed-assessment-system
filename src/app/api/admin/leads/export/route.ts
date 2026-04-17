import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";

export async function GET() {
  let session;
  try { session = await requireSession(); } catch {
    return new Response("Unauthorized", { status: 401 });
  }
  const where = session.role === "ADMIN" ? {} : { tutorId: session.uid };
  const leads = await prisma.lead.findMany({
    where,
    include: { test: { select: { title: true, subject: true } } },
    orderBy: { startedAt: "desc" },
  });

  const header = [
    "id","name","age","email","phone","location","subject","grade",
    "test","status","level","percentage","totalScore","maxScore",
    "tabBlurCount","contactStatus","startedAt","submittedAt",
  ];
  const rows = leads.map((l) => [
    l.id, l.name, l.age, l.email, l.phone, l.location, l.subject, l.grade ?? "",
    l.test.title, l.status, l.level ?? "", l.percentage ?? "", l.totalScore ?? "", l.maxScore ?? "",
    l.tabBlurCount, l.contactStatus,
    l.startedAt.toISOString(), l.submittedAt?.toISOString() ?? "",
  ]);
  const csv = [header, ...rows].map(r => r.map(csvCell).join(",")).join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().slice(0,10)}.csv"`,
    },
  });
}

function csvCell(v: any) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
