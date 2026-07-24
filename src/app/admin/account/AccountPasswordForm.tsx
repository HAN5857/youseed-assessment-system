"use client";

// Client-side form for the signed-in user to rotate their own password.
// Talks to /api/admin/account/password. Shows inline errors + a success
// pulse. Does not require SUPERADMIN — every role can change their own.

import { useState } from "react";

export function AccountPasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const disabled = busy || !current || !next || next.length < 8 || next !== confirm;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setOk(false);
    try {
      const r = await fetch("/api/admin/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await r.json();
      if (!r.ok || !data.ok) {
        setErr(data.message ?? data.error ?? "Password change failed");
        return;
      }
      setOk(true);
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (e: any) {
      setErr(e?.message ?? "Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid max-w-md gap-4">
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
          Current password
        </span>
        <input
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          required
          autoComplete="current-password"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
      </label>
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
          New password <span className="text-slate-400 normal-case">(min 8 characters)</span>
        </span>
        <input
          type="password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
      </label>
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
          Confirm new password
        </span>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
          className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
            confirm && confirm !== next
              ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
              : "border-slate-300 focus:border-indigo-400 focus:ring-indigo-100"
          }`}
        />
        {confirm && confirm !== next && (
          <p className="mt-1 text-xs font-medium text-rose-600">Doesn&apos;t match the new password.</p>
        )}
      </label>
      {err && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-800">
          {err}
        </p>
      )}
      {ok && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
          ✅ Password updated. Use the new one next time you sign in.
        </p>
      )}
      <button
        type="submit"
        disabled={disabled}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? "Saving…" : "Change password"}
      </button>
    </form>
  );
}
