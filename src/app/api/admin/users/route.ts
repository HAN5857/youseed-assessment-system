import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSession, hashPassword, type SessionPayload } from "@/lib/auth";
import { customAlphabet } from "nanoid";

// Any signed-in user with admin-ish role gates:
//   SUPERADMIN  → can list/create anyone (any org)
//   ADMIN + org → can list/create teammates only, forced into their own org
//   TUTOR / no-org ADMIN → 403 (can't reach this page anyway)
async function requireOrgManager(): Promise<SessionPayload> {
  const s = await requireSession();
  if (s.role === "SUPERADMIN") return s;
  if (s.role === "ADMIN" && s.orgId) return s;
  throw new Error("FORBIDDEN");
}

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
  // Optional: SuperAdmin can pre-set the initial password. If omitted the
  // system generates one (existing behaviour). Minimum 8 chars keeps a
  // sensible floor without frustrating admins who want easy-to-remember
  // passwords for tutors. Tutors can rotate it themselves after logging in
  // via /admin/account.
  initialPassword: z.string().min(8).max(200).optional(),
  // Optional: Organization.id. SUPERADMIN can assign any existing org (or
  // null = solo). ADMIN callers are forced into their own org server-side.
  orgId: z.string().optional().nullable(),
});

export async function GET() {
  let session;
  try {
    session = await requireOrgManager();
  } catch (e: any) {
    const code = e?.message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ ok: false, error: e?.message ?? "UNAUTHORIZED" }, { status: code });
  }
  // SUPERADMIN sees every user; org-admin sees only teammates in their org.
  const where = session.role === "SUPERADMIN" ? {} : { orgId: session.orgId ?? undefined };
  // Include per-user passkey + lead counts so the admin can see at-a-glance
  // who's actually using the system.
  const users = await prisma.user.findMany({
    where,
    orderBy: [{ active: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      orgId: true,
      org: { select: { slug: true, name: true } },
      active: true,
      createdAt: true,
      _count: { select: { passkeys: true, leads: true } },
    },
  });
  return NextResponse.json({ ok: true, items: users });
}

export async function POST(req: Request) {
  let session;
  try {
    session = await requireOrgManager();
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
  const { email, name, role, initialPassword: providedPassword } = parsed.data;
  const normalized = email.trim().toLowerCase();
  // Org: SUPERADMIN can assign any EXISTING org (or null); ADMIN is forced
  // into their own org. Validate the org exists to avoid dangling FKs.
  let orgId: string | null;
  if (session.role === "SUPERADMIN") {
    orgId = parsed.data.orgId?.trim() || null;
    if (orgId) {
      const exists = await prisma.organization.findUnique({ where: { id: orgId }, select: { id: true } });
      if (!exists) {
        return NextResponse.json({ ok: false, error: "ORG_NOT_FOUND" }, { status: 400 });
      }
    }
  } else {
    orgId = session.orgId ?? null;
  }

  // Reject duplicate emails up-front for a clean error message
  const existing = await prisma.user.findUnique({ where: { email: normalized } });
  if (existing) {
    return NextResponse.json(
      { ok: false, error: "EMAIL_ALREADY_REGISTERED" },
      { status: 409 },
    );
  }

  // Custom initial password from the admin wins; otherwise auto-generate.
  const initialPassword = providedPassword ?? generatePassword();
  const passwordHash = await hashPassword(initialPassword);
  const user = await prisma.user.create({
    data: {
      email: normalized,
      name: name.trim(),
      role,
      passwordHash,
      active: true,
      orgId,
    },
    select: {
      id: true, email: true, name: true, role: true, orgId: true,
      org: { select: { slug: true, name: true } }, active: true, createdAt: true,
    },
  });

  return NextResponse.json({ ok: true, user, initialPassword });
}
