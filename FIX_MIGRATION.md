# 🔧 Résoudre l'erreur de migration sur Render

## Problème

La base de données PostgreSQL contient une trace de la migration SQLite échouée `20241126000000_add_legal_fields_and_client_tokens`. Prisma refuse d'appliquer de nouvelles migrations tant que cette erreur n'est pas résolue.

## Solution : Réinitialiser la base de données

Comme la base de données est probablement vide (premier déploiement), la solution la plus simple est de la réinitialiser.

### Option 1 : Via l'interface Render (Recommandé)

1. Allez sur votre dashboard Render
2. Cliquez sur votre base de données PostgreSQL (`menuisier-db`)
3. Allez dans l'onglet **"Data"** ou **"Info"**
4. Cliquez sur **"Reset Database"** ou **"Delete Database"** puis recréez-la
5. **Copiez la nouvelle Internal Database URL**
6. Mettez à jour la variable `DATABASE_URL` dans votre service web
7. Redéployez

### Option 2 : Via SQL (Si vous avez accès)

Si vous avez accès à la base de données via un client SQL ou psql :

```sql
-- Supprimer la table des migrations
DROP TABLE IF EXISTS "_prisma_migrations";

-- Ou supprimer toutes les tables
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

Puis redéployez.

### Option 3 : Marquer la migration comme résolue

Si vous préférez garder la base de données, vous pouvez marquer la migration échouée comme résolue :

1. Connectez-vous à votre base de données PostgreSQL
2. Exécutez :

```sql
-- Supprimer l'entrée de migration échouée
DELETE FROM "_prisma_migrations" 
WHERE migration_name = '20241126000000_add_legal_fields_and_client_tokens';
```

Puis redéployez.

## Solution Recommandée

**Option 1** est la plus simple et la plus sûre pour un premier déploiement.

