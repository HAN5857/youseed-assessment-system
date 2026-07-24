// ─────────────────────────────────────────────────────────────────────────
// /admin/account — self-serve account settings for the signed-in user.
// Currently: change my password. Room to add name / notification prefs.
// ─────────────────────────────────────────────────────────────────────────

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AccountPasswordForm } from "./AccountPasswordForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login?next=/admin/account");

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Account settings</h1>
      <p className="mt-1 text-sm text-slate-600">
        Signed in as <span className="font-semibold text-slate-800">{session.name}</span>
        <span className="ml-2 rounded bg-indigo-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-indigo-700">
          {session.role}
        </span>
      </p>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Change your password</h2>
        <p className="mt-1 text-sm text-slate-600">
          Pick a password you can actually remember. Anything with at least 8 characters is accepted.
        </p>
        <div className="mt-5">
          <AccountPasswordForm />
        </div>
      </section>
    </div>
  );
}
