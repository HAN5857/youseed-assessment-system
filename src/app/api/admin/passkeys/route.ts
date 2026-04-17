import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { customAlphabet } from "nanoid";

const generate = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);

const createSchema = z.object({
  testId: z.string().min(1),
  count: z.number().int().min(1).max(100).default(1),
  maxUses: z.number().int().min(1).default(1),
  expiresAt: z.string().datetime().optional().nullable(),
  note: z.string().max(200).optional(),
  prefix: z.string().max(20).optional(),
});

export async function GET() {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }
  const where = session.role === "ADMIN" ? {} : { tutorId: session.uid };
  const items = await prisma.passkey.findMany({
    where,
    include: { test: { select: { title: true, subject: true } }, tutor: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ ok: true, items });
}

export async function POST(req: Request) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "BAD_REQUEST", details: parsed.error.flatten() }, { status: 400 });
  }
  const { testId, count, maxUses, expiresAt, note, prefix } = parsed.data;
  const test = await prisma.test.findUnique({ where: { id: testId } });
  if (!test) return NextResponse.json({ ok: false, error: "TEST_NOT_FOUND" }, { status: 404 });

  const created = [];
  for (let i = 0; i < count; i++) {
    const code = `${prefix ? prefix.toUpperCase() + "-" : ""}${generate()}`;
    const pk = await prisma.passkey.create({
      data: {
        code,
        testId,
        tutorId: session.uid,
        maxUses,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        note: note ?? null,
      },
    });
    created.push(pk);
  }
  return NextResponse.json({ ok: true, items: created });
}
