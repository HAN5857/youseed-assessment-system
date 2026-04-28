import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubject } from "@/lib/subjects-config";
import { Mascot } from "@/components/kids/Mascot";
import { SoundToggle } from "@/components/kids/SoundToggle";

export const dynamic = "force-dynamic";

export default async function LevelPickerPage({
  params,
}: { params: Promise<{ subject: string }> }) {
  const { subject: subjectId } = await params;
  const subject = getSubject(subjectId);
  if (!subject) notFound();

  return (
    <main className="kid-bg relative min-h-screen px-4 py-10">
      <div className="fixed right-4 top-4 z-20"><SoundToggle /></div>

      <div className="relative z-10 mx-auto max-w-3xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="text-6xl drop-shadow">{subject.emoji}</div>
          <span className="mt-3 rounded-full bg-white/80 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-violet-700 shadow">
            {subject.name}
          </span>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-800 sm:text-5xl">
            Choose your <span className="bg-gradient-to-r from-pink-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">level!</span>
          </h1>
          <p className="mt-2 max-w-xl text-base font-semibold text-slate-700 sm:text-lg">
            Which standard are you in right now?
          </p>
        </div>

        {!subject.enabled && (
          <div className="mb-6 rounded-2xl border-4 border-amber-300 bg-amber-50 p-5 text-center">
            <p className="text-base font-bold text-amber-800">
              ✨ {subject.name} tests are coming soon!
            </p>
            <p className="mt-1 text-sm font-semibold text-amber-700">
              We&apos;re putting the finishing touches on this. Please check back later.
            </p>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {subject.levels.map((lvl) => {
            const card = (
              <div
                className={`relative h-full overflow-hidden rounded-2xl border-4 border-white p-5 text-white shadow-lg transition-all bg-gradient-to-br ${lvl.color} ${
                  lvl.enabled ? "hover:-translate-y-1 hover:rotate-[-0.5deg] cursor-pointer" : "opacity-60"
                }`}
              >
                {!lvl.enabled && (
                  <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-600">
                    Coming soon
                  </span>
                )}
                <div className="flex items-center gap-4">
                  <span className="text-4xl drop-shadow">{lvl.emoji}</span>
                  <div className="flex-1">
                    <div className="text-xl font-black">{lvl.name}</div>
                    {lvl.ageHint && <div className="text-xs font-bold opacity-90">{lvl.ageHint}</div>}
                    {lvl.unit && <div className="mt-0.5 text-[11px] font-semibold opacity-85">{lvl.unit}</div>}
                  </div>
                  {lvl.enabled && <span className="text-2xl">→</span>}
                </div>
              </div>
            );
            return lvl.enabled ? (
              <Link key={lvl.id} href={`/test/${subject.id}/${lvl.id}`}>{card}</Link>
            ) : (
              <div key={lvl.id} aria-disabled>{card}</div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link href="/test" className="text-sm font-bold text-slate-500 hover:text-violet-600">
            ← Back to subjects
          </Link>
        </div>
      </div>
    </main>
  );
}
