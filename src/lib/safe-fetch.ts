// Robust client-side fetch for API routes.
// Handles:
// - Empty response bodies (cold-start / function timeout)
// - Non-JSON error pages (5xx gateway errors)
// - Automatic single retry on cold starts (network / 5xx)
// Always either resolves to { ok, data } or throws an Error with a friendly message.

export type SafeFetchResult<T = any> = { ok: boolean; status: number; data: T };

export async function safeFetch<T = any>(
  url: string,
  init: RequestInit = {},
  opts: { retries?: number; retryDelayMs?: number } = {}
): Promise<SafeFetchResult<T>> {
  const retries = opts.retries ?? 1;
  const delay = opts.retryDelayMs ?? 800;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const r = await fetch(url, init);
      const text = await r.text();

      let data: any = {};
      if (text) {
        try { data = JSON.parse(text); }
        catch {
          // Non-JSON body (e.g. HTML error page from gateway) — treat as failure
          if (attempt < retries) {
            await sleep(delay);
            continue;
          }
          throw new Error("Server returned an unexpected response. Please try again in a moment.");
        }
      } else if (!r.ok) {
        // Empty body + error status → likely cold start or timeout
        if (attempt < retries) {
          await sleep(delay);
          continue;
        }
        throw new Error(
          r.status >= 500
            ? "Our server is waking up. Please try again in a few seconds."
            : `Request failed (${r.status}). Please try again.`
        );
      }
      // Empty body + success status is fine (some PATCH endpoints return nothing)

      return { ok: r.ok, status: r.status, data: data as T };
    } catch (err: any) {
      // Network error — retry once
      if (attempt < retries && !(err instanceof TypeError === false && err.message?.includes("server"))) {
        await sleep(delay);
        continue;
      }
      // Re-throw a cleaner message
      if (err?.name === "TypeError" || err?.message?.includes("fetch")) {
        throw new Error("Network problem. Please check your connection and try again.");
      }
      throw err;
    }
  }
  // Unreachable
  throw new Error("Request failed.");
}

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }
