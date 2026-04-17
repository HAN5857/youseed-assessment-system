import { cookies } from "next/headers";
import { verifyToken, type AttemptToken } from "./auth";

export async function readAttemptCookie(leadId: string): Promise<AttemptToken | null> {
  const c = await cookies();
  const tok = c.get(`attempt_${leadId}`)?.value;
  if (!tok) return null;
  const payload = verifyToken<AttemptToken>(tok);
  if (!payload || payload.leadId !== leadId) return null;
  return payload;
}
