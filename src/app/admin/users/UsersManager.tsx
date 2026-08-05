"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  orgId: string | null;
  orgName: string | null;
  orgSlug: string | null;
  active: boolean;
  createdAt: string;
  passkeyCount: number;
  leadCount: number;
};

type OrgLite = { id: string; slug: string; name: string };

type RevealedPassword = {
  userId: string;
  email: string;
  password: string;
  reason: "created" | "reset";
};

export function UsersManager({
  initial,
  currentUserId,
  isSuper,
  callerOrgSlug,
  orgs,
}: {
  initial: UserRow[];
  currentUserId: string;
  isSuper: boolean;
  callerOrgSlug: string | null;
  orgs: OrgLite[];
}) {
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>(initial);
  const [revealed, setRevealed] = useState<RevealedPassword | null>(null);
  // Which user (if any) has the reset-password / set-org dialog open.
  const [pwTarget, setPwTarget] = useState<UserRow | null>(null);
  const [orgTarget, setOrgTarget] = useState<UserRow | null>(null);
  const [dialogBusy, setDialogBusy] = useState(false);

  // ── Create form state ──
  const [formOpen, setFormOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState<"TUTOR" | "ADMIN">("TUTOR");
  const [formPassword, setFormPassword] = useState("");
  // SUPERADMIN picks an org from the dropdown (empty = solo). Org-admins
  // don't see the field — the server forces new users into their org.
  const [formOrgId, setFormOrgId] = useState<string>("");
  // Note: SUPERADMIN can only be assigned via direct DB edit, never via this
  // form — by design, to prevent accidental privilege escalation.
  const [formBusy, setFormBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setFormBusy(true);
    setFormError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          role: formRole,
          // Only send an initialPassword if the admin actually typed one.
          // Empty string / whitespace → server auto-generates.
          initialPassword: formPassword.trim() ? formPassword : undefined,
          // SuperAdmin can assign an org; server ignores this for org-admins
          // (they're always forced into their own org).
          orgId: formOrgId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        const msg =
          data?.error === "EMAIL_ALREADY_REGISTERED"
            ? "That email is already registered."
            : data?.error === "BAD_REQUEST"
              ? "Please check the name + email."
              : data?.error || "Something went wrong";
        setFormError(msg);
        return;
      }
      setRevealed({
        userId: data.user.id,
        email: data.user.email,
        password: data.initialPassword,
        reason: "created",
      });
      setUsers((prev) => [
        {
          ...data.user,
          createdAt: data.user.createdAt,
          passkeyCount: 0,
          leadCount: 0,
        },
        ...prev,
      ]);
      setFormName("");
      setFormEmail("");
      setFormRole("TUTOR");
      setFormPassword("");
      setFormOrgId("");
      setFormOpen(false);
    } catch (err: any) {
      setFormError(err?.message ?? "Network error");
    } finally {
      setFormBusy(false);
    }
  }

  async function toggleActive(user: UserRow) {
    if (user.id === currentUserId && user.active) {
      alert("You cannot deactivate your own account while signed in.");
      return;
    }
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle-active" }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      alert(data?.error ?? "Failed to update user");
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, active: data.user.active } : u)));
  }

  // Submit a password reset. `newPassword` empty → server generates a
  // random one; non-empty → set that exact password (min 8, validated in
  // the dialog). Works for SUPERADMIN and org-admins (server-gated).
  async function submitResetPassword(user: UserRow, newPassword: string) {
    setDialogBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset-password",
          ...(newPassword.trim() ? { newPassword: newPassword.trim() } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        alert(data?.message ?? data?.error ?? "Failed to reset password");
        return;
      }
      setPwTarget(null);
      setRevealed({
        userId: data.user.id,
        email: data.user.email,
        password: data.newPassword,
        reason: "reset",
      });
    } finally {
      setDialogBusy(false);
    }
  }

  // Assign / change / clear a user's org (SUPERADMIN only). Empty = solo scope.
  async function submitSetOrg(user: UserRow, orgId: string) {
    setDialogBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set-org", orgId: orgId || null }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        alert(data?.message ?? data?.error ?? "Failed to set organisation");
        return;
      }
      setUsers((prev) => prev.map((u) => (u.id === user.id
        ? { ...u, orgId: data.user.orgId, orgName: data.user.org?.name ?? null, orgSlug: data.user.org?.slug ?? null }
        : u)));
      setOrgTarget(null);
    } finally {
      setDialogBusy(false);
    }
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Reveal banner — shown once after create or password reset */}
      {revealed && <PasswordRevealBanner data={revealed} onDismiss={() => setRevealed(null)} />}

      {/* Create form */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <h2 className="text-sm font-semibold text-slate-800">Create new account</h2>
          <button
            type="button"
            onClick={() => setFormOpen((o) => !o)}
            className="rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            {formOpen ? "Cancel" : "+ New tutor / admin"}
          </button>
        </div>
        {formOpen && (
          <form onSubmit={createUser} className="grid gap-3 p-5 sm:grid-cols-3">
            <label className="block sm:col-span-1">
              <span className="text-xs font-medium text-slate-600">Name</span>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                maxLength={120}
                placeholder="Tutor full name"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
            <label className="block sm:col-span-1">
              <span className="text-xs font-medium text-slate-600">Email</span>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                required
                maxLength={200}
                placeholder="tutor@example.com"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
            <label className="block sm:col-span-1">
              <span className="text-xs font-medium text-slate-600">Role</span>
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value as "TUTOR" | "ADMIN")}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="TUTOR">Tutor — sees only their own students</option>
                <option value="ADMIN">Admin — sees every teammate in the org</option>
              </select>
            </label>
            {isSuper ? (
              <label className="block sm:col-span-3">
                <span className="text-xs font-medium text-slate-600">
                  Organisation <span className="text-slate-400">(optional — leave blank for an unaffiliated user)</span>
                </span>
                <select
                  value={formOrgId}
                  onChange={(e) => setFormOrgId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">— none (solo scope) —</option>
                  {orgs.map((o) => (
                    <option key={o.id} value={o.id}>{o.name} · {o.slug}</option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-slate-500">
                  Users in the same org form one team — an ADMIN there sees all teammates&apos; leads &amp; passkeys.
                  Manage the org list on the <b>Orgs</b> tab.
                </p>
              </label>
            ) : (
              <p className="sm:col-span-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
                New accounts join your <b>{callerOrgSlug}</b> team automatically.
              </p>
            )}
            <label className="block sm:col-span-3">
              <span className="text-xs font-medium text-slate-600">
                Initial password <span className="text-slate-400">(optional — leave blank to auto-generate)</span>
              </span>
              <input
                type="text"
                autoComplete="new-password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                minLength={8}
                maxLength={200}
                placeholder="e.g. Welcome2026 (min 8 chars — the tutor can change it after signing in)"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Type a simple, memorable password for the tutor. If blank, the system generates a strong random one (shown once).
                Tutors can change their own password anytime at <span className="rounded bg-slate-100 px-1 font-mono text-slate-700">/admin/account</span>.
              </p>
            </label>
            {formError && (
              <p className="sm:col-span-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-800">
                {formError}
              </p>
            )}
            <div className="sm:col-span-3 flex items-center justify-end gap-3">
              <span className="text-xs text-slate-500">
                {formPassword.trim() ? "Using your custom password (shown once above)." : "A secure password is generated automatically and shown once."}
              </span>
              <button
                type="submit"
                disabled={formBusy || !formName || !formEmail}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-50"
              >
                {formBusy ? "Creating…" : "Create account"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Users table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              {isSuper && <th className="px-4 py-3">Org</th>}
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Passkeys</th>
              <th className="px-4 py-3 text-right">Leads</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => {
              const isSelf = u.id === currentUserId;
              return (
                <tr key={u.id} className={u.active ? "" : "bg-slate-50/60 text-slate-500"}>
                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-900">{u.name}</span>
                    {isSelf && (
                      <span className="ml-2 rounded-md bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-700">
                        you
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.role === "SUPERADMIN"
                          ? "bg-rose-100 text-rose-800"
                          : u.role === "ADMIN"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  {isSuper && (
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setOrgTarget(u)}
                        title="Assign / change organisation"
                        className="group inline-flex items-center gap-1"
                      >
                        {u.orgId ? (
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-800 group-hover:bg-indigo-100 group-hover:text-indigo-800">
                            {u.orgName ?? u.orgSlug}
                          </span>
                        ) : (
                          <span className="rounded border border-dashed border-slate-300 px-2 py-0.5 text-[11px] italic text-slate-400 group-hover:border-indigo-300 group-hover:text-indigo-600">
                            + set org
                          </span>
                        )}
                      </button>
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {u.active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs">{u.passkeyCount}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs">{u.leadCount}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setPwTarget(u)}
                        className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Reset password
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleActive(u)}
                        disabled={isSelf && u.active}
                        title={isSelf && u.active ? "You can't disable your own account" : undefined}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                          u.active
                            ? "border border-rose-300 bg-white text-rose-700 hover:bg-rose-50"
                            : "border border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50"
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        {u.active ? "Disable" : "Re-enable"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-500">
                  No accounts yet — create the first one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500">
        Tutors created here can sign in at <code className="rounded bg-slate-100 px-1 py-0.5">/admin/login</code> with the
        email and generated password. They can change their own password anytime at{" "}
        <code className="rounded bg-slate-100 px-1 py-0.5">/admin/account</code>.
        Admins see their team&apos;s data and can reset any teammate&apos;s password.
      </p>

      {/* Reset-password dialog — type a specific password or leave blank
          for a strong random one. */}
      {pwTarget && (
        <MiniPromptDialog
          title={`Reset password — ${pwTarget.name}`}
          subtitle={
            <>Set a new password for <b>{pwTarget.email}</b>. The current one stops working immediately.</>
          }
          label="New password"
          hint="Leave blank to auto-generate a strong random password."
          placeholder="min 8 characters"
          confirmLabel="Reset password"
          minLength={8}
          allowEmpty
          busy={dialogBusy}
          onCancel={() => setPwTarget(null)}
          onSubmit={(v) => submitResetPassword(pwTarget, v)}
        />
      )}

      {/* Set-org dialog (SUPERADMIN) — move a user between organisations. */}
      {orgTarget && (
        <SetOrgDialog
          user={orgTarget}
          orgs={orgs}
          busy={dialogBusy}
          onCancel={() => setOrgTarget(null)}
          onSubmit={(orgId) => submitSetOrg(orgTarget, orgId)}
        />
      )}
    </div>
  );
}

// ─── Set-org dialog — pick from the Organizations list ────────────────────
function SetOrgDialog({ user, orgs, busy, onCancel, onSubmit }: {
  user: UserRow; orgs: OrgLite[]; busy: boolean;
  onCancel: () => void; onSubmit: (orgId: string) => void;
}) {
  const [orgId, setOrgId] = useState(user.orgId ?? "");
  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={busy ? undefined : onCancel} />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-slate-900">Organisation — {user.name}</h3>
        <p className="mt-1 text-sm text-slate-600">
          Assign <b>{user.email}</b> to a team. Everyone in an org is one team; any ADMIN there sees the whole team.
        </p>
        <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Organisation</span>
          <select
            value={orgId}
            onChange={(e) => setOrgId(e.target.value)}
            autoFocus
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">— none (solo scope) —</option>
            {orgs.map((o) => (
              <option key={o.id} value={o.id}>{o.name} · {o.slug}</option>
            ))}
          </select>
          {orgs.length === 0 && (
            <p className="mt-1 text-[11px] text-amber-700">No organisations yet — create one on the <b>Orgs</b> tab first.</p>
          )}
        </label>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} disabled={busy}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            Cancel
          </button>
          <button type="button" onClick={() => onSubmit(orgId)} disabled={busy}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
            {busy ? "Saving…" : "Save organisation"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Reusable single-field prompt dialog ─────────────────────────────────
// Used for both "reset password" and "set org". Keeps a consistent modal
// look instead of window.prompt(), and can enforce a min length.
function MiniPromptDialog({
  title, subtitle, label, hint, placeholder, confirmLabel,
  initialValue = "", minLength = 0, allowEmpty = false, mono = false, busy = false,
  onCancel, onSubmit,
}: {
  title: string;
  subtitle?: ReactNode;
  label: string;
  hint?: string;
  placeholder?: string;
  confirmLabel: string;
  initialValue?: string;
  minLength?: number;
  allowEmpty?: boolean;
  mono?: boolean;
  busy?: boolean;
  onCancel: () => void;
  onSubmit: (value: string) => void;
}) {
  const [value, setValue] = useState(initialValue);
  const trimmed = value.trim();
  const tooShort = trimmed.length > 0 && trimmed.length < minLength;
  const emptyBlocked = !allowEmpty && trimmed.length === 0;
  const disabled = busy || tooShort || emptyBlocked;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={busy ? undefined : onCancel} />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
        <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">{label}</span>
          <input
            type="text"
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => { if (e.key === "Enter" && !disabled) onSubmit(value); }}
            className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${
              tooShort ? "border-rose-300" : "border-slate-300"
            } ${mono ? "font-mono lowercase" : "font-mono"}`}
          />
          {tooShort && (
            <p className="mt-1 text-xs font-medium text-rose-600">Must be at least {minLength} characters.</p>
          )}
          {hint && !tooShort && <p className="mt-1 text-[11px] text-slate-500">{hint}</p>}
        </label>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSubmit(value)}
            disabled={disabled}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? "Saving…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── One-time password reveal banner ─────────────────────────────────────
function PasswordRevealBanner({
  data,
  onDismiss,
}: {
  data: RevealedPassword;
  onDismiss: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(data.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API may fail in some browsers; the password is still selectable.
    }
  }

  return (
    <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-amber-200 text-amber-800">
          🔑
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-amber-900">
            {data.reason === "created" ? "Account created — share this password with the user" : "New password generated"}
          </h3>
          <p className="mt-1 text-xs text-amber-800">
            This is shown <b>only once</b>. Copy it now and send to {data.email}. We do not store the
            plaintext password — if it&apos;s lost, you can reset it from this page.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <code className="select-all rounded-md border border-amber-300 bg-white px-3 py-2 font-mono text-sm text-slate-900">
              {data.password}
            </code>
            <button
              type="button"
              onClick={copy}
              className="rounded-md bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700"
            >
              {copied ? "Copied ✓" : "Copy password"}
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-md border border-amber-300 bg-white px-3 py-2 text-xs font-medium text-amber-900 hover:bg-amber-100"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
