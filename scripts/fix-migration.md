# Guide : Nettoyer l'état des migrations après une erreur

Si une migration a échoué sur Render, Prisma bloque les nouvelles migrations. Voici comment résoudre le problème.

## Option 1 : Via l'interface Render (Recommandé)

1. Allez sur votre dashboard Render
2. Sélectionnez votre base de données PostgreSQL
3. Cliquez sur "Connect" ou "Open in Terminal"
4. Connectez-vous à la base de données avec psql
5. Exécutez les commandes SQL du fichier `scripts/fix-migration.sql`

## Option 2 : Via psql en local

Si vous avez accès à la DATABASE_URL de Render :

```bash
# Se connecter à la base de données Render
psql "postgresql://user:password@dpg-d4o4cgndiees7383edk0-a/menuisier_db"

# Exécuter le script
\i scripts/fix-migration.sql
```

Ou directement :

```bash
psql "postgresql://user:password@dpg-d4o4cgndiees7383edk0-a/menuisier_db" -f scripts/fix-migration.sql
```

## Option 3 : Via Prisma Studio (si accessible)

1. Définissez `DATABASE_URL` avec l'URL de Render
2. Lancez `npx prisma studio`
3. Allez dans la table `_prisma_migrations`
4. Supprimez manuellement la ligne de la migration échouée

## Commandes SQL à exécuter

```sql
-- Vérifier l'état actuel
SELECT * FROM "_prisma_migrations" ORDER BY "finished_at" DESC LIMIT 10;

-- Supprimer la migration échouée
DELETE FROM "_prisma_migrations" 
WHERE "migration_name" = '20250101000000_add_demo_data_table';

-- Si la table existe partiellement, la supprimer
DROP TABLE IF EXISTS "DemoData" CASCADE;
```

## Après le nettoyage

Une fois le nettoyage effectué, le prochain déploiement sur Render devrait :
1. Détecter que la migration n'est pas appliquée
2. L'appliquer correctement avec la version corrigée (TIMESTAMP au lieu de DATETIME)

## Option 4 : Utiliser Prisma Migrate Resolve (Recommandé si accessible)

Si vous avez accès à la ligne de commande avec la DATABASE_URL de Render :

```bash
# Définir la DATABASE_URL de Render
export DATABASE_URL="postgresql://user:password@dpg-d4o4cgndiees7383edk0-a/menuisier_db"

# Marquer la migration comme rollback (pour qu'elle soit réappliquée)
npm run db:resolve -- --rolled-back 20250101000000_add_demo_data_table

# Ou utiliser directement npx
npx prisma migrate resolve --rolled-back 20250101000000_add_demo_data_table
```

**Note** : Utilisez `--rolled-back` si vous voulez que la migration soit réappliquée avec la version corrigée. Utilisez `--applied` seulement si la migration a été partiellement appliquée et que vous voulez la marquer comme complète.

Puis relancez le déploiement sur Render.

