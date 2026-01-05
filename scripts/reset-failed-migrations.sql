-- Script pour nettoyer les migrations échouées dans Prisma
-- À utiliser quand une nouvelle base de données a un état de migration incohérent

-- Supprimer les migrations échouées de la table _prisma_migrations
DELETE FROM "_prisma_migrations" 
WHERE "finished_at" IS NULL 
   OR "rolled_back_at" IS NOT NULL;

-- Alternative: Si vous voulez réinitialiser complètement toutes les migrations
-- (ATTENTION: À utiliser uniquement sur une base de données vide ou de développement)
-- TRUNCATE TABLE "_prisma_migrations";

