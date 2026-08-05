import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { AdminNav } from "./AdminNav";

// CRITICAL: the admin layout MUST be dynamic on every request.
// Without this, Netlify's adapter pre-renders the layout HTML once (with no
// cookies) and serves that cached HTML to all users — so the session-
// dependent bits (user badge, Users tab for SUPERADMIN) never appear in
// the page chrome even after the user logs in.
//
// July 2026 update: the tab shell itself no longer depends on session,
// so even under a bad edge cache the nav is visible — clicking a
// protected tab just redirects to /admin/login. This is the belt +
// braces for the "top buttons sometimes invisible, need to refresh"
// bug — force-dynamic + session-independent nav render.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Touch cookies() here so Next.js definitely treats this layout as
  // request-scoped (belt + braces alongside the force-dynamic flag).
  await cookies();
  const session = await getSession();
  // Pass only the safe fields down to the client nav — never the JWT.
  const navSession = session
    ? { name: session.name, role: session.role, orgId: session.orgId ?? null, orgSlug: session.orgSlug ?? null }
    : null;
  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav session={navSession} />
      <main>{children}</main>
    </div>
  );
}
