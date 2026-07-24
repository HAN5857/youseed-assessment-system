// ─────────────────────────────────────────────────────────────────────────
// Self-serve password change for the CURRENTLY signed-in user.
//
// Any signed-in user (TUTOR, ADMIN, SUPERADMIN) can call this to rotate
// their OWN password. Requires the current password for verification so
// a stolen session cookie cannot lock the owner out.
//
// Endpoint: POST /api/admin/account/password
// Body:     { currentPassword, newPassword }
// Errors:   401 UNAUTHORIZED · 400 BAD_REQUEST · 403 WRONG_CURRENT_PASSWORD
// ─────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSession, hashPassword, verifyPassword } from "@/lib/auth";

const schema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(8).max(200),
});

export async function POST(req: Request) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "BAD_REQUEST", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { currentPassword, newPassword } = parsed.data;

  // Reject if new === current — makes the intent of the change obvious.
  if (currentPassword === newPassword) {
    return NextResponse.json(
      { ok: false, error: "SAME_AS_CURRENT",
        message: "The new password must be different from the current one." },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({ where: { id: session.uid } });
  if (!user) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });

  const ok = await verifyPassword(currentPassword, user.passwordHash);
  if (!ok) {
    return NextResponse.json(
      { ok: false, error: "WRONG_CURRENT_PASSWORD",
        message: "Current password is incorrect." },
      { status: 403 },
    );
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return NextResponse.json({ ok: true });
}
