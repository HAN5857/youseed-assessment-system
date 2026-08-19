"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { sound } from "@/lib/sounds";
import { safeFetch } from "@/lib/safe-fetch";
import { SoundToggle } from "@/components/kids/SoundToggle";
import { ArrowGlyph, CheckGlyph, CompassGlyph, MandarinCompanion, SealGlyph } from "./MandarinGlyphs";
import { UiThemeProvider } from "@/lib/ui-theme";
import { MandarinLanguageSwitch, mandarinHref, useMandarinLocale } from "@/lib/mandarin-locale";

type TestMeta = { id: string; title: string; subject: string; duration: number; scope: string };

export function MandarinPasskeyForm({
  levelId, levelName, levelUnit,
}: {
  levelId: string;
  levelName: string;
  levelUnit: string;
}) {
  const router = useRouter();
  const { locale, isEnglish, text } = useMandarinLocale();
  const [step, setStep] = useState<"passkey" | "profile">("passkey");
  const [code, setCode] = useState("");
  const [test, setTest] = useState<TestMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", age: "", email: "", phone: "", location: "", subject: "Chinese", grade: levelName,
  });

  const gradeNum = levelId.match(/\d+/)?.[0] ?? "1";
  const lowerPrimary = Number(gradeNum) <= 3;
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
      if (!ok) throw new Error(data.error || text("这把探索钥匙暂时打不开，请再检查一次。", "This exploration key did not work. Please check it and try again."));
      sound().play("success");
      setTest(data.test);
      setStep("profile");
    } catch (err: any) {
      setError(toMandarinError(err?.message, locale));
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
      if (!ok) throw new Error(data.error || text("资料暂时无法送出，请再试一次。", "We could not submit these details. Please try again."));
      sound().play("success");
      router.push(mandarinHref(`/test/attempt/${data.leadId}/instructions`, locale));
    } catch (err: any) {
      setError(toMandarinError(err?.message, locale));
      setLoading(false);
    }
  }

  return (
    <UiThemeProvider mode="calm" tier={Number(gradeNum) >= 4 ? "upper-primary" : "primary"} subject="chinese">
    <main className={`mandarin-onboarding min-h-dvh px-4 py-8 sm:py-12 ${lowerPrimary ? "mandarin-lower-primary" : ""}`} lang={isEnglish ? "en" : "zh-Hans"} data-locale={locale}>
      <div className="mandarin-floating-tools"><MandarinLanguageSwitch /><SoundToggle /></div>
      <div className="mandarin-cloud cloud-one" aria-hidden />
      <div className="mandarin-cloud cloud-two" aria-hidden />

      <div className="relative z-10 mx-auto max-w-4xl">
        <nav className="mandarin-crumb" aria-label={text("当前位置", "Current location")}>
          <Link href={mandarinHref("/test/chinese", locale)}><ArrowGlyph direction="left" className="h-4 w-4" /> {text("华文探索馆", "Mandarin Discovery")}</Link>
          <span aria-hidden>/</span>
          <strong>{text(displayLevel, `Mandarin Standard ${gradeNum}`)}</strong>
        </nav>

        <section className="mandarin-onboarding-card">
          <div className="mandarin-onboarding-aside">
            <div className="mandarin-eyebrow light"><SealGlyph className="h-5 w-5" /><span>{text("探索卷", "Journey")} · {gradeNum}</span></div>
            <MandarinCompanion mood={step === "profile" ? "ready" : "welcome"} className="mandarin-onboarding-mascot" label={text("小墨陪你探索华文", "Xiao Mo, your Mandarin learning companion")} />
            <h2>{step === "passkey" ? text("小墨准备好啦", "Xiao Mo is ready") : text("让小墨认识你", "Tell Xiao Mo about you")}</h2>
            <p>{step === "passkey" ? text("输入老师给你的钥匙，我们就一起翻开这一卷。", "Enter the key from your teacher and we will open your Mandarin journey together.") : text("留下一点资料，老师就能更懂你的学习足迹。", "A few details will help your tutor understand your learning journey.")}</p>
            <div className="mandarin-step-list" aria-label={text("开始步骤", "Getting started steps")}>
              <StepLine done={step === "profile"} active={step === "passkey"} number="1" label={text("打开探索卷", "Open your journey")} />
              <StepLine done={false} active={step === "profile"} number="2" label={text("留下学习名片", "Add learner details")} />
              <StepLine done={false} active={false} number="3" label={text("开始华文旅程", "Begin the assessment")} />
            </div>
          </div>

          <div className="mandarin-onboarding-main">
            {step === "passkey" ? (
              <>
                <span className="mandarin-kicker"><CompassGlyph className="h-5 w-5" /><span>{text("第一站", "First stop")}</span></span>
                <h1>{isEnglish ? <>Enter your <span>exploration key</span></> : <>请出示你的<span>探索钥匙</span></>}</h1>
                <p className="mandarin-form-intro">{text("这不是考试编号，而是老师为你准备的专属入口。", "Your teacher prepared this key to open the correct Mandarin assessment for you.")}</p>
                <form onSubmit={checkPasskey} className="mt-7 space-y-5">
                  <label className="mandarin-key-label" htmlFor="mandarin-passkey">{text("探索钥匙", "Exploration key")}</label>
                  <input
                    id="mandarin-passkey"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder={`${text("例如", "Example")}: CHI-S${gradeNum}-DEMO`}
                    className="mandarin-key-input"
                    required
                    autoFocus
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {error && <p className="mandarin-form-error" role="alert">{error}</p>}
                  <button type="submit" disabled={loading || !code.trim()} className="mandarin-primary-button mandarin-cta-shine w-full">
                    {loading ? <><span className="mandarin-loader" aria-hidden /><span>{text("正在寻找你的探索卷…", "Finding your journey…")}</span></> : <><span>{text("翻开这一卷", "Open this journey")}</span><ArrowGlyph className="h-5 w-5" /></>}
                  </button>
                </form>
                <p className="mandarin-privacy-note">{text("这把钥匙只会打开老师为你安排的那一卷。", "This key opens only the assessment assigned by your teacher.")}</p>
              </>
            ) : test ? (
              <>
                <span className="mandarin-kicker"><CheckGlyph className="h-5 w-5" /><span>{text("探索卷已找到", "Journey found")}</span></span>
                <h1>{isEnglish ? <>Complete your <span>learner profile</span></> : <>写下你的<span>学习名片</span></>}</h1>
                <p className="mandarin-form-intro">{isEnglish ? `Mandarin Standard ${gradeNum} · About ${test.duration} minutes` : `${test.title} · 约 ${test.duration} 分钟`}</p>
                {levelUnit && <p className="mandarin-form-unit">{isEnglish ? `Mandarin Standard ${gradeNum} · KSSR Semakan` : levelUnit}</p>}
                <form onSubmit={submitForm} className="mandarin-profile-grid">
                  <MandarinInput label={text("你的名字", "Student name")} hint={text("我们会这样称呼你", "How your name should appear")} value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
                  <MandarinInput label={text("年龄", "Age")} hint={text("请输入实际年龄", "Enter the learner's current age")} type="number" min={4} max={99} value={form.age} onChange={(v) => setForm({ ...form, age: v })} required />
                  <MandarinInput label={text("家长电邮", "Parent email")} type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
                  <MandarinInput label={text("家长联络号码", "Parent contact number")} type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
                  <MandarinInput label={text("居住地区", "Area") } value={form.location} onChange={(v) => setForm({ ...form, location: v })} required />
                  <MandarinInput label={text("目前年级", "Current standard")} value={text(displayLevel, `Mandarin Standard ${gradeNum}`)} onChange={() => undefined} disabled />
                  {error && <p className="mandarin-form-error sm:col-span-2" role="alert">{error}</p>}
                  <button type="submit" disabled={loading} className="mandarin-primary-button mandarin-cta-shine sm:col-span-2">
                    {loading ? <><span className="mandarin-loader" aria-hidden /><span>{text("正在准备旅程…", "Preparing your journey…")}</span></> : <><span>{text("名片写好了，出发！", "Profile complete — let's begin!")}</span><ArrowGlyph className="h-5 w-5" /></>}
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

function toMandarinError(message: string | undefined, locale: "zh" | "en") {
  const text = String(message || "");
  if (/invalid|not found|passkey|disabled|expired|used/i.test(text)) return locale === "en" ? "This key is invalid, disabled, expired or has reached its usage limit. Please check with your teacher." : "这把探索钥匙无效、已停用或已用完，请向老师确认后再试。";
  if (/network|fetch|connect/i.test(text)) return locale === "en" ? "The connection is taking longer than expected. Keep this page open and try again." : "网络暂时有点慢，请保持页面开启并再试一次。";
  return text || (locale === "en" ? "We cannot continue right now. Please try again shortly." : "暂时无法继续，请稍后再试。");
}
