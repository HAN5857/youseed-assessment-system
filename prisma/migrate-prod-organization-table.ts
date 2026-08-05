// ─────────────────────────────────────────────────────────────────────────
// Migration: promote the org string field to a proper Organization table.
//
// Steps (all idempotent / guarded):
//   1. CREATE TABLE "Organization" (if not exists)
//   2. ALTER TABLE "User" ADD COLUMN "orgId" (if not exists) + FK + index
//   3. Backfill: for any distinct non-null User.org string, create an
//      Organization row and point orgId at it. (Prod currently has 0 such
//      rows, so this is a no-op — but it's here so the migration is correct
//      even if orgs were assigned as strings in the meantime.)
//   4. DROP the old "User.org" column + its index (safe: data migrated).
//
// Run:
//   DATABASE_URL="…" npx tsx prisma/migrate-prod-organization-table.ts
// ─────────────────────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function columnExists(table: string, column: string): Promise<boolean> {
  const rows = await prisma.$queryRawUnsafe<{ n: bigint }[]>(
    `SELECT COUNT(*)::bigint AS n FROM information_schema.columns WHERE table_name = $1 AND column_name = $2`,
    table, column,
  );
  return Number(rows[0]?.n ?? 0) > 0;
}

async function main() {
  console.log("Migration: Organization table + User.orgId FK…\n");

  // 1. Organization table.
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Organization" (
      "id"            TEXT PRIMARY KEY,
      "slug"          TEXT NOT NULL UNIQUE,
      "name"          TEXT NOT NULL,
      "active"        BOOLEAN NOT NULL DEFAULT true,
      "logoUrl"       TEXT,
      "brandColor"    TEXT,
      "passkeyPrefix" TEXT,
      "allowedTests"  TEXT,
      "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("  ✎ CREATE TABLE Organization — ok.");

  // 2. User.orgId column + FK + index.
  await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "orgId" TEXT`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "User_orgId_idx" ON "User"("orgId")`);
  // FK constraint — add only if missing (Postgres has no IF NOT EXISTS for constraints).
  const fk = await prisma.$queryRawUnsafe<{ n: bigint }[]>(
    `SELECT COUNT(*)::bigint AS n FROM information_schema.table_constraints WHERE constraint_name = 'User_orgId_fkey'`,
  );
  if (Number(fk[0]?.n ?? 0) === 0) {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User"
      ADD CONSTRAINT "User_orgId_fkey"
      FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE
    `);
    console.log("  ✎ ADD COLUMN User.orgId + FK + index — ok.");
  } else {
    console.log("  ✎ User.orgId column/index present, FK already exists — ok.");
  }

  // 3. Backfill from the old string column, if it still exists.
  if (await columnExists("User", "org")) {
    const legacy = await prisma.$queryRawUnsafe<{ org: string }[]>(
      `SELECT DISTINCT "org" FROM "User" WHERE "org" IS NOT NULL AND "org" <> ''`,
    );
    if (legacy.length > 0) {
      console.log(`  ↪ Backfilling ${legacy.length} legacy org string(s)…`);
      for (const { org } of legacy) {
        // Create an Organization row for this slug if absent.
        const id = `org_${org}`.slice(0, 60);
        await prisma.$executeRawUnsafe(
          `INSERT INTO "Organization" ("id","slug","name","active") VALUES ($1,$2,$3,true)
           ON CONFLICT ("slug") DO NOTHING`,
          id, org, org,
        );
        // Point every user with that string at the row.
        await prisma.$executeRawUnsafe(
          `UPDATE "User" SET "orgId" = (SELECT "id" FROM "Organization" WHERE "slug" = $1) WHERE "org" = $1`,
          org,
        );
        console.log(`     • ${org} → Organization row + users linked`);
      }
    } else {
      console.log("  ↪ No legacy org strings to backfill (all NULL).");
    }

    // 4. Drop the old column + its index.
    await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "User_org_idx"`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" DROP COLUMN IF EXISTS "org"`);
    console.log("  ✎ Dropped legacy User.org column + index — ok.");
  } else {
    console.log("  ↪ Legacy User.org column already dropped — nothing to do.");
  }

  const [{ n: orgCount }] = await prisma.$queryRawUnsafe<{ n: bigint }[]>(`SELECT COUNT(*)::bigint AS n FROM "Organization"`);
  console.log(`\n✅ done. Organization table live (${orgCount} org rows). User.orgId ready.`);
}

main()
  .catch((e) => { console.error("\n❌ Failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
