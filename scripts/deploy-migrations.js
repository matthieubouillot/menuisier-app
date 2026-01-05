#!/usr/bin/env node

/**
 * Script wrapper pour prisma migrate deploy qui nettoie automatiquement
 * les migrations échouées avant d'appliquer les migrations
 * 
 * Usage: node scripts/deploy-migrations.js
 */

const { execSync } = require("child_process");
const path = require("path");

// Essayer de charger dotenv si disponible (pour développement local)
try {
  require("dotenv").config();
} catch (e) {
  // dotenv n'est pas nécessaire en production
}

async function deployMigrations() {
  console.log("🚀 Starting migration deployment...\n");

  // 1. Nettoyer les migrations échouées (ignore les erreurs si la DB n'existe pas encore)
  console.log("🔍 Checking for failed migrations...");
  try {
    execSync("node scripts/reset-failed-migrations.js", {
      stdio: "inherit",
      cwd: path.resolve(__dirname, ".."),
    });
  } catch (error) {
    // Si le script échoue, continuer quand même (peut-être que la DB n'existe pas encore)
    console.log("⚠️  Could not check for failed migrations (this is OK for new databases)");
  }

  // 2. Appliquer les migrations
  console.log("\n📦 Deploying migrations...");
  try {
    execSync("npx prisma migrate deploy", {
      stdio: "inherit",
      cwd: path.resolve(__dirname, ".."),
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

