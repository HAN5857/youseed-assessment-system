import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withApi } from "@/lib/api";

const schema = z.object({
  code: z.string().min(3).max(64),
  // Optional scoping — sent by the new /test/[subject]/[level] flow.
  // If present, the passkey's test must match the requested subject + level.
  subject: z.string().min(1).max(40).optional(),
  level: z.string().min(1).max(40).optional(),
});

export async function POST(req: Request) {
  return withApi(async () => {
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid passkey format" }, { status: 400 });
    }
    const code = parsed.data.code.trim().toUpperCase();
    const expectedSubject = parsed.data.subject?.toLowerCase();
    const expectedLevel = parsed.data.level?.toLowerCase();

    const passkey = await prisma.passkey.findUnique({
      where: { code },
      include: {
        test: {
          select: {
            id: true, title: true, subject: true, level: true,
            duration: true, scope: true, active: true,
          },
        },
      },
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

    // Scope check: passkey must match the subject+level the student is on.
    if (expectedSubject && passkey.test.subject !== expectedSubject) {
      return NextResponse.json(
        {
          ok: false,
          error: `This passkey is for ${capitalize(passkey.test.subject)}, not ${capitalize(expectedSubject)}. Please use the right passkey or pick the right subject.`,
        },
        { status: 409 }
      );
    }
    if (expectedLevel && passkey.test.level !== expectedLevel) {
      return NextResponse.json(
        {
          ok: false,
          error: `This passkey is for ${formatLevel(passkey.test.level)}, not ${formatLevel(expectedLevel)}. Please pick the right level.`,
        },
        { status: 409 }
      );
    }

    return NextResponse.json({ ok: true, test: passkey.test, passkeyId: passkey.id });
  });
}

function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }
function formatLevel(s: string) { return s.replace("standard-", "Standard "); }
