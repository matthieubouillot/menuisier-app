#!/usr/bin/env node

/**
 * Script pour nettoyer les migrations Prisma échouées
 * Usage: node scripts/reset-failed-migrations.js
 * 
 * Ce script supprime les entrées de migrations échouées de la table _prisma_migrations
 * pour permettre à Prisma de réappliquer les migrations proprement.
 */

// Essayer de charger dotenv si disponible (pour développement local)
try {
  require("dotenv").config();
} catch (e) {
  // dotenv n'est pas nécessaire en production (variables d'environnement déjà disponibles)
}

const { Pool } = require("pg");

async function resetFailedMigrations() {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    console.error("❌ DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  if (!dbUrl.startsWith("postgresql://") && !dbUrl.startsWith("postgres://")) {
    console.error("❌ This script only works with PostgreSQL databases");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: dbUrl,
  });

  try {
    console.log("🔍 Checking for failed migrations...");

    // Vérifier si la table _prisma_migrations existe
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '_prisma_migrations'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log("✅ No _prisma_migrations table found. Database is clean.");
      await pool.end();
      return;
    }

    // Compter les migrations échouées
    const failedCount = await pool.query(`
      SELECT COUNT(*) as count
      FROM "_prisma_migrations"
      WHERE "finished_at" IS NULL 
         OR "rolled_back_at" IS NOT NULL;
    `);

    const count = parseInt(failedCount.rows[0].count, 10);

    if (count === 0) {
      console.log("✅ No failed migrations found. Database is in a clean state.");
      await pool.end();
      return;
    }

    console.log(`⚠️  Found ${count} failed migration(s).`);

    // Afficher les détails des migrations échouées
    const failedMigrations = await pool.query(`
      SELECT "migration_name", "started_at", "finished_at", "rolled_back_at"
      FROM "_prisma_migrations"
      WHERE "finished_at" IS NULL 
         OR "rolled_back_at" IS NOT NULL
      ORDER BY "started_at" DESC;
    `);

    if (failedMigrations.rows.length > 0) {
      console.log("\n📋 Failed migrations:");
      failedMigrations.rows.forEach((migration) => {
        console.log(`   - ${migration.migration_name} (started: ${migration.started_at})`);
      });
    }

    console.log("\n🧹 Cleaning up...");

    // Supprimer les migrations échouées
    const result = await pool.query(`
      DELETE FROM "_prisma_migrations"
      WHERE "finished_at" IS NULL 
         OR "rolled_back_at" IS NOT NULL;
    `);

    console.log(`✅ Removed ${result.rowCount} failed migration(s).`);
    console.log("✅ You can now run 'prisma migrate deploy' to apply migrations.");

    await pool.end();
  } catch (error) {
    console.error("❌ Error resetting failed migrations:", error.message);
    await pool.end();
    process.exit(1);
  }
}

resetFailedMigrations();

