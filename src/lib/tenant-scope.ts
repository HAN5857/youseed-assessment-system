// ─────────────────────────────────────────────────────────────────────────
// Tenant-scoping helpers — single source of truth for "who can this user
// see". Every list/detail API in /admin should filter through these; that
// way widening tenancy (multi-org, sub-teams, etc.) only requires changing
// this file.
//
// Model:
//   • SUPERADMIN → sees EVERYTHING, ignores tenant filters entirely.
//   • ADMIN + org  → sees every user, lead, and passkey whose owning
//     tutor shares their `org` (their "team"). Introduced 2026-07 so a
//     brand admin (e.g. Anak Bijak) can see all Anak Bijak tutors'
//     records without needing the SUPERADMIN account.
//   • ADMIN with NO org → falls back to single-tutor scope (their own
//     records only). Matches pre-multi-org behaviour so nothing breaks
//     for existing admin accounts whose `org` is still NULL.
//   • TUTOR → own records only. Never widened by org, even if set.
// ─────────────────────────────────────────────────────────────────────────

import { prisma } from "@/lib/db";
import type { SessionPayload } from "@/lib/auth";

/**
 * Set of user IDs whose records a given session may see, in addition to
 * their own. Used to build Prisma `where` clauses that fan out from a
 * single tutorId to a whole team.
 *
 * SUPERADMIN → null (meaning "no filter — see everything").
 * ADMIN + org → all active user ids sharing that org (includes self).
 * All other cases → just { self }.
 */
export async function tenantVisibleTutorIds(
  session: SessionPayload,
): Promise<Set<string> | null> {
  if (session.role === "SUPERADMIN") return null;
  if (session.role === "ADMIN" && session.org) {
    const teammates = await prisma.user.findMany({
      where: { org: session.org, active: true },
      select: { id: true },
    });
    const set = new Set(teammates.map((t) => t.id));
    set.add(session.uid); // safety — session's own id in case they somehow lost their org row
    return set;
  }
  return new Set([session.uid]);
}

/**
 * Prisma `where` fragment that scopes a query on a `tutorId` column to
 * everything the session may see. Compose into any findMany that has a
 * tutorId (Lead, Passkey).
 *
 *   const items = await prisma.lead.findMany({
 *     where: { ...(await tenantWhereTutor(session)), status: "COMPLETED" },
 *     ...
 *   });
 */
export async function tenantWhereTutor(
  session: SessionPayload,
): Promise<{ tutorId?: { in: string[] } }> {
  const set = await tenantVisibleTutorIds(session);
  if (set === null) return {}; // SUPERADMIN — no filter
  return { tutorId: { in: Array.from(set) } };
}

/**
 * Prisma `where` fragment that scopes a User-table query to everything
 * the session may see. Used by the /admin/users list.
 *
 *   const users = await prisma.user.findMany({
 *     where: { ...tenantWhereUser(session) },
 *   });
 */
export function tenantWhereUser(
  session: SessionPayload,
): { id?: string; org?: string } {
  if (session.role === "SUPERADMIN") return {};
  if (session.role === "ADMIN" && session.org) return { org: session.org };
  return { id: session.uid };
}

/**
 * Single-resource authz check for detail routes. Returns true if `session`
 * may access a resource owned by tutor `resourceTutorId` (optionally with
 * their org already fetched).
 *
 *   const lead = await prisma.lead.findUnique({
 *     where: { id },
 *     include: { tutor: { select: { org: true } } },
 *   });
 *   if (!(await canAccessTutorResource(session, lead.tutorId, lead.tutor?.org)))
 *     return 403;
 */
export async function canAccessTutorResource(
  session: SessionPayload,
  resourceTutorId: string | null | undefined,
  resourceTutorOrg?: string | null,
): Promise<boolean> {
  if (session.role === "SUPERADMIN") return true;
  if (!resourceTutorId) return false;
  if (resourceTutorId === session.uid) return true;
  if (session.role === "ADMIN" && session.org) {
    // Prefer caller-supplied org (saves a query). Fall back to a lookup.
    if (resourceTutorOrg === undefined) {
      const owner = await prisma.user.findUnique({
        where: { id: resourceTutorId },
        select: { org: true },
      });
      return !!owner && owner.org === session.org;
    }
    return resourceTutorOrg === session.org;
  }
  return false;
}
