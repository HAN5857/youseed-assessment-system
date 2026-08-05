// ─────────────────────────────────────────────────────────────────────────
// Tenant-scoping helpers — single source of truth for "who can this user
// see". Every list/detail API in /admin should filter through these; that
// way widening tenancy (multi-org, sub-teams, etc.) only requires changing
// this file.
//
// Model (see the Organization table in prisma/schema.prisma):
//   • SUPERADMIN → sees EVERYTHING, ignores tenant filters entirely.
//   • ADMIN + orgId → sees every user, lead, and passkey whose owning tutor
//     shares their orgId (their "team").
//   • ADMIN with NO orgId → single-tutor scope (their own records only).
//   • TUTOR → own records only. Never widened by org.
//
// Sessions carry orgId (+ orgSlug for display); scoping matches on orgId.
// ─────────────────────────────────────────────────────────────────────────

import { prisma } from "@/lib/db";
import type { SessionPayload } from "@/lib/auth";

/**
 * Set of user IDs whose records a given session may see (their own +, for
 * an org-admin, all teammates). Returns null for SUPERADMIN meaning
 * "no filter — see everything".
 */
export async function tenantVisibleTutorIds(
  session: SessionPayload,
): Promise<Set<string> | null> {
  if (session.role === "SUPERADMIN") return null;
  if (session.role === "ADMIN" && session.orgId) {
    const teammates = await prisma.user.findMany({
      where: { orgId: session.orgId, active: true },
      select: { id: true },
    });
    const set = new Set(teammates.map((t) => t.id));
    set.add(session.uid);
    return set;
  }
  return new Set([session.uid]);
}

/**
 * Prisma `where` fragment scoping a query on a `tutorId` column to
 * everything the session may see. Compose into Lead / Passkey findMany.
 */
export async function tenantWhereTutor(
  session: SessionPayload,
): Promise<{ tutorId?: { in: string[] } }> {
  const set = await tenantVisibleTutorIds(session);
  if (set === null) return {};
  return { tutorId: { in: Array.from(set) } };
}

/**
 * Prisma `where` fragment scoping a User-table query to everyone the
 * session may see. Used by the /admin/users list.
 */
export function tenantWhereUser(
  session: SessionPayload,
): { id?: string; orgId?: string } {
  if (session.role === "SUPERADMIN") return {};
  if (session.role === "ADMIN" && session.orgId) return { orgId: session.orgId };
  return { id: session.uid };
}

/**
 * Single-resource authz for detail routes. True if `session` may access a
 * resource owned by tutor `resourceTutorId`. Pass the owner's orgId if you
 * already fetched it (saves a query); otherwise it's looked up.
 */
export async function canAccessTutorResource(
  session: SessionPayload,
  resourceTutorId: string | null | undefined,
  resourceTutorOrgId?: string | null,
): Promise<boolean> {
  if (session.role === "SUPERADMIN") return true;
  if (!resourceTutorId) return false;
  if (resourceTutorId === session.uid) return true;
  if (session.role === "ADMIN" && session.orgId) {
    if (resourceTutorOrgId === undefined) {
      const owner = await prisma.user.findUnique({
        where: { id: resourceTutorId },
        select: { orgId: true },
      });
      return !!owner && owner.orgId === session.orgId;
    }
    return resourceTutorOrgId === session.orgId;
  }
  return false;
}

/** Can this session manage users (create tutors, reset passwords)? */
export function canManageUsers(session: SessionPayload): boolean {
  return session.role === "SUPERADMIN" || (session.role === "ADMIN" && !!session.orgId);
}
