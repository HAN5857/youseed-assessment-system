import Link from "next/link";
import { getSession } from "@/lib/auth";
import { LogoutButton } from "./LogoutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Skip auth gate for /admin/login itself — handled in that page
  return (
    <div className="min-h-screen bg-slate-50">
      <AuthGate>{children}</AuthGate>
    </div>
  );
}

async function AuthGate({ children }: { children: React.ReactNode }) {
  // Check if we're rendering the login page — Next.js App Router doesn't tell us route here,
  // so we just check the session and only redirect on protected paths.
  // The login page calls /api/auth/login which sets the cookie; afterwards the user lands on /admin.
  // Trick: read session; if missing render children (login page handles itself; protected pages redirect).
  // To gate dashboard pages cleanly, each page calls requireSession on its own.
  const session = await getSession();
  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/admin" className="font-semibold text-slate-800">
            Assessment Admin
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-600">
            {session && (
              <>
                <Link href="/admin" className="hover:text-indigo-600">Leads</Link>
                <Link href="/admin/passkeys" className="hover:text-indigo-600">Passkeys</Link>
                <Link href="/admin/tests" className="hover:text-indigo-600">Tests</Link>
                <span className="hidden sm:inline text-xs text-slate-400">
                  {session.name} · {session.role}
                </span>
                <LogoutButton />
              </>
            )}
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </>
  );
}
