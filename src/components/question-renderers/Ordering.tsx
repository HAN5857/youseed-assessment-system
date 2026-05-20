"use client";
import type { RendererProps } from "./index";
import { useMemo } from "react";
import { sound } from "@/lib/sounds";
import { OrderingDndRenderer } from "./OrderingDnd";
import { useUiTheme } from "@/lib/ui-theme";

const RANK_COLORS_PLAYFUL = ["bg-yellow-400", "bg-pink-400", "bg-sky-400", "bg-emerald-400", "bg-violet-400", "bg-orange-400"];
const RANK_COLORS_CALM = ["bg-emerald-400", "bg-teal-400", "bg-lime-400", "bg-green-400", "bg-emerald-500", "bg-teal-500"];

/**
 * Dispatcher: opt-in to drag-drop via content.dragDrop = true.
 * Otherwise falls back to the legacy up/down arrow UI.
 */
export function OrderingRenderer(props: RendererProps) {
  if (props.content?.dragDrop === true) {
    return <OrderingDndRenderer {...props} />;
  }
  return <OrderingLegacyRenderer {...props} />;
}

function OrderingLegacyRenderer({ prompt, content, value, onChange }: RendererProps) {
  const theme = useUiTheme();
  const calm = theme === "calm";
  const rankColors = calm ? RANK_COLORS_CALM : RANK_COLORS_PLAYFUL;
  const items: string[] = content?.items ?? [];
  const order: number[] = useMemo(
    () => value?.order ?? items.map((_, i) => i),
    [value?.order, items]
  );

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...order];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    sound().play("click");
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange({ order: next });
  };

  const hintColor = calm ? "text-emerald-600" : "text-violet-600";
  const arrowBtn = calm
    ? "grid h-8 w-10 place-items-center rounded-lg bg-emerald-100 text-lg text-emerald-700 hover:bg-emerald-200 disabled:opacity-30"
    : "grid h-8 w-10 place-items-center rounded-lg bg-sky-100 text-lg text-sky-700 hover:bg-sky-200 disabled:opacity-30";

  return (
    <div>
      <p className="mb-2 whitespace-pre-wrap text-2xl font-bold leading-snug text-slate-800 sm:text-3xl">
        {prompt}
      </p>
      <p className={`mb-4 text-sm font-semibold ${hintColor}`}>👆 Use the arrows to move items up or down.</p>
      <ol className="space-y-3">
        {order.map((itemIdx, pos) => (
          <li key={pos} className="flex items-center gap-3 rounded-2xl border-4 border-slate-100 bg-white p-4 shadow-sm">
            <span className={`grid h-12 w-12 flex-none place-items-center rounded-xl text-xl font-black text-white shadow ${rankColors[pos % rankColors.length]}`}>
              {pos + 1}
            </span>
            <span className="flex-1 text-base font-semibold text-slate-800 sm:text-lg">{items[itemIdx]}</span>
            <div className="flex flex-col gap-1">
              <button type="button" onClick={() => move(pos, -1)} disabled={pos === 0} className={arrowBtn}>
                ↑
              </button>
              <button type="button" onClick={() => move(pos, 1)} disabled={pos === order.length - 1} className={arrowBtn}>
                ↓
              </button>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
