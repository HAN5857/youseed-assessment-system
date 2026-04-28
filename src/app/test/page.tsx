import Link from "next/link";
import { SUBJECTS } from "@/lib/subjects-config";
import { Mascot } from "@/components/kids/Mascot";
import { SoundToggle } from "@/components/kids/SoundToggle";

export const dynamic = "force-dynamic";

export default function SubjectPickerPage() {
  return (
    <main className="kid-bg relative min-h-screen px-4 py-10">
      <div className="fixed right-4 top-4 z-20"><SoundToggle /></div>

      <div className="relative z-10 mx-auto max-w-3xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <Mascot mood="wave" size={130} />
          <span className="mt-3 rounded-full bg-white/80 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-violet-700 shadow">
            🎉 Free Language Assessment
          </span>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-800 sm:text-5xl">
            Pick your <span className="bg-gradient-to-r from-pink-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">subject!</span>
          </h1>
          <p className="mt-2 max-w-xl text-base font-semibold text-slate-700 sm:text-lg">
            Which language would you like to test today?
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {SUBJECTS.map((s) => {
            const card = (
              <div
                className={`relative h-full overflow-hidden rounded-3xl border-4 border-white p-6 text-center text-white shadow-xl transition-all bg-gradient-to-br ${s.bgGradient} ${
                  s.enabled ? "hover:-translate-y-1.5 hover:rotate-[-1deg] cursor-pointer" : "opacity-70"
                }`}
              >
                {!s.enabled && (
                  <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-600">
                    Coming soon
                  </span>
                )}
                <div className="text-6xl drop-shadow">{s.emoji}</div>
                <div className="mt-3 text-2xl font-black">{s.name}</div>
                <div className="mt-1 text-xs font-semibold opacity-90">{s.tagline}</div>
              </div>
            );
            return s.enabled ? (
              <Link key={s.id} href={`/test/${s.id}`}>{card}</Link>
            ) : (
              <div key={s.id} aria-disabled>{card}</div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-sm font-semibold text-slate-600">
          Don&apos;t have a passkey? Ask your tutor! 💖
        </p>

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs font-bold text-slate-500 hover:text-violet-600">
            🏠 Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
