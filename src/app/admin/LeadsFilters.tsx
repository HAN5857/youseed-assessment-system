"use client";

// URL-param-driven filter bar for the admin leads list.
// Server reads the same searchParams to build the Prisma `where` clause,
// so the filter state is shareable (just send the URL) and survives refresh.

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

const STATUS_OPTIONS = [
  { value: "", label: "Any status" },
  { value: "COMPLETED", label: "Completed" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "TIMEOUT", label: "Timed out" },
  { value: "ABANDONED", label: "Abandoned" },
];
const CONTACT_OPTIONS = [
  { value: "", label: "Any CRM stage" },
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "ENROLLED", label: "Enrolled" },
  { value: "LOST", label: "Lost" },
];
const LEVEL_OPTIONS = [
  { value: "", label: "Any level" },
  { value: "Pre-A1", label: "Pre-A1" },
  { value: "A1", label: "A1" },
  { value: "A2", label: "A2" },
  { value: "B1", label: "B1" },
  { value: "B2", label: "B2" },
  { value: "C1", label: "C1" },
  { value: "C2", label: "C2" },
];

type TutorOpt = { id: string; name: string; email: string };
type TestOpt = { id: string; title: string; level: string };

export function LeadsFilters({
  showTutor,
  tutors,
  tests,
}: {
  showTutor: boolean;
  tutors: TutorOpt[];
  tests: TestOpt[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const [q, setQ] = useState(params.get("q") ?? "");
  const [status, setStatus] = useState(params.get("status") ?? "");
  const [contact, setContact] = useState(params.get("contact") ?? "");
  const [level, setLevel] = useState(params.get("level") ?? "");
  const [tutor, setTutor] = useState(params.get("tutor") ?? "");
  const [test, setTest] = useState(params.get("test") ?? "");

  // Sync local state back to URL when any filter changes (debounced for the search box).
  useEffect(() => {
    const t = setTimeout(() => {
      const next = new URLSearchParams();
      if (q.trim()) next.set("q", q.trim());
      if (status) next.set("status", status);
      if (contact) next.set("contact", contact);
      if (level) next.set("level", level);
      if (tutor) next.set("tutor", tutor);
      if (test) next.set("test", test);
      const qs = next.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname);
      });
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, contact, level, tutor, test]);

  const hasAny = !!(q || status || contact || level || tutor || test);

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex-1 min-w-[220px]">
          <span className="block text-xs font-medium text-slate-600">Search name / email / phone</span>
          <div className="mt-1 relative">
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="e.g. tan, gmail.com, 012-345"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pl-8 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
        </label>

        <Select label="Status" value={status} onChange={setStatus} options={STATUS_OPTIONS} />
        <Select label="CRM stage" value={contact} onChange={setContact} options={CONTACT_OPTIONS} />
        <Select label="Result level" value={level} onChange={setLevel} options={LEVEL_OPTIONS} />
        <Select
          label="Test / grade"
          value={test}
          onChange={setTest}
          options={[{ value: "", label: "Any test" }, ...tests.map((t) => ({ value: t.id, label: t.title }))]}
        />
        {showTutor && (
          <Select
            label="Tutor"
            value={tutor}
            onChange={setTutor}
            options={[{ value: "", label: "Any tutor" }, ...tutors.map((t) => ({ value: t.id, label: `${t.name} (${t.email})` }))]}
          />
        )}

        {hasAny && (
          <button
            type="button"
            onClick={() => {
              setQ(""); setStatus(""); setContact(""); setLevel(""); setTutor(""); setTest("");
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

function Select({
  label, value, onChange, options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-600">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}
