#!/usr/bin/env node

/**
 * Script de build qui nettoie les migrations échouées avant d'appliquer les migrations
 * Usage: node scripts/build-with-migrations.js
 * 
 * Ce script est conçu pour être utilisé dans le processus de build sur Render
 * Il nettoie automatiquement les migrations échouées avant d'appliquer les nouvelles migrations
 */

const { execSync } = require("child_process");
const path = require("path");

// Essayer de charger dotenv si disponible (pour développement local)
try {
  require("dotenv").config();
} catch (e) {
  // dotenv n'est pas nécessaire en production (variables d'environnement déjà disponibles)
}

function runCommand(command, description) {
  console.log(`\n📦 ${description}...`);
  try {
    execSync(command, { stdio: "inherit", cwd: path.resolve(__dirname, "..") });
    console.log(`✅ ${description} completed successfully`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

async function main() {
  console.log("🚀 Starting build process with migration cleanup...\n");

  // 1. Générer le client Prisma
  runCommand("npm run db:generate", "Generating Prisma Client");

  // 2. Nettoyer les migrations échouées (si nécessaire)
  console.log("\n🔍 Checking for failed migrations...");
  try {
    execSync("node scripts/reset-failed-migrations.js", {
      stdio: "inherit",
      cwd: path.resolve(__dirname, ".."),
    });
  } catch (error) {
    // Si le script échoue, ce n'est pas critique (peut-être que la DB n'existe pas encore)
    console.log("⚠️  Migration cleanup script had issues (this is OK if DB is new)");
  }

  // 3. Appliquer les migrations
  runCommand("npm run db:deploy", "Deploying database migrations");

  // 4. Build Next.js
  runCommand("npm run build", "Building Next.js application");

  console.log("\n✅ Build completed successfully!");
}

main().catch((error) => {
  console.error("❌ Build failed:", error);
  process.exit(1);
});

