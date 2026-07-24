import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UsersManager } from "./UsersManager";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const isSuper = session.role === "SUPERADMIN";
  const isOrgAdmin = session.role === "ADMIN" && !!session.org;
  if (!isSuper && !isOrgAdmin) {
    // TUTORs + orphan ADMINs (no org) don't see anyone else.
    redirect("/admin");
  }

  // SUPERADMIN sees every user; org-admin sees teammates.
  const where = isSuper ? {} : { org: session.org ?? undefined };
  const users = await prisma.user.findMany({
    where,
    orderBy: [{ active: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      org: true,
      active: true,
      createdAt: true,
      _count: { select: { passkeys: true, leads: true } },
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Users {isOrgAdmin && <span className="ml-2 rounded bg-indigo-50 px-2 py-0.5 text-sm font-semibold text-indigo-700">{session.org}</span>}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {isSuper
              ? "Create tutor accounts across every organisation. Each tutor sees only their own students."
              : <>Manage tutors on your <b>{session.org}</b> team. New tutors join this org automatically.</>}
          </p>
        </div>
        <span className="text-xs text-slate-500">
          {users.length} {users.length === 1 ? "account" : "accounts"} · signed in as{" "}
          <b>{session.name}</b>
        </span>
      </div>

      <UsersManager
        currentUserId={session.uid}
        isSuper={isSuper}
        callerOrg={session.org ?? null}
        initial={users.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          org: u.org,
          active: u.active,
          createdAt: u.createdAt.toISOString(),
          passkeyCount: u._count.passkeys,
          leadCount: u._count.leads,
        }))}
      />
    </div>
  );
}
