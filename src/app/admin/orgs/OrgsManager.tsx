"use client";

// SUPERADMIN organisation management UI.
//   • Create a new org (name + slug + optional brand colour + passkey prefix)
//   • Per-org: edit name/branding/prefix, choose which tests they can use,
//     enable/disable, see tutor + lead counts.

import { useState } from "react";

type TestLite = { id: string; title: string; subject: string; level: string; key: string };

type Org = {
  id: string;
  slug: string;
  name: string;
  active: boolean;
  brandColor: string | null;
  passkeyPrefix: string | null;
  allowedTests: string | null; // JSON string array or null
  logoUrl: string | null;
  userCount: number;
  leadCount: number;
};

export function OrgsManager({ initial, tests }: { initial: Org[]; tests: TestLite[] }) {
  const [orgs, setOrgs] = useState<Org[]>(initial);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Org | null>(null);

  // Create form
  const [cName, setCName] = useState("");
  const [cSlug, setCSlug] = useState("");
  const [cColor, setCColor] = useState("#D9403C");
  const [cPrefix, setCPrefix] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Auto-suggest a slug from the name unless the user has typed one.
  const [slugTouched, setSlugTouched] = useState(false);
  function onName(v: string) {
    setCName(v);
    if (!slugTouched) setCSlug(v.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_-]/g, ""));
  }

  async function createOrg(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch("/api/admin/orgs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: cName, slug: cSlug, brandColor: cColor || null, passkeyPrefix: cPrefix || null }),
      });
      const data = await r.json();
      if (!r.ok || !data.ok) {
        setErr(data.message ?? data.error ?? "Failed to create organisation");
        return;
      }
      setOrgs((prev) => [
        { ...data.org, allowedTests: null, logoUrl: null, userCount: 0, leadCount: 0 },
        ...prev,
      ]);
      setCName(""); setCSlug(""); setCColor("#D9403C"); setCPrefix(""); setSlugTouched(false);
      setCreateOpen(false);
    } catch (e: any) {
      setErr(e?.message ?? "Network error");
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(org: Org) {
    const r = await fetch(`/api/admin/orgs/${org.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle-active" }),
    });
    const data = await r.json();
    if (!r.ok || !data.ok) { alert(data?.error ?? "Failed"); return; }
    setOrgs((prev) => prev.map((o) => (o.id === org.id ? { ...o, active: data.org.active } : o)));
  }

  function applyEdit(updated: Org) {
    setOrgs((prev) => prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)));
    setEditing(null);
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setCreateOpen((v) => !v)}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          {createOpen ? "Cancel" : "+ New organisation"}
        </button>
      </div>

      {createOpen && (
        <form onSubmit={createOrg} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-4">
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-slate-600">Display name</span>
            <input value={cName} onChange={(e) => onName(e.target.value)} required maxLength={120}
              placeholder="Anak Bijak"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-slate-600">Slug (used in labels/passkeys)</span>
            <input value={cSlug} onChange={(e) => { setSlugTouched(true); setCSlug(e.target.value); }} required maxLength={40}
              placeholder="anak_bijak"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono lowercase" />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-600">Brand colour</span>
            <div className="mt-1 flex items-center gap-2">
              <input type="color" value={cColor} onChange={(e) => setCColor(e.target.value)}
                className="h-9 w-12 rounded border border-slate-300" />
              <input value={cColor} onChange={(e) => setCColor(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono" />
            </div>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-600">Passkey prefix (optional)</span>
            <input value={cPrefix} onChange={(e) => setCPrefix(e.target.value)} maxLength={20}
              placeholder="ANAKBIJAK"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono uppercase" />
          </label>
          {err && <p className="sm:col-span-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-800">{err}</p>}
          <div className="sm:col-span-4 flex justify-end">
            <button type="submit" disabled={busy || !cName || !cSlug}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
              {busy ? "Creating…" : "Create organisation"}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Organisation</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Passkey prefix</th>
              <th className="px-4 py-3">Tests</th>
              <th className="px-4 py-3 text-right">Tutors</th>
              <th className="px-4 py-3 text-right">Leads</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orgs.map((o) => {
              const allowed = o.allowedTests ? (JSON.parse(o.allowedTests) as string[]) : null;
              return (
                <tr key={o.id} className={o.active ? "" : "bg-slate-50/60 text-slate-500"}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 flex-none rounded-full border border-slate-300"
                        style={{ backgroundColor: o.brandColor ?? "#e2e8f0" }} aria-hidden />
                      <span className="font-semibold text-slate-900">{o.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{o.slug}</td>
                  <td className="px-4 py-3 font-mono text-xs">{o.passkeyPrefix ?? <span className="text-slate-400">—</span>}</td>
                  <td className="px-4 py-3 text-xs">
                    {allowed ? `${allowed.length} allowed` : <span className="text-slate-400">all</span>}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs">{o.userCount}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs">{o.leadCount}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${o.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>
                      {o.active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setEditing(o)}
                        className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">
                        Edit
                      </button>
                      <button type="button" onClick={() => toggleActive(o)}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium ${o.active ? "border border-rose-300 bg-white text-rose-700 hover:bg-rose-50" : "border border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50"}`}>
                        {o.active ? "Disable" : "Re-enable"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {orgs.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-500">
                No organisations yet — create the first one above.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <OrgEditDialog org={editing} tests={tests} onCancel={() => setEditing(null)} onSaved={applyEdit} />
      )}
    </div>
  );
}

// ─── Edit dialog — branding + passkey prefix + allowed tests ──────────────
function OrgEditDialog({ org, tests, onCancel, onSaved }: {
  org: Org; tests: TestLite[]; onCancel: () => void; onSaved: (o: Org) => void;
}) {
  const [name, setName] = useState(org.name);
  const [color, setColor] = useState(org.brandColor ?? "#D9403C");
  const [prefix, setPrefix] = useState(org.passkeyPrefix ?? "");
  const initialAllowed: string[] | null = org.allowedTests ? JSON.parse(org.allowedTests) : null;
  const [restrictOn, setRestrictOn] = useState(initialAllowed != null);
  const [allowed, setAllowed] = useState<Set<string>>(new Set(initialAllowed ?? tests.map((t) => t.key)));
  const [logoUrl, setLogoUrl] = useState<string | null>(org.logoUrl);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function toggleTest(key: string) {
    setAllowed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  async function onLogoFile(file: File) {
    // Small logos only — inline as a data URI (no upload pipeline needed).
    if (file.size > 200_000) { setErr("Logo must be under 200 KB."); return; }
    const reader = new FileReader();
    reader.onload = () => setLogoUrl(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function save() {
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch(`/api/admin/orgs/${org.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          name,
          brandColor: color || null,
          passkeyPrefix: prefix || null,
          logoUrl,
          allowedTests: restrictOn ? Array.from(allowed) : null,
        }),
      });
      const data = await r.json();
      if (!r.ok || !data.ok) { setErr(data.message ?? data.error ?? "Save failed"); return; }
      onSaved({ ...org, ...data.org });
    } catch (e: any) {
      setErr(e?.message ?? "Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={busy ? undefined : onCancel} />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-slate-900">Edit — {org.name} <span className="font-mono text-xs text-slate-400">{org.slug}</span></h3>

        <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Display name</span>
          <input value={name} onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Brand colour</span>
            <div className="mt-1 flex items-center gap-2">
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 w-12 rounded border border-slate-300" />
              <input value={color} onChange={(e) => setColor(e.target.value)} className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm font-mono" />
            </div>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Passkey prefix</span>
            <input value={prefix} onChange={(e) => setPrefix(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono uppercase" placeholder="ANAKBIJAK" />
          </label>
        </div>

        <div className="mt-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Logo (student test page)</span>
          <div className="mt-1 flex items-center gap-3">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="h-10 w-auto rounded border border-slate-200 bg-white object-contain" />
            ) : (
              <span className="text-xs italic text-slate-400">No logo — uses YouSeed default</span>
            )}
            <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) onLogoFile(f); }}
              className="text-xs" />
            {logoUrl && (
              <button type="button" onClick={() => setLogoUrl(null)} className="text-xs font-medium text-rose-600 hover:underline">Remove</button>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input type="checkbox" checked={restrictOn} onChange={(e) => setRestrictOn(e.target.checked)} />
            Restrict which tests this org can use
          </label>
          {restrictOn && (
            <div className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-3">
              {tests.map((t) => (
                <label key={t.key} className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={allowed.has(t.key)} onChange={() => toggleTest(t.key)} />
                  <span className="font-medium text-slate-800">{t.title}</span>
                  <span className="font-mono text-slate-400">{t.key}</span>
                </label>
              ))}
            </div>
          )}
          {!restrictOn && <p className="mt-1 text-[11px] text-slate-500">All active tests are available to this org.</p>}
        </div>

        {err && <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-800">{err}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} disabled={busy}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            Cancel
          </button>
          <button type="button" onClick={save} disabled={busy || !name}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
            {busy ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
