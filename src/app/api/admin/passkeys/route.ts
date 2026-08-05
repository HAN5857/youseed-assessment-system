import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { tenantWhereTutor } from "@/lib/tenant-scope";
import { getCallerOrg, isTestAllowed } from "@/lib/org-access";
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
  // Tenant-aware — an ADMIN with an org sees every passkey their teammates
  // hold. See src/lib/tenant-scope.ts for the rule table.
  const where = await tenantWhereTutor(session);
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

  // Per-org test restriction — a tutor in a restricted org can't mint
  // passkeys for a test their org isn't allowed to use.
  const callerOrg = await getCallerOrg(session);
  if (!isTestAllowed(callerOrg, test.subject, test.level)) {
    return NextResponse.json(
      { ok: false, error: "TEST_NOT_ALLOWED",
        message: `Your organisation isn't enabled for "${test.title}". Ask the system admin to add it.` },
      { status: 403 },
    );
  }

  // Passkey-code generation rules:
  //   • EXPLICIT prefix + count 1 → that prefix IS the code, verbatim
  //     (tutor types "ooi_eng_s2" → hands out "OOI_ENG_S2").
  //   • EXPLICIT prefix + count >1 → prefix-SUFFIX per code (uniqueness).
  //   • No explicit prefix but the org has a passkeyPrefix → orgPrefix is a
  //     NAMESPACE: always orgPrefix-SUFFIX (even count 1), so single codes
  //     stay unique + attributable (ANAKBIJAK-7QK3M9XZ).
  //   • Otherwise → random suffix alone.
  const explicit = (prefix ?? "").trim()
    .toUpperCase().replace(/\s+/g, "-").replace(/[^A-Z0-9_-]/g, "");
  const orgPrefix = (callerOrg?.passkeyPrefix ?? "")
    .toUpperCase().replace(/\s+/g, "-").replace(/[^A-Z0-9_-]/g, "");

  // `clean` = the base used for the exact-code path (explicit only).
  const clean = explicit;
  const useCleanPrefix = count === 1 && clean.length > 0;
  // Namespace applied to the suffix path (explicit wins over org prefix).
  const nsPrefix = explicit || orgPrefix;

  const created: any[] = [];
  try {
    for (let i = 0; i < count; i++) {
      const code = useCleanPrefix
        ? clean
        : `${nsPrefix ? nsPrefix + "-" : ""}${generate()}`;
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
  } catch (e: any) {
    // Prisma unique-constraint violation on Passkey.code.
    if (e?.code === "P2002" && useCleanPrefix) {
      return NextResponse.json(
        {
          ok: false,
          error: "CODE_TAKEN",
          message: `The passkey "${clean}" is already in use. Pick a different prefix, or tick "Add random suffix" to auto-generate a unique one.`,
        },
        { status: 409 },
      );
    }
    throw e;
  }
  return NextResponse.json({ ok: true, items: created });
}
