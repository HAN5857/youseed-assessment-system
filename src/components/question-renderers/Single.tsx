"use client";
import type { RendererProps } from "./index";
import { OptionCard } from "@/components/kids/OptionCard";
import { PassageCard } from "@/components/kids/PassageCard";

export function SingleRenderer({ prompt, mediaUrl, content, value, onChange }: RendererProps) {
  const options: { key: string; text: string }[] = content?.options ?? [];
  const selected = value?.key as string | undefined;
  const hasImage = typeof mediaUrl === "string" && mediaUrl.length > 0;
  const passage: string | undefined = content?.passage;
  return (
    <div>
      {passage && (
        <div className="mb-5">
          <PassageCard text={passage} />
        </div>
      )}
      <p className="mb-4 whitespace-pre-wrap text-2xl font-bold leading-snug text-slate-800 sm:text-3xl">
        {prompt}
      </p>
      {hasImage && (
        <div className="mb-5 flex justify-center">
          <img
            src={mediaUrl!}
            alt=""
            className="max-h-64 w-auto rounded-3xl border-4 border-amber-200 bg-white p-3 shadow-lg"
          />
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((o, i) => (
          <OptionCard
            key={o.key}
            index={i}
            badge={o.key}
            text={o.text}
            selected={selected === o.key}
            onSelect={() => onChange({ key: o.key })}
          />
        ))}
      </div>
    </div>
  );
}
