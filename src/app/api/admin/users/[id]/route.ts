import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSuperAdmin, hashPassword } from "@/lib/auth";
import { customAlphabet } from "nanoid";

const generatePassword = customAlphabet(
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789",
  14,
);

const patchSchema = z.object({
  action: z.enum(["toggle-active", "reset-password", "rename"]).optional(),
  active: z.boolean().optional(),
  name: z.string().min(1).max(120).optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  let session;
  try {
    session = await requireSuperAdmin();
  } catch (e: any) {
    const code = e?.message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ ok: false, error: e?.message ?? "UNAUTHORIZED" }, { status: code });
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

  // Safety: an admin cannot deactivate themselves (would lock them out).
  if (parsed.data.action === "toggle-active" || typeof parsed.data.active === "boolean") {
    if (target.id === session.uid && (parsed.data.active === false || (parsed.data.action === "toggle-active" && target.active))) {
      return NextResponse.json(
        { ok: false, error: "CANNOT_DEACTIVATE_SELF" },
        { status: 400 },
      );
    }
  }

  // ── Reset password ──
  if (parsed.data.action === "reset-password") {
    const newPassword = generatePassword();
    const passwordHash = await hashPassword(newPassword);
    const user = await prisma.user.update({
      where: { id },
      data: { passwordHash },
      select: { id: true, email: true, name: true, role: true, active: true, createdAt: true },
    });
    return NextResponse.json({ ok: true, user, newPassword });
  }

  // ── Toggle active OR explicit active boolean ──
  let nextActive: boolean | undefined;
  if (parsed.data.action === "toggle-active") {
    nextActive = !target.active;
  } else if (typeof parsed.data.active === "boolean") {
    nextActive = parsed.data.active;
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(typeof nextActive === "boolean" ? { active: nextActive } : {}),
      ...(parsed.data.name ? { name: parsed.data.name.trim() } : {}),
    },
    select: { id: true, email: true, name: true, role: true, active: true, createdAt: true },
  });
  return NextResponse.json({ ok: true, user });
}
