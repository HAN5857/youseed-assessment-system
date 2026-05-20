"use client";

import { useEffect, useState } from "react";

/**
 * Returns true once `timeoutMs` have elapsed without any of the dep values changing.
 * Resets to false whenever a dep changes.
 *
 * Example:
 *   const idle = useIdleTimeout(30_000, [questionIdx, responsesSerial]);
 *   useEffect(() => { if (idle) showNudge() }, [idle]);
 */
export function useIdleTimeout(timeoutMs: number, deps: ReadonlyArray<unknown>): boolean {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    setIdle(false);
    const t = setTimeout(() => setIdle(true), timeoutMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeoutMs, ...deps]);

  return idle;
}
