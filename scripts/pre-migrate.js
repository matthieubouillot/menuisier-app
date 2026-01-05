#!/usr/bin/env node

/**
 * Script qui nettoie automatiquement les migrations échouées
 * S'exécute avant prisma migrate deploy pour éviter l'erreur P3009
 * 
 * Ce script peut être appelé dans le Build Command de Render :
 * node scripts/pre-migrate.js && prisma migrate deploy && npm run build
 */

// Essayer de charger dotenv si disponible
try {
  require("dotenv").config();
} catch (e) {
  // dotenv n'est pas nécessaire en production
}

// Essayer de charger pg, mais ne pas faire échouer si pas disponible
let Pool;
try {
  Pool = require("pg").Pool;
} catch (e) {
  console.log("⚠️  Module 'pg' not found. Skipping migration cleanup.");
  console.log("⚠️  This is OK if dependencies are not installed yet.");
  process.exit(0);
}

async function cleanupFailedMigrations() {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    console.log("⚠️  DATABASE_URL not set, skipping cleanup");
    return;
  }

  if (!dbUrl.startsWith("postgresql://") && !dbUrl.startsWith("postgres://")) {
    console.log("⚠️  Not a PostgreSQL database, skipping cleanup");
    return;
  }

  const pool = new Pool({
    connectionString: dbUrl,
    connectionTimeoutMillis: 5000,
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

    console.log(`⚠️  Found ${count} failed migration(s). Cleaning up...`);

    // Supprimer les migrations échouées
    const result = await pool.query(`
      DELETE FROM "_prisma_migrations"
      WHERE "finished_at" IS NULL 
         OR "rolled_back_at" IS NOT NULL;
    `);

    console.log(`✅ Removed ${result.rowCount} failed migration(s).`);
    await pool.end();
  } catch (error) {
    // Ne pas faire échouer le processus
    console.log(`⚠️  Could not clean failed migrations: ${error.message}`);
    console.log("⚠️  Continuing anyway...");
    try {
      await pool.end();
    } catch (e) {
      // Ignorer
    }
  }
}

// Exécuter le nettoyage
cleanupFailedMigrations().catch((error) => {
  console.log(`⚠️  Error during cleanup: ${error.message}`);
  console.log("⚠️  Continuing anyway...");
  // Ne pas faire échouer le processus
});

