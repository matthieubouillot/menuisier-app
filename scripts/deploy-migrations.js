#!/usr/bin/env node

/**
 * Script wrapper pour prisma migrate deploy qui nettoie automatiquement
 * les migrations échouées avant d'appliquer les migrations
 * 
 * Usage: node scripts/deploy-migrations.js
 */

const { execSync } = require("child_process");
const { Pool } = require("pg");
const path = require("path");

// Essayer de charger dotenv si disponible (pour développement local)
try {
  require("dotenv").config();
} catch (e) {
  // dotenv n'est pas nécessaire en production
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
    // Timeout plus court pour éviter de bloquer
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
    // Ne pas faire échouer le processus si le nettoyage échoue
    console.log(`⚠️  Could not clean failed migrations: ${error.message}`);
    console.log("⚠️  Continuing with migration deployment anyway...");
    try {
      await pool.end();
    } catch (e) {
      // Ignorer les erreurs de fermeture
    }
  }
}

async function deployMigrations() {
  console.log("🚀 Starting migration deployment...\n");

  // 1. Nettoyer les migrations échouées
  await cleanupFailedMigrations();

  // 2. Appliquer les migrations
  console.log("\n📦 Deploying migrations...");
  try {
    execSync("npx prisma migrate deploy", {
      stdio: "inherit",
      cwd: path.resolve(__dirname, ".."),
      env: process.env,
    });
    console.log("\n✅ Migrations deployed successfully!");
  } catch (error) {
    console.error("\n❌ Migration deployment failed");
    process.exit(1);
  }
}

deployMigrations().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});

