import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { readAttemptCookie } from "@/lib/attempt-guard";

const schema = z.object({
  responses: z.record(z.string(), z.any()),
  tabBlurDelta: z.number().int().nonnegative().optional(),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const guard = await readAttemptCookie(id);
  if (!guard) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "BAD_REQUEST" }, { status: 400 });

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
  if (lead.status !== "IN_PROGRESS") {
    return NextResponse.json({ ok: false, error: "ALREADY_SUBMITTED" }, { status: 409 });
  }

  await prisma.lead.update({
    where: { id },
    data: {
      answers: JSON.stringify(parsed.data.responses),
      tabBlurCount:
        parsed.data.tabBlurDelta != null
          ? { increment: parsed.data.tabBlurDelta }
          : undefined,
    },
  });

  return NextResponse.json({ ok: true });
}
