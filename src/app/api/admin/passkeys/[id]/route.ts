import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  let session;
  try { session = await requireSession(); } catch {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const pk = await prisma.passkey.findUnique({ where: { id } });
  if (!pk) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
  if (session.role !== "ADMIN" && pk.tutorId !== session.uid) {
    return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
  }
  const updated = await prisma.passkey.update({
    where: { id },
    data: { active: typeof body.active === "boolean" ? body.active : undefined },
  });
  return NextResponse.json({ ok: true, item: updated });
}
