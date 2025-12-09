-- Script pour nettoyer l'état des migrations après une erreur
-- À exécuter directement dans la base de données PostgreSQL sur Render

-- 1. Vérifier l'état actuel des migrations
SELECT * FROM "_prisma_migrations" ORDER BY "finished_at" DESC LIMIT 10;

-- 2. Supprimer l'entrée de la migration échouée (si elle existe)
-- Remplacez '20250101000000_add_demo_data_table' par le nom exact de votre migration
DELETE FROM "_prisma_migrations" 
WHERE "migration_name" = '20250101000000_add_demo_data_table';

-- 3. Si la table DemoData existe déjà (créée partiellement), la supprimer d'abord
DROP TABLE IF EXISTS "DemoData" CASCADE;

-- 4. Vérifier que la migration a bien été supprimée
SELECT * FROM "_prisma_migrations" WHERE "migration_name" = '20250101000000_add_demo_data_table';

