"use client";

import type { ComponentType } from "react";
import { SingleRenderer } from "./Single";
import { MultiRenderer } from "./Multi";
import { TrueFalseRenderer } from "./TrueFalse";
import { FillRenderer } from "./Fill";
import { ClozeRenderer } from "./Cloze";
import { MatchingRenderer } from "./Matching";
import { OrderingRenderer } from "./Ordering";
import { ListeningRenderer } from "./Listening";
import { ReadingRenderer } from "./Reading";

export type RendererProps = {
  prompt: string;
  mediaUrl?: string | null;
  content: any;
  value: any;
  onChange: (next: any) => void;
};

export type Renderer = ComponentType<RendererProps>;

const map: Record<string, Renderer> = {
  SINGLE: SingleRenderer,
  MULTI: MultiRenderer,
  TRUE_FALSE: TrueFalseRenderer,
  FILL: FillRenderer,
  CLOZE: ClozeRenderer,
  MATCHING: MatchingRenderer,
  ORDERING: OrderingRenderer,
  LISTENING: ListeningRenderer,
  READING: ReadingRenderer,
};

export function getRenderer(type: string): Renderer | undefined {
  return map[type];
}

export function FallbackRenderer({ prompt }: RendererProps) {
  return (
    <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
      <p className="font-medium">Unsupported question type</p>
      <p className="mt-1">{prompt}</p>
    </div>
  );
}
