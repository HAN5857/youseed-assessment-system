"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { sound } from "@/lib/sounds";
import { safeFetch } from "@/lib/safe-fetch";
import { SoundToggle } from "@/components/kids/SoundToggle";
import { ArrowGlyph, CheckGlyph, CompassGlyph, MandarinCompanion, SealGlyph } from "./MandarinGlyphs";
import { UiThemeProvider } from "@/lib/ui-theme";

type TestMeta = { id: string; title: string; subject: string; duration: number; scope: string };

export function MandarinPasskeyForm({
  levelId, levelName, levelUnit,
}: {
  levelId: string;
  levelName: string;
  levelUnit: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<"passkey" | "profile">("passkey");
  const [code, setCode] = useState("");
  const [test, setTest] = useState<TestMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", age: "", email: "", phone: "", location: "", subject: "Chinese", grade: levelName,
  });

  const gradeNum = levelId.match(/\d+/)?.[0] ?? "1";
  const displayLevel = `华文${["一", "二", "三", "四", "五", "六"][Number(gradeNum) - 1] ?? gradeNum}年级`;

  async function checkPasskey(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await sound().unlock();
      sound().play("click");
      const { ok, data } = await safeFetch<{ ok: boolean; test: TestMeta; error?: string }>("/api/passkey/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subject: "chinese", level: levelId }),
      });
      if (!ok) throw new Error(data.error || "这把探索钥匙暂时打不开，请再检查一次。 ");
      sound().play("success");
      setTest(data.test);
      setStep("profile");
    } catch (err: any) {
      setError(toMandarinError(err?.message));
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
      const { ok, data } = await safeFetch<{ ok: boolean; leadId: string; error?: string }>("/api/lead/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passkeyCode: code, ...form }),
      });
      if (!ok) throw new Error(data.error || "资料暂时无法送出，请再试一次。 ");
      sound().play("success");
      router.push(`/test/attempt/${data.leadId}/instructions`);
    } catch (err: any) {
      setError(toMandarinError(err?.message));
      setLoading(false);
    }
  }

  return (
    <UiThemeProvider mode="calm" tier={Number(gradeNum) >= 4 ? "upper-primary" : "primary"} subject="chinese">
    <main className="mandarin-onboarding min-h-dvh px-4 py-8 sm:py-12" lang="zh-Hans">
      <div className="fixed right-4 top-4 z-30"><SoundToggle /></div>
      <div className="mandarin-cloud cloud-one" aria-hidden />
      <div className="mandarin-cloud cloud-two" aria-hidden />

      <div className="relative z-10 mx-auto max-w-4xl">
        <nav className="mandarin-crumb" aria-label="当前位置">
          <Link href="/test/chinese"><ArrowGlyph direction="left" className="h-4 w-4" /> 华文探索馆</Link>
          <span aria-hidden>/</span>
          <strong>{displayLevel}</strong>
        </nav>

        <section className="mandarin-onboarding-card">
          <div className="mandarin-onboarding-aside">
            <div className="mandarin-eyebrow light"><SealGlyph className="h-5 w-5" /> 探索卷 · {gradeNum}</div>
            <MandarinCompanion mood={step === "profile" ? "ready" : "welcome"} className="mandarin-onboarding-mascot" />
            <h2>{step === "passkey" ? "小墨已经准备好啦" : "让小墨认识你"}</h2>
            <p>{step === "passkey" ? "输入老师给你的探索钥匙，我们就能一起翻开这卷华文旅程。" : "这些资料能帮助老师读懂你的学习足迹，也让旅程更贴近你。"}</p>
            <div className="mandarin-step-list" aria-label="开始步骤">
              <StepLine done={step === "profile"} active={step === "passkey"} number="一" label="打开探索卷" />
              <StepLine done={false} active={step === "profile"} number="二" label="留下学习名片" />
              <StepLine done={false} active={false} number="三" label="开始华文旅程" />
            </div>
          </div>

          <div className="mandarin-onboarding-main">
            {step === "passkey" ? (
              <>
                <span className="mandarin-kicker"><CompassGlyph className="h-5 w-5" /> 第一站</span>
                <h1>请出示你的<span>探索钥匙</span></h1>
                <p className="mandarin-form-intro">不是考试编号，而是老师为你准备的专属入口。</p>
                <form onSubmit={checkPasskey} className="mt-7 space-y-5">
                  <label className="mandarin-key-label" htmlFor="mandarin-passkey">探索钥匙</label>
                  <input
                    id="mandarin-passkey"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder={`例如：CHI-S${gradeNum}-DEMO`}
                    className="mandarin-key-input"
                    required
                    autoFocus
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {error && <p className="mandarin-form-error" role="alert">{error}</p>}
                  <button type="submit" disabled={loading || !code.trim()} className="mandarin-primary-button w-full">
                    {loading ? <><span className="mandarin-loader" aria-hidden /> 正在寻找你的探索卷…</> : <>翻开这一卷 <ArrowGlyph className="h-5 w-5" /></>}
                  </button>
                </form>
                <p className="mandarin-privacy-note">探索钥匙只用于进入对应年级与老师的评估旅程。</p>
              </>
            ) : test ? (
              <>
                <span className="mandarin-kicker"><CheckGlyph className="h-5 w-5" /> 探索卷已找到</span>
                <h1>写下你的<span>学习名片</span></h1>
                <p className="mandarin-form-intro">{test.title} · 约 {test.duration} 分钟</p>
                {levelUnit && <p className="mandarin-form-unit">{levelUnit}</p>}
                <form onSubmit={submitForm} className="mandarin-profile-grid">
                  <MandarinInput label="你的名字" hint="我们会这样称呼你" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
                  <MandarinInput label="年龄" hint="请输入实际年龄" type="number" min={4} max={99} value={form.age} onChange={(v) => setForm({ ...form, age: v })} required />
                  <MandarinInput label="家长电邮" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
                  <MandarinInput label="家长联络号码" type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
                  <MandarinInput label="居住地区" value={form.location} onChange={(v) => setForm({ ...form, location: v })} required />
                  <MandarinInput label="目前年级" value={displayLevel} onChange={() => undefined} disabled />
                  {error && <p className="mandarin-form-error sm:col-span-2" role="alert">{error}</p>}
                  <button type="submit" disabled={loading} className="mandarin-primary-button sm:col-span-2">
                    {loading ? <><span className="mandarin-loader" aria-hidden /> 正在准备旅程…</> : <>我的学习名片完成了 <ArrowGlyph className="h-5 w-5" /></>}
                  </button>
                </form>
              </>
            ) : null}
          </div>
        </section>
      </div>
    </main>
    </UiThemeProvider>
  );
}

function StepLine({ done, active, number, label }: { done: boolean; active: boolean; number: string; label: string }) {
  return (
    <div className={`mandarin-step-line ${active ? "active" : ""} ${done ? "done" : ""}`}>
      <span>{done ? <CheckGlyph className="h-5 w-5" /> : number}</span><strong>{label}</strong>
    </div>
  );
}

function MandarinInput({ label, hint, value, onChange, type = "text", required, disabled, min, max }: {
  label: string; hint?: string; value: string; onChange: (value: string) => void; type?: string;
  required?: boolean; disabled?: boolean; min?: number; max?: number;
}) {
  return (
    <label className="mandarin-field">
      <span>{label}{required && <b aria-hidden> ·</b>}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} disabled={disabled} min={min} max={max} />
      {hint && <small>{hint}</small>}
    </label>
  );
}

function toMandarinError(message?: string) {
  const text = String(message || "");
  if (/invalid|not found|passkey|disabled|expired|used/i.test(text)) return "这把探索钥匙无效、已停用或已用完，请向老师确认后再试。";
  if (/network|fetch|connect/i.test(text)) return "网络暂时有点慢，请保持页面开启并再试一次。";
  return text || "暂时无法继续，请稍后再试。";
}
