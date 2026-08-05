// ─────────────────────────────────────────────────────────────────────────
// Per-org capability helpers: which tests an org may use + its passkey
// prefix. Kept separate from tenant-scope (which answers "who can they
// SEE") — this answers "what can they DO".
// ─────────────────────────────────────────────────────────────────────────

import { prisma } from "@/lib/db";
import type { SessionPayload } from "@/lib/auth";

// Slug / prefix sanitiser: lowercase, [a-z0-9_-], max 40 chars.
export function cleanSlug(raw: string): string {
  return String(raw ?? "")
    .trim().toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 40);
}

export type CallerOrg = {
  id: string;
  slug: string;
  name: string;
  active: boolean;
  passkeyPrefix: string | null;
  brandColor: string | null;
  logoUrl: string | null;
  allowedTests: string[] | null; // parsed; null = every test allowed
};

/** The Organization the session belongs to (or null for solo / superadmin). */
export async function getCallerOrg(session: SessionPayload): Promise<CallerOrg | null> {
  if (!session.orgId) return null;
  const o = await prisma.organization.findUnique({ where: { id: session.orgId } });
  if (!o) return null;
  return {
    id: o.id,
    slug: o.slug,
    name: o.name,
    active: o.active,
    passkeyPrefix: o.passkeyPrefix,
    brandColor: o.brandColor,
    logoUrl: o.logoUrl,
    allowedTests: parseAllowed(o.allowedTests),
  };
}

/** The test key used in allowedTests, e.g. "english/standard-1". */
export function testKey(subject: string, level: string): string {
  return `${subject}/${level}`;
}

export function parseAllowed(raw: string | null): string[] | null {
  if (!raw) return null;
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.map(String) : null;
  } catch {
    return null;
  }
}

/**
 * May a caller in `org` generate/use `subject/level`? SUPERADMIN + solo
 * users (org === null) can use everything; an org with a null allowedTests
 * allows everything; otherwise the key must be listed.
 */
export function isTestAllowed(org: CallerOrg | null, subject: string, level: string): boolean {
  if (!org || org.allowedTests === null) return true;
  return org.allowedTests.includes(testKey(subject, level));
}

/** Filter a test list down to what `org` may use (identity when unrestricted). */
export function filterAllowedTests<T extends { subject: string; level: string }>(
  org: CallerOrg | null,
  tests: T[],
): T[] {
  if (!org || org.allowedTests === null) return tests;
  const set = new Set(org.allowedTests);
  return tests.filter((t) => set.has(testKey(t.subject, t.level)));
}
