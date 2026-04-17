import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({ code: z.string().min(3).max(64) });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid passkey format" }, { status: 400 });
  }
  const code = parsed.data.code.trim().toUpperCase();

  const passkey = await prisma.passkey.findUnique({
    where: { code },
    include: { test: { select: { id: true, title: true, subject: true, duration: true, scope: true, active: true } } },
  });

  if (!passkey || !passkey.active || !passkey.test.active) {
    return NextResponse.json({ ok: false, error: "Invalid or inactive passkey" }, { status: 404 });
  }
  if (passkey.expiresAt && passkey.expiresAt < new Date()) {
    return NextResponse.json({ ok: false, error: "Passkey has expired" }, { status: 410 });
  }
  if (passkey.usedCount >= passkey.maxUses) {
    return NextResponse.json({ ok: false, error: "Passkey has reached its usage limit" }, { status: 410 });
  }

  return NextResponse.json({
    ok: true,
    test: passkey.test,
    passkeyId: passkey.id,
  });
}
