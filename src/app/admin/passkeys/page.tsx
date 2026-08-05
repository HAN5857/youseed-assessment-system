import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { tenantWhereTutor } from "@/lib/tenant-scope";
import { getCallerOrg, filterAllowedTests } from "@/lib/org-access";
import { redirect } from "next/navigation";
import { PasskeyManager } from "./PasskeyManager";

export const dynamic = "force-dynamic";

export default async function PasskeysPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  // Tenant-scoped — see src/lib/tenant-scope.ts. An org-scoped ADMIN
  // sees every passkey their teammates hold, not just their own.
  const where = await tenantWhereTutor(session);
  const callerOrg = await getCallerOrg(session);
  const [passkeys, allTests] = await Promise.all([
    prisma.passkey.findMany({
      where,
      include: { test: { select: { title: true, subject: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.test.findMany({
      where: { active: true },
      select: { id: true, title: true, subject: true, level: true },
      orderBy: [{ subject: "asc" }, { level: "asc" }],
    }),
  ]);
  // Only offer tests the caller's org is enabled for.
  const tests = filterAllowedTests(callerOrg, allTests).map(({ id, title, subject }) => ({ id, title, subject }));

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Passkeys</h1>
      <p className="text-sm text-slate-600">
        Generate single-use or batch passkeys to give to prospective students.
        {callerOrg?.passkeyPrefix && (
          <> Your codes are automatically prefixed <span className="rounded bg-slate-100 px-1 font-mono text-xs">{callerOrg.passkeyPrefix}-</span>.</>
        )}
      </p>
      <PasskeyManager tests={tests} initial={passkeys.map(serialize)} />
    </div>
  );
}

function serialize(p: any) {
  return {
    id: p.id,
    code: p.code,
    test: p.test,
    maxUses: p.maxUses,
    usedCount: p.usedCount,
    expiresAt: p.expiresAt?.toISOString() ?? null,
    active: p.active,
    note: p.note,
    createdAt: p.createdAt.toISOString(),
  };
}
