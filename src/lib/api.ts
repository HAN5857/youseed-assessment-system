import { NextResponse } from "next/server";

// Server-side wrapper for API route handlers.
// Guarantees every response is valid JSON with { ok, error?, ... }.
// Catches thrown errors and maps known cases (UNAUTHORIZED, FORBIDDEN, NOT_FOUND).
// Prevents the "empty response body → client JSON parse error" class of bugs.

export function apiJson(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, init);
}

export async function withApi<T>(fn: () => Promise<T>): Promise<Response> {
  try {
    const result = await fn();
    if (result instanceof Response) return result;
    return NextResponse.json(result);
  } catch (err: any) {
    const msg = err?.message ?? "Internal error";
    console.error("[API error]", msg, err?.stack);
    if (msg === "UNAUTHORIZED") return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    if (msg === "FORBIDDEN")    return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
    if (msg === "NOT_FOUND")    return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
    if (msg === "BAD_REQUEST")  return NextResponse.json({ ok: false, error: "BAD_REQUEST" }, { status: 400 });
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: "Something went wrong on our side. Please try again." },
      { status: 500 }
    );
  }
}
