// ─────────────────────────────────────────────────────────────────────────
// One-off migration: adds the `org` column (nullable TEXT) + org index
// to the User table on prod. Non-destructive:
//   • ADD COLUMN IF NOT EXISTS  → safe on repeated runs
//   • CREATE INDEX IF NOT EXISTS → same
//   • existing rows: org stays NULL, which means "no team" (falls back to
//     single-tutor scope in src/lib/tenant-scope.ts). Zero behaviour
//     change for existing tutors + admins.
//
// Run:
//   DATABASE_URL="…" npx tsx prisma/migrate-prod-add-user-org.ts
// ─────────────────────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Migration: adding User.org column + index on prod…\n");

  // Add column (Postgres). Nullable — no default needed.
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "org" TEXT`,
  );
  console.log("  ✎ ALTER TABLE User ADD COLUMN org TEXT (nullable) — ok.");

  // Add the index Prisma expects on the field (matches @@index([org])).
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "User_org_idx" ON "User"("org")`,
  );
  console.log("  ✎ CREATE INDEX User_org_idx — ok.");

  const [{ count: total }] = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT COUNT(*)::bigint AS count FROM "User"`,
  );
  const [{ count: withOrg }] = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT COUNT(*)::bigint AS count FROM "User" WHERE "org" IS NOT NULL`,
  );
  console.log(`\nCurrent state: ${withOrg}/${total} users have an org set (rest = NULL = solo scope).`);

  console.log("\n✅ done. Schema is now compatible with the multi-org tenant-scope helpers.");
}

main()
  .catch((e) => { console.error("\n❌ Failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
