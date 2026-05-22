import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin, hashPassword } from "@/lib/auth";
import { customAlphabet } from "nanoid";

// Initial-password generator: ambiguity-free alphabet, 14 chars ≈ 70+ bits entropy.
// Returned ONCE in the create response — never logged or persisted in plaintext.
const generatePassword = customAlphabet(
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789",
  14,
);

const createSchema = z.object({
  email: z.string().email().max(200),
  name: z.string().min(1).max(120),
  role: z.enum(["TUTOR", "ADMIN"]).default("TUTOR"),
});

export async function GET() {
  try {
    await requireAdmin();
  } catch (e: any) {
    const code = e?.message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ ok: false, error: e?.message ?? "UNAUTHORIZED" }, { status: code });
  }
  // Include per-user passkey + lead counts so the admin can see at-a-glance
  // who's actually using the system.
  const users = await prisma.user.findMany({
    orderBy: [{ active: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
      createdAt: true,
      _count: { select: { passkeys: true, leads: true } },
    },
  });
  return NextResponse.json({ ok: true, items: users });
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch (e: any) {
    const code = e?.message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ ok: false, error: e?.message ?? "UNAUTHORIZED" }, { status: code });
  }
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "BAD_REQUEST", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { email, name, role } = parsed.data;
  const normalized = email.trim().toLowerCase();

  // Reject duplicate emails up-front for a clean error message
  const existing = await prisma.user.findUnique({ where: { email: normalized } });
  if (existing) {
    return NextResponse.json(
      { ok: false, error: "EMAIL_ALREADY_REGISTERED" },
      { status: 409 },
    );
  }

  const initialPassword = generatePassword();
  const passwordHash = await hashPassword(initialPassword);
  const user = await prisma.user.create({
    data: {
      email: normalized,
      name: name.trim(),
      role,
      passwordHash,
      active: true,
    },
    select: {
      id: true, email: true, name: true, role: true, active: true, createdAt: true,
    },
  });

  return NextResponse.json({ ok: true, user, initialPassword });
}
