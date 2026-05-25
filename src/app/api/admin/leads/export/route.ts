import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import type { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  let session;
  try { session = await requireSession(); } catch {
    return new Response("Unauthorized", { status: 401 });
  }
  const url = new URL(req.url);
  const sp = url.searchParams;
  const isSuper = session.role === "SUPERADMIN";

  // Mirror the same filter logic as /admin/page.tsx so the export reflects
  // exactly what the user is looking at on screen.
  const where: Prisma.LeadWhereInput = {};
  if (!isSuper) where.tutorId = session.uid;
  const status  = sp.get("status");  if (status)  where.status = status;
  const contact = sp.get("contact"); if (contact) where.contactStatus = contact;
  const level   = sp.get("level");   if (level)   where.level = level;
  const test    = sp.get("test");    if (test)    where.testId = test;
  const tutor   = sp.get("tutor");   if (tutor && isSuper) where.tutorId = tutor;
  const q = sp.get("q");
  if (q && q.trim()) {
    const t = q.trim();
    where.OR = [
      { name:     { contains: t } },
      { email:    { contains: t } },
      { phone:    { contains: t } },
      { location: { contains: t } },
    ];
  }

  const leads = await prisma.lead.findMany({
    where,
    include: {
      test: { select: { title: true, subject: true } },
      tutor: { select: { name: true, email: true } },
    },
    orderBy: { startedAt: "desc" },
  });

  const header = [
    "id","name","age","email","phone","location","subject","grade",
    "test","tutorName","tutorEmail",
    "status","level","percentage","totalScore","maxScore",
    "tabBlurCount","contactStatus","startedAt","submittedAt",
  ];
  const rows = leads.map((l) => [
    l.id, l.name, l.age, l.email, l.phone, l.location, l.subject, l.grade ?? "",
    l.test.title, l.tutor.name, l.tutor.email,
    l.status, l.level ?? "", l.percentage ?? "", l.totalScore ?? "", l.maxScore ?? "",
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
