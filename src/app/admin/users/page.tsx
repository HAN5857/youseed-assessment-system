import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UsersManager } from "./UsersManager";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "ADMIN") {
    // Non-admins (TUTORs) bounce back to their dashboard — this page is admin-only.
    redirect("/admin");
  }

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

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="mt-1 text-sm text-slate-600">
            Create tutor accounts. Each tutor can generate their own passkeys and will only see
            their own students&apos; assessment records.
          </p>
        </div>
        <span className="text-xs text-slate-500">
          {users.length} {users.length === 1 ? "account" : "accounts"} · signed in as{" "}
          <b>{session.name}</b>
        </span>
      </div>

      <UsersManager
        currentUserId={session.uid}
        initial={users.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          active: u.active,
          createdAt: u.createdAt.toISOString(),
          passkeyCount: u._count.passkeys,
          leadCount: u._count.leads,
        }))}
      />
    </div>
  );
}
