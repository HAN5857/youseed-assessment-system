import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { signAttemptToken } from "@/lib/auth";
import { withApi } from "@/lib/api";

const schema = z.object({
  passkeyCode: z.string().min(3).max(64),
  name: z.string().min(1).max(100),
  age: z.coerce.number().int().min(4).max(99),
  email: z.string().email(),
  phone: z.string().min(5).max(30),
  location: z.string().min(1).max(100),
  subject: z.string().min(1).max(50),
  grade: z.string().max(50).optional().nullable(),
});

export async function POST(req: Request) {
  return withApi(async () => {
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Please fill in all required fields correctly.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const code = data.passkeyCode.trim().toUpperCase();

    const passkey = await prisma.passkey.findUnique({ where: { code } });
    if (!passkey || !passkey.active) {
      return NextResponse.json({ ok: false, error: "Invalid passkey" }, { status: 404 });
    }
    if (passkey.expiresAt && passkey.expiresAt < new Date()) {
      return NextResponse.json({ ok: false, error: "Passkey has expired" }, { status: 410 });
    }
    if (passkey.usedCount >= passkey.maxUses) {
      return NextResponse.json({ ok: false, error: "Passkey usage limit reached" }, { status: 410 });
    }

    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
    const ua = h.get("user-agent") || null;

    const lead = await prisma.$transaction(async (tx) => {
      const created = await tx.lead.create({
        data: {
          passkeyId: passkey.id,
          tutorId: passkey.tutorId,
          testId: passkey.testId,
          name: data.name,
          age: data.age,
          email: data.email,
          phone: data.phone,
          location: data.location,
          subject: data.subject,
          grade: data.grade ?? null,
          ipAddress: ip,
          userAgent: ua,
        },
      });
      await tx.passkey.update({
        where: { id: passkey.id },
        data: { usedCount: { increment: 1 } },
      });
      return created;
    });

    const token = signAttemptToken({ leadId: lead.id, testId: lead.testId });
    const c = await cookies();
    c.set(`attempt_${lead.id}`, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 4,
    });

    return NextResponse.json({ ok: true, leadId: lead.id });
  });
}
