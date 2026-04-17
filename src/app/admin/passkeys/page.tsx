import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PasskeyManager } from "./PasskeyManager";

export default async function PasskeysPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const where = session.role === "ADMIN" ? {} : { tutorId: session.uid };
  const [passkeys, tests] = await Promise.all([
    prisma.passkey.findMany({
      where,
      include: { test: { select: { title: true, subject: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.test.findMany({ where: { active: true }, select: { id: true, title: true, subject: true } }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Passkeys</h1>
      <p className="text-sm text-slate-600">
        Generate single-use or batch passkeys to give to prospective students.
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
