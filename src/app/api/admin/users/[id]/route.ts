import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSession, hashPassword } from "@/lib/auth";
import { customAlphabet } from "nanoid";

const generatePassword = customAlphabet(
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789",
  14,
);

const patchSchema = z.object({
  action: z.enum(["toggle-active", "reset-password", "rename", "set-org"]).optional(),
  active: z.boolean().optional(),
  name: z.string().min(1).max(120).optional(),
  // Organization.id (or null to remove from any org). SUPERADMIN only.
  orgId: z.string().optional().nullable(),
  // Optional specific password for the reset-password action. When omitted,
  // a strong random one is generated (existing behaviour). Min 8 lets an
  // admin set an easy-to-remember password for a tutor.
  newPassword: z.string().min(8).max(200).optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }
  // SUPERADMIN can touch anyone; ADMIN+org can touch teammates; others 403.
  const canOrgManage = session.role === "SUPERADMIN" || (session.role === "ADMIN" && !!session.orgId);
  if (!canOrgManage) {
    return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
  }
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "BAD_REQUEST", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
  // ADMIN can only touch users in their org (never SUPERADMIN, never other orgs).
  if (session.role !== "SUPERADMIN") {
    if (target.role === "SUPERADMIN" || target.orgId !== session.orgId) {
      return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
    }
  }
  // Only SUPERADMIN can change a user's org (moving a tutor between brands
  // is a governance action, not something a brand admin should self-serve).
  if (parsed.data.action === "set-org" && session.role !== "SUPERADMIN") {
    return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
  }

  // Safety: an admin cannot deactivate themselves (would lock them out).
  if (parsed.data.action === "toggle-active" || typeof parsed.data.active === "boolean") {
    if (target.id === session.uid && (parsed.data.active === false || (parsed.data.action === "toggle-active" && target.active))) {
      return NextResponse.json(
        { ok: false, error: "CANNOT_DEACTIVATE_SELF" },
        { status: 400 },
      );
    }
  }

  // ── Reset password (random) OR set a specific password (edit) ──
  if (parsed.data.action === "reset-password") {
    const custom = !!parsed.data.newPassword;
    const newPassword = parsed.data.newPassword ?? generatePassword();
    const passwordHash = await hashPassword(newPassword);
    const user = await prisma.user.update({
      where: { id },
      data: { passwordHash },
      select: { id: true, email: true, name: true, role: true, org: true, active: true, createdAt: true },
    });
    // Echo the password back so the admin can hand it over. For a custom
    // password the admin already knows it, but returning it keeps the
    // one-time reveal banner UX consistent.
    return NextResponse.json({ ok: true, user, newPassword, custom });
  }

  // ── Toggle active OR explicit active boolean ──
  let nextActive: boolean | undefined;
  if (parsed.data.action === "toggle-active") {
    nextActive = !target.active;
  } else if (typeof parsed.data.active === "boolean") {
    nextActive = parsed.data.active;
  }

  // Org set action (SUPERADMIN only, already gated above). Validate the
  // target org exists before assigning to avoid dangling FKs.
  let nextOrgId: string | null | undefined;
  if (parsed.data.action === "set-org") {
    nextOrgId = parsed.data.orgId?.trim() || null;
    if (nextOrgId) {
      const exists = await prisma.organization.findUnique({ where: { id: nextOrgId }, select: { id: true } });
      if (!exists) {
        return NextResponse.json({ ok: false, error: "ORG_NOT_FOUND" }, { status: 400 });
      }
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(typeof nextActive === "boolean" ? { active: nextActive } : {}),
      ...(parsed.data.name ? { name: parsed.data.name.trim() } : {}),
      ...(nextOrgId !== undefined ? { orgId: nextOrgId } : {}),
    },
    select: {
      id: true, email: true, name: true, role: true, orgId: true,
      org: { select: { slug: true, name: true } }, active: true, createdAt: true,
    },
  });
  return NextResponse.json({ ok: true, user });
}
