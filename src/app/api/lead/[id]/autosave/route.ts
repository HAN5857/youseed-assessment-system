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

  // The status predicate makes autosave atomic with submission: a delayed
  // autosave can never overwrite the scored question-by-question breakdown.
  const updated = await prisma.lead.updateMany({
    where: { id, status: "IN_PROGRESS" },
    data: {
      answers: JSON.stringify(parsed.data.responses),
      tabBlurCount:
        parsed.data.tabBlurDelta != null
          ? { increment: parsed.data.tabBlurDelta }
          : undefined,
    },
  });

  if (updated.count === 0) {
    const exists = await prisma.lead.count({ where: { id } });
    return NextResponse.json(
      { ok: false, error: exists ? "ALREADY_SUBMITTED" : "NOT_FOUND" },
      { status: exists ? 409 : 404 },
    );
  }

  return NextResponse.json({ ok: true });
}
