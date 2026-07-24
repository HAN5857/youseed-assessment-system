"use client";

// Admin top nav — always visible tab bar with active-page highlighting.
//
// Design decisions (per tutor feedback July 2026):
//   • The tab shell (Leads · Passkeys · Tests · Users) is ALWAYS rendered,
//     even when the server layout couldn't read the session cookie yet.
//     Fixes the "top buttons sometimes invisible — need to refresh" bug
//     which happened because `session === null` used to hide the whole
//     nav. Even on a transient auth flap the tabs stay visible; clicking
//     one just redirects to /admin/login if not signed in.
//   • Bigger tap targets (px-4 py-2), higher contrast text, indigo pill
//     background on the active tab so the nav reads as a first-class
//     control not a footnote.
//   • Underline + colour on hover for keyboard users; ring on focus.
//   • Users tab only shown to SUPERADMIN (server-side session prop).
//   • Account link + Logout on the right pushes rotate-my-password
//     access to one obvious click.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./LogoutButton";

type NavSession = { name: string; role: string } | null;

const TABS: Array<{ href: string; label: string; requires?: "SUPERADMIN" }> = [
  { href: "/admin",          label: "Leads" },
  { href: "/admin/passkeys", label: "Passkeys" },
  { href: "/admin/tests",    label: "Tests" },
  { href: "/admin/users",    label: "Users", requires: "SUPERADMIN" },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin" || pathname.startsWith("/admin/leads");
  return pathname === href || pathname.startsWith(href + "/");
}

export function AdminNav({ session }: { session: NavSession }) {
  const pathname = usePathname() ?? "/admin";
  const canSeeUsers = session?.role === "SUPERADMIN";
  const visibleTabs = TABS.filter((t) => !t.requires || (t.requires === "SUPERADMIN" && canSeeUsers));

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link
          href="/admin"
          className="text-base font-bold tracking-tight text-slate-900 hover:text-indigo-700"
        >
          <span className="text-indigo-600">●</span> Assessment Admin
        </Link>

        {/* Tab bar — always rendered so it never disappears mid-nav. */}
        <nav className="flex items-center gap-1" aria-label="Primary">
          {visibleTabs.map((tab) => {
            const active = isActive(pathname, tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2",
                  active
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100 hover:text-indigo-700",
                ].join(" ")}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <Link
                href="/admin/account"
                title="Account settings"
                className={[
                  "hidden sm:inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                  isActive(pathname, "/admin/account")
                    ? "border-indigo-300 bg-indigo-50 text-indigo-800"
                    : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-700",
                ].join(" ")}
              >
                <span aria-hidden>👤</span>
                {session.name}
                <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-black uppercase text-indigo-700">
                  {session.role}
                </span>
              </Link>
              <LogoutButton />
            </>
          ) : (
            <Link
              href="/admin/login"
              className="rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-indigo-700"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
