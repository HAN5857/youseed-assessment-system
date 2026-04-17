import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";

const patchSchema = z.object({
  contactStatus: z.enum(["NEW", "CONTACTED", "ENROLLED", "LOST"]).optional(),
  notes: z.string().max(2000).optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  let session;
  try { session = await requireSession(); } catch {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
  if (session.role !== "ADMIN" && lead.tutorId !== session.uid) {
    return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "BAD_REQUEST" }, { status: 400 });
  }
  const updated = await prisma.lead.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ ok: true, item: updated });
}
