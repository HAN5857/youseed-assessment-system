// ─────────────────────────────────────────────────────────────────────────
// Organizations API (SUPERADMIN only).
//   GET  → list all orgs with tutor + lead counts
//   POST → create a new org
// Per-org config (branding, passkey prefix, allowed tests) is edited via
// PATCH on /api/admin/orgs/[id].
// ─────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth";
import { cleanSlug } from "@/lib/org-access";

const createSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().min(2).max(40),
  brandColor: z.string().max(20).optional().nullable(),
  passkeyPrefix: z.string().max(20).optional().nullable(),
});

export async function GET() {
  try {
    await requireSuperAdmin();
  } catch (e: any) {
    const code = e?.message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ ok: false, error: e?.message ?? "UNAUTHORIZED" }, { status: code });
  }
  const orgs = await prisma.organization.findMany({
    orderBy: [{ active: "desc" }, { createdAt: "asc" }],
    include: { _count: { select: { users: true } } },
  });
  // Lead counts per org require a groupBy on the tutor's org — do it in one
  // pass: fetch all users' (id → orgId), then group leads by tutorId.
  const users = await prisma.user.findMany({ select: { id: true, orgId: true } });
  const tutorToOrg = new Map(users.map((u) => [u.id, u.orgId]));
  const leadGroups = await prisma.lead.groupBy({ by: ["tutorId"], _count: true });
  const leadsByOrg = new Map<string, number>();
  for (const g of leadGroups) {
    const orgId = tutorToOrg.get(g.tutorId);
    if (!orgId) continue;
    leadsByOrg.set(orgId, (leadsByOrg.get(orgId) ?? 0) + g._count);
  }
  const items = orgs.map((o) => ({
    id: o.id,
    slug: o.slug,
    name: o.name,
    active: o.active,
    brandColor: o.brandColor,
    passkeyPrefix: o.passkeyPrefix,
    allowedTests: o.allowedTests,
    logoUrl: o.logoUrl,
    createdAt: o.createdAt.toISOString(),
    userCount: o._count.users,
    leadCount: leadsByOrg.get(o.id) ?? 0,
  }));
  return NextResponse.json({ ok: true, items });
}

export async function POST(req: Request) {
  try {
    await requireSuperAdmin();
  } catch (e: any) {
    const code = e?.message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ ok: false, error: e?.message ?? "UNAUTHORIZED" }, { status: code });
  }
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "BAD_REQUEST", details: parsed.error.flatten() }, { status: 400 });
  }
  const slug = cleanSlug(parsed.data.slug);
  if (slug.length < 2) {
    return NextResponse.json({ ok: false, error: "BAD_SLUG", message: "Slug needs at least 2 valid characters (a–z, 0–9, _, -)." }, { status: 400 });
  }
  const existing = await prisma.organization.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ ok: false, error: "SLUG_TAKEN", message: `An organisation with slug "${slug}" already exists.` }, { status: 409 });
  }
  const org = await prisma.organization.create({
    data: {
      name: parsed.data.name.trim(),
      slug,
      brandColor: parsed.data.brandColor?.trim() || null,
      passkeyPrefix: parsed.data.passkeyPrefix ? cleanSlug(parsed.data.passkeyPrefix).toUpperCase() : null,
      active: true,
    },
  });
  return NextResponse.json({ ok: true, org });
}
