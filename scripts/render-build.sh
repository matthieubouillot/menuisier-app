#!/bin/bash
# Script de build pour Render qui nettoie les migrations échouées avant de builder

set -e

echo "🚀 Starting Render build process..."

# 1. Générer le client Prisma
echo "📦 Generating Prisma Client..."
npm run db:generate

# 2. Nettoyer les migrations échouées (ne fait pas échouer le build si ça échoue)
echo "🔍 Cleaning failed migrations..."
node scripts/reset-failed-migrations.js || echo "⚠️  Migration cleanup had issues (continuing...)"

# 3. Appliquer les migrations
echo "📦 Deploying migrations..."
npm run db:deploy || {
  echo "❌ Migration deployment failed, trying to clean and retry..."
  node scripts/reset-failed-migrations.js || true
  npx prisma migrate deploy
}

# 4. Builder l'application
echo "🏗️  Building Next.js application..."
npm run build

echo "✅ Build completed successfully!"

