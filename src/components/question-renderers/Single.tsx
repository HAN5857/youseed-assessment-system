"use client";
import type { RendererProps } from "./index";
import { OptionCard } from "@/components/kids/OptionCard";
import { PassageCard } from "@/components/kids/PassageCard";
import { useIsChineseTheme, useUiTheme, useUiTier } from "@/lib/ui-theme";
import { AudioClipPlayer } from "@/components/kids/AudioClipPlayer";
import { InstructionHint } from "@/components/kids/InstructionHint";
import { QuestionBody } from "@/components/kids/QuestionBody";
import { splitPrompt } from "@/lib/prompt-format";
import Image from "next/image";

// Audio file extensions trigger the inline player instead of an <img>.
const AUDIO_EXT = /\.(mp3|wav|ogg|m4a|mpeg|aac)(\?.*)?$/i;

export function SingleRenderer({ prompt, mediaUrl, content, value, onChange }: RendererProps) {
  const theme = useUiTheme();
  const tier = useUiTier();
  const chinese = useIsChineseTheme();
  const upper = theme === "calm" && tier === "upper-primary";
  const { instruction, body } = (upper || chinese) ? splitPrompt(prompt) : { instruction: undefined as string | undefined, body: prompt };
  const options: { key: string; text: string }[] = content?.options ?? [];
  const selected = value?.key as string | undefined;
  const hasMedia = typeof mediaUrl === "string" && mediaUrl.length > 0;
  const isAudio = hasMedia && AUDIO_EXT.test(mediaUrl!);
  // A question may carry an audio mediaUrl AND a supporting image via
  // content.imageUrl — used by S6 phonics (e.g. rehearse audio + rehearse photo).
  const contentImage: string | undefined = content?.imageUrl;
  const imageUrl: string | undefined = contentImage || (hasMedia && !isAudio ? mediaUrl! : undefined);
  const speakText: string | undefined = content?.speakText;
  const passage: string | undefined = content?.passage;
  return (
    <div>
      {passage && (
        <div className="mb-5">
          <PassageCard
            text={passage}
            imageUrl={content?.passageImage}
            imageAlt={content?.passageImageAlt}
            table={content?.passageTable}
          />
        </div>
      )}
      {(upper || chinese) && instruction && <InstructionHint text={instruction} />}
      {(upper || chinese) ? (
        <div className="mb-4">
          <QuestionBody text={body} />
        </div>
      ) : (
        <p className="mb-4 whitespace-pre-wrap text-2xl font-bold leading-snug text-slate-800 sm:text-3xl">
          {body}
        </p>
      )}
      {imageUrl && (
        <div className="mb-5 flex justify-center">
          <Image
            src={imageUrl}
            alt={content?.imageAlt ?? ""}
            width={900}
            height={600}
            sizes="(max-width: 640px) 92vw, 640px"
            className={
              chinese
                ? "mandarin-question-image max-h-60 max-w-full w-auto object-contain sm:max-h-72"
                : upper
                ? "max-h-48 max-w-full w-auto rounded-xl border border-[#DDEFE4] bg-white object-contain p-1.5 shadow-sm sm:max-h-56"
                : theme === "calm"
                  ? "max-h-64 max-w-full w-auto rounded-3xl border-4 border-emerald-200 bg-white p-3 shadow-lg"
                  : "max-h-64 max-w-full w-auto rounded-3xl border-4 border-amber-200 bg-white p-3 shadow-lg"
            }
          />
        </div>
      )}
      {(isAudio || speakText) && (
        <div className="mb-5">
          <AudioClipPlayer
            src={isAudio ? mediaUrl! : undefined}
            speakText={!isAudio ? speakText : undefined}
            maxPlays={content?.maxPlays ?? 3}
            lang={content?.lang ?? "en-US"}
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
      {content?.afterHint && (
        <aside className="mandarin-after-hint">
          <span aria-hidden>提示</span><p>{content.afterHint}</p>
        </aside>
      )}
    </div>
  );
}
