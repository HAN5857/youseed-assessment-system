// ─────────────────────────────────────────────────────────────────────────
// /admin/orgs — SUPERADMIN-only organisation management.
// Create brands, set branding + passkey prefix + which tests each org may
// use, enable/disable whole orgs, and see per-org tutor/lead counts.
// ─────────────────────────────────────────────────────────────────────────

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OrgsManager } from "./OrgsManager";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OrgsPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "SUPERADMIN") redirect("/admin");

  const [orgs, tests] = await Promise.all([
    prisma.organization.findMany({
      orderBy: [{ active: "desc" }, { createdAt: "asc" }],
      include: { _count: { select: { users: true } } },
    }),
    prisma.test.findMany({
      where: { active: true },
      select: { id: true, title: true, subject: true, level: true },
      orderBy: [{ subject: "asc" }, { level: "asc" }],
    }),
  ]);

  // Lead counts per org.
  const users = await prisma.user.findMany({ select: { id: true, orgId: true } });
  const tutorToOrg = new Map(users.map((u) => [u.id, u.orgId]));
  const leadGroups = await prisma.lead.groupBy({ by: ["tutorId"], _count: true });
  const leadsByOrg = new Map<string, number>();
  for (const g of leadGroups) {
    const orgId = tutorToOrg.get(g.tutorId);
    if (orgId) leadsByOrg.set(orgId, (leadsByOrg.get(orgId) ?? 0) + g._count);
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Organisations</h1>
      <p className="mt-1 text-sm text-slate-600">
        Each organisation is an isolated brand — its admins &amp; tutors only see their own
        students, and only you (SUPERADMIN) see across all of them.
      </p>
      <OrgsManager
        tests={tests.map((t) => ({ id: t.id, title: t.title, subject: t.subject, level: t.level, key: `${t.subject}/${t.level}` }))}
        initial={orgs.map((o) => ({
          id: o.id,
          slug: o.slug,
          name: o.name,
          active: o.active,
          brandColor: o.brandColor,
          passkeyPrefix: o.passkeyPrefix,
          allowedTests: o.allowedTests,
          logoUrl: o.logoUrl,
          userCount: o._count.users,
          leadCount: leadsByOrg.get(o.id) ?? 0,
        }))}
      />
    </div>
  );
}
