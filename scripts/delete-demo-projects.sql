-- Script pour supprimer les projets de démo en cours
-- À adapter selon vos besoins

-- Vérifier d'abord quels projets sont en cours pour cet utilisateur
-- Remplacez 'VOTRE_USER_ID' par votre ID utilisateur

-- Supprimer les événements liés aux projets en cours
DELETE FROM "CalendarEvent" 
WHERE "projectId" IN (
  SELECT id FROM "Project" 
  WHERE "userId" = 'VOTRE_USER_ID' 
  AND status = 'en_cours'
  AND name IN ('Cuisine moderne avec îlot', 'Armoire sur mesure chêne', 'Table à manger 8 personnes')
);

-- Supprimer les factures liées
DELETE FROM "FactureItem" 
WHERE "factureId" IN (
  SELECT id FROM "Facture" 
  WHERE "projectId" IN (
    SELECT id FROM "Project" 
    WHERE "userId" = 'VOTRE_USER_ID' 
    AND status = 'en_cours'
    AND name IN ('Cuisine moderne avec îlot', 'Armoire sur mesure chêne', 'Table à manger 8 personnes')
  )
);

DELETE FROM "Facture" 
WHERE "projectId" IN (
  SELECT id FROM "Project" 
  WHERE "userId" = 'VOTRE_USER_ID' 
  AND status = 'en_cours'
  AND name IN ('Cuisine moderne avec îlot', 'Armoire sur mesure chêne', 'Table à manger 8 personnes')
);

-- Supprimer les devis liés
DELETE FROM "DevisItem" 
WHERE "devisId" IN (
  SELECT id FROM "Devis" 
  WHERE "projectId" IN (
    SELECT id FROM "Project" 
    WHERE "userId" = 'VOTRE_USER_ID' 
    AND status = 'en_cours'
    AND name IN ('Cuisine moderne avec îlot', 'Armoire sur mesure chêne', 'Table à manger 8 personnes')
  )
);

DELETE FROM "Devis" 
WHERE "projectId" IN (
  SELECT id FROM "Project" 
  WHERE "userId" = 'VOTRE_USER_ID' 
  AND status = 'en_cours'
  AND name IN ('Cuisine moderne avec îlot', 'Armoire sur mesure chêne', 'Table à manger 8 personnes')
);

-- Supprimer les projets eux-mêmes
DELETE FROM "Project" 
WHERE "userId" = 'VOTRE_USER_ID' 
AND status = 'en_cours'
AND name IN ('Cuisine moderne avec îlot', 'Armoire sur mesure chêne', 'Table à manger 8 personnes');

-- Ou supprimer TOUS les projets en cours (plus agressif)
-- DELETE FROM "Project" WHERE "userId" = 'VOTRE_USER_ID' AND status = 'en_cours';
