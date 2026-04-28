import { notFound } from "next/navigation";
import { getSubject, getLevel } from "@/lib/subjects-config";
import { PasskeyForm } from "./PasskeyForm";

export const dynamic = "force-dynamic";

export default async function PasskeyEntryPage({
  params,
}: { params: Promise<{ subject: string; level: string }> }) {
  const { subject: subjectId, level: levelId } = await params;
  const subject = getSubject(subjectId);
  const level = getLevel(subjectId, levelId);
  if (!subject || !level) notFound();

  // Hide locked levels (config flag); the API will also reject server-side.
  if (!level.enabled || !subject.enabled) {
    return (
      <main className="kid-bg relative min-h-screen px-4 py-10">
        <div className="mx-auto max-w-md rounded-2xl border-4 border-amber-300 bg-amber-50 p-6 text-center">
          <div className="text-4xl">⏳</div>
          <h1 className="mt-2 text-2xl font-black text-amber-800">{subject.name} · {level.name}</h1>
          <p className="mt-2 text-sm font-semibold text-amber-700">
            This level is coming soon. Please check back later, or pick another level.
          </p>
          <a
            href={`/test/${subject.id}`}
            className="mt-5 inline-block rounded-full border-2 border-amber-400 bg-white px-5 py-2 text-sm font-bold text-amber-800 hover:bg-amber-100"
          >
            ← Back to levels
          </a>
        </div>
      </main>
    );
  }

  return (
    <PasskeyForm
      subjectId={subject.id}
      subjectName={subject.name}
      subjectEmoji={subject.emoji}
      levelId={level.id}
      levelName={level.name}
      levelUnit={level.unit ?? ""}
    />
  );
}
