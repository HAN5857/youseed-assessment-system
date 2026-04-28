"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { sound } from "@/lib/sounds";
import { safeFetch } from "@/lib/safe-fetch";
import { Mascot } from "@/components/kids/Mascot";
import { SoundToggle } from "@/components/kids/SoundToggle";

type TestMeta = { id: string; title: string; subject: string; duration: number; scope: string };

export function PasskeyForm({
  subjectId, subjectName, subjectEmoji, levelId, levelName, levelUnit,
}: {
  subjectId: string;
  subjectName: string;
  subjectEmoji: string;
  levelId: string;
  levelName: string;
  levelUnit: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<"passkey" | "form">("passkey");
  const [code, setCode] = useState("");
  const [test, setTest] = useState<TestMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", age: "", email: "", phone: "", location: "", subject: subjectName, grade: levelName,
  });

  async function checkPasskey(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await sound().unlock();
      sound().play("click");
      const { ok, data } = await safeFetch<{ ok: boolean; test: TestMeta; error?: string }>(
        "/api/passkey/check",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, subject: subjectId, level: levelId }),
        }
      );
      if (!ok) throw new Error(data.error || "Oops! That passkey didn't work 😅");
      sound().play("success");
      setTest(data.test);
      setStep("form");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      sound().play("click");
      const { ok, data } = await safeFetch<{ ok: boolean; leadId: string; error?: string }>(
        "/api/lead/start",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ passkeyCode: code, ...form }),
        }
      );
      if (!ok) throw new Error(data.error || "Submission failed");
      sound().play("success");
      router.push(`/test/attempt/${data.leadId}/instructions`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <main className="kid-bg relative flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="fixed right-4 top-4 z-20"><SoundToggle /></div>

      <div className="relative z-10 w-full max-w-xl">
        <div className="mb-3 flex justify-center">
          <Mascot mood={step === "passkey" ? "wave" : "cheer"} />
        </div>

        {/* Breadcrumb */}
        <div className="mb-3 flex items-center justify-center gap-2 text-xs font-bold text-slate-600">
          <Link href="/test" className="hover:text-violet-700">Subject</Link>
          <span>›</span>
          <Link href={`/test/${subjectId}`} className="hover:text-violet-700">{subjectEmoji} {subjectName}</Link>
          <span>›</span>
          <span className="text-violet-700">{levelName}</span>
        </div>

        <div className="kid-card p-7 sm:p-9">
          {step === "passkey" && (
            <>
              <h1 className="text-3xl font-black tracking-tight text-slate-800 sm:text-4xl">
                Hi there! 👋
              </h1>
              <p className="mt-2 text-base font-semibold text-slate-600">
                Type in the secret <span className="text-pink-600">passkey</span> your tutor gave you for{" "}
                <span className="font-black text-violet-700">{subjectName} · {levelName}</span>.
              </p>
              <form onSubmit={checkPasskey} className="mt-6 space-y-4">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ENG-S1-DEMO"
                  className="w-full rounded-2xl border-4 border-violet-200 bg-violet-50 px-5 py-4 text-center text-xl font-black tracking-widest text-violet-900 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  required
                  autoFocus
                />
                {error && (
                  <p className="rounded-xl border-2 border-rose-200 bg-rose-50 p-3 text-center text-sm font-bold text-rose-700 kid-shake-gentle">
                    {error}
                  </p>
                )}
                <button type="submit" disabled={loading || !code} className="kid-btn w-full">
                  {loading ? "Checking… 🔍" : "Let's go! 🚀"}
                </button>
              </form>
              <div className="mt-4 text-center">
                <Link href={`/test/${subjectId}`} className="text-xs font-bold text-slate-500 hover:text-violet-600">
                  ← Pick a different level
                </Link>
              </div>
            </>
          )}

          {step === "form" && test && (
            <>
              <span className="inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-violet-700">
                ⏱ {test.duration} min · {subjectName} {levelName}
              </span>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-800 sm:text-4xl">
                {test.title}
              </h1>
              {levelUnit && <p className="mt-1 text-xs font-semibold text-slate-500">{levelUnit}</p>}
              <p className="mt-2 text-sm font-semibold text-slate-600">
                Tell us a bit about yourself so we can cheer you on!
              </p>
              <form onSubmit={submitForm} className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <KInput label="What's your name? 🌟" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
                <KInput label="How old are you?" type="number" value={form.age} onChange={(v) => setForm({ ...form, age: v })} required min={4} max={99} />
                <KInput label="Parent email ✉️" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
                <KInput label="Parent phone 📱" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
                <KInput label="Where do you live? 🏠" value={form.location} onChange={(v) => setForm({ ...form, location: v })} required />
                <KInput label="Subject" value={form.subject} onChange={(v) => setForm({ ...form, subject: v })} disabled />
                <div className="sm:col-span-2">
                  <KInput label="Grade / level" value={form.grade} onChange={(v) => setForm({ ...form, grade: v })} disabled />
                </div>
                {error && (
                  <p className="sm:col-span-2 rounded-xl bg-rose-50 p-3 text-center text-sm font-bold text-rose-700 kid-shake-gentle">{error}</p>
                )}
                <button type="submit" disabled={loading} className="kid-btn kid-btn-green sm:col-span-2 mt-2">
                  {loading ? "Almost there…" : "I'm ready! ✨"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function KInput({
  label, value, onChange, type = "text", required, disabled, min, max,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; disabled?: boolean; min?: number; max?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-600">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-base font-semibold outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100 disabled:bg-slate-100"
      />
    </label>
  );
}
