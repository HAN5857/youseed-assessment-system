"use client";
import type { RendererProps } from "./index";
import { OptionCard } from "@/components/kids/OptionCard";

export function SingleRenderer({ prompt, content, value, onChange }: RendererProps) {
  const options: { key: string; text: string }[] = content?.options ?? [];
  const selected = value?.key as string | undefined;
  return (
    <div>
      <p className="mb-6 whitespace-pre-wrap text-2xl font-bold leading-snug text-slate-800 sm:text-3xl">
        {prompt}
      </p>
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
