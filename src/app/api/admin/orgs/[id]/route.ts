// ─────────────────────────────────────────────────────────────────────────
// Single-organization PATCH (SUPERADMIN only). Edit name / branding /
// passkey prefix / allowed tests, or toggle active.
//
// allowedTests is stored as a JSON string array of "subject/level" keys
// (e.g. ["english/standard-1","chinese/standard-2"]) or null = all allowed.
// ─────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth";
import { cleanSlug } from "../route";

const patchSchema = z.object({
  action: z.enum(["update", "toggle-active"]).default("update"),
  name: z.string().min(1).max(120).optional(),
  brandColor: z.string().max(20).optional().nullable(),
  logoUrl: z.string().max(500_000).optional().nullable(), // allows small data: URIs
  passkeyPrefix: z.string().max(20).optional().nullable(),
  // Array of "subject/level" keys, or null to allow everything.
  allowedTests: z.array(z.string().max(60)).optional().nullable(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireSuperAdmin();
  } catch (e: any) {
    const code = e?.message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ ok: false, error: e?.message ?? "UNAUTHORIZED" }, { status: code });
  }
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "BAD_REQUEST", details: parsed.error.flatten() }, { status: 400 });
  }
  const org = await prisma.organization.findUnique({ where: { id } });
  if (!org) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });

  if (parsed.data.action === "toggle-active") {
    const updated = await prisma.organization.update({
      where: { id },
      data: { active: !org.active },
    });
    return NextResponse.json({ ok: true, org: serialize(updated) });
  }

  const d = parsed.data;
  const updated = await prisma.organization.update({
    where: { id },
    data: {
      ...(d.name !== undefined ? { name: d.name.trim() } : {}),
      ...(d.brandColor !== undefined ? { brandColor: d.brandColor?.trim() || null } : {}),
      ...(d.logoUrl !== undefined ? { logoUrl: d.logoUrl || null } : {}),
      ...(d.passkeyPrefix !== undefined
        ? { passkeyPrefix: d.passkeyPrefix ? cleanSlug(d.passkeyPrefix).toUpperCase() : null }
        : {}),
      ...(d.allowedTests !== undefined
        ? { allowedTests: d.allowedTests && d.allowedTests.length > 0 ? JSON.stringify(d.allowedTests) : null }
        : {}),
    },
  });
  return NextResponse.json({ ok: true, org: serialize(updated) });
}

function serialize(o: any) {
  return {
    id: o.id, slug: o.slug, name: o.name, active: o.active,
    brandColor: o.brandColor, passkeyPrefix: o.passkeyPrefix,
    allowedTests: o.allowedTests, logoUrl: o.logoUrl,
    createdAt: o.createdAt.toISOString(),
  };
}
