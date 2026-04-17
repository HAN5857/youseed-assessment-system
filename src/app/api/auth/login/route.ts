import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { setSessionCookie, signSession, verifyPassword } from "@/lib/auth";
import { withApi } from "@/lib/api";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  return withApi(async () => {
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
    if (!user || !user.active) {
      return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
    }
    const ok = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
    }
    const token = signSession({ uid: user.id, role: user.role as any, name: user.name });
    await setSessionCookie(token);
    return NextResponse.json({ ok: true, role: user.role });
  });
}
