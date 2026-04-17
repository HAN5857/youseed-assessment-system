"use client";

import { useState } from "react";

type Test = { id: string; title: string; subject: string };
type Passkey = {
  id: string; code: string; test: { title: string; subject: string };
  maxUses: number; usedCount: number;
  expiresAt: string | null; active: boolean; note: string | null; createdAt: string;
};

export function PasskeyManager({ tests, initial }: { tests: Test[]; initial: Passkey[] }) {
  const [items, setItems] = useState<Passkey[]>(initial);
  const [testId, setTestId] = useState(tests[0]?.id ?? "");
  const [count, setCount] = useState(1);
  const [maxUses, setMaxUses] = useState(1);
  const [prefix, setPrefix] = useState("");
  const [note, setNote] = useState("");
  const [creating, setCreating] = useState(false);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!testId) return;
    setCreating(true);
    try {
      const r = await fetch("/api/admin/passkeys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId, count, maxUses, prefix: prefix || undefined, note: note || undefined }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Failed");
      const matchingTest = tests.find((t) => t.id === testId);
      const newOnes: Passkey[] = data.items.map((p: any) => ({
        id: p.id, code: p.code,
        test: { title: matchingTest?.title ?? "", subject: matchingTest?.subject ?? "" },
        maxUses: p.maxUses, usedCount: 0, expiresAt: p.expiresAt, active: true, note: p.note,
        createdAt: p.createdAt,
      }));
      setItems([...newOnes, ...items]);
      setNote("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function toggle(id: string, active: boolean) {
    const r = await fetch(`/api/admin/passkeys/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    if (r.ok) setItems(items.map(i => i.id === id ? { ...i, active: !active } : i));
  }

  function copyLink(code: string) {
    const url = `${location.origin}/test?code=${encodeURIComponent(code)}`;
    navigator.clipboard.writeText(url);
    alert("Link copied:\n" + url);
  }

  return (
    <>
      <form onSubmit={create} className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-800">Generate new passkeys</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-5">
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-medium text-slate-700">Test</span>
            <select value={testId} onChange={(e) => setTestId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            >
              {tests.map(t => <option key={t.id} value={t.id}>{t.title} · {t.subject}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-700">Count</span>
            <input type="number" min={1} max={100} value={count} onChange={e => setCount(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-700">Max uses each</span>
            <input type="number" min={1} value={maxUses} onChange={e => setMaxUses(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-700">Prefix (optional)</span>
            <input value={prefix} onChange={e => setPrefix(e.target.value)} placeholder="e.g. ENG"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block sm:col-span-4">
            <span className="mb-1 block text-xs font-medium text-slate-700">Note (optional)</span>
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Promo batch May 2026"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <button type="submit" disabled={creating || !testId}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:bg-slate-300"
          >
            {creating ? "Generating…" : "Generate"}
          </button>
        </div>
      </form>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Test</th>
              <th className="px-4 py-3">Uses</th>
              <th className="px-4 py-3">Note</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((p) => (
              <tr key={p.id} className={p.active ? "" : "opacity-50"}>
                <td className="px-4 py-3 font-mono text-xs">{p.code}</td>
                <td className="px-4 py-3">{p.test.title} <span className="text-xs text-slate-500">· {p.test.subject}</span></td>
                <td className="px-4 py-3 text-xs">{p.usedCount} / {p.maxUses}</td>
                <td className="px-4 py-3 text-xs text-slate-600">{p.note ?? "—"}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{new Date(p.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => copyLink(p.code)} className="mr-2 text-xs font-medium text-indigo-600 hover:underline">
                    Copy link
                  </button>
                  <button onClick={() => toggle(p.id, p.active)} className="text-xs font-medium text-slate-500 hover:underline">
                    {p.active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">
                  No passkeys yet. Generate one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
