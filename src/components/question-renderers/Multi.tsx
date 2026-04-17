"use client";
import type { RendererProps } from "./index";
import { OptionCard } from "@/components/kids/OptionCard";
import { PassageCard } from "@/components/kids/PassageCard";

export function MultiRenderer({ prompt, content, value, onChange }: RendererProps) {
  const options: { key: string; text: string }[] = content?.options ?? [];
  const chosen: string[] = value?.keys ?? [];
  const passage: string | undefined = content?.passage;
  const toggle = (k: string) => {
    const next = chosen.includes(k) ? chosen.filter((x) => x !== k) : [...chosen, k];
    onChange({ keys: next });
  };
  return (
    <div>
      {passage && (
        <div className="mb-5">
          <PassageCard text={passage} />
        </div>
      )}
      <p className="mb-2 whitespace-pre-wrap text-2xl font-bold leading-snug text-slate-800 sm:text-3xl">
        {prompt}
      </p>
      <p className="mb-5 text-sm font-semibold text-violet-600">👉 Pick all that are correct!</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((o, i) => (
          <OptionCard
            key={o.key}
            index={i}
            badge={o.key}
            text={o.text}
            selected={chosen.includes(o.key)}
            onSelect={() => toggle(o.key)}
            multi
          />
        ))}
      </div>
    </div>
  );
}
