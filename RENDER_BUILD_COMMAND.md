# 🔧 Configuration du Build Command sur Render

## Problème

Vous avez une erreur P3009 lors du déploiement sur Render car il y a des migrations échouées dans votre base de données.

## Solution : Modifier le Build Command

Dans les paramètres de votre service Render (via l'interface web), modifiez le **Build Command** pour utiliser :

```bash
npm install && node scripts/pre-migrate.js && npx prisma migrate deploy && npm run build
```

**Important** : Assurez-vous que `npm install` est inclus pour installer les dépendances avant d'exécuter les scripts.

Cette commande :
1. Nettoie automatiquement les migrations échouées (`pre-migrate.js`)
2. Applique les migrations (`prisma migrate deploy`)
3. Build l'application (`npm run build`)

## Comment modifier le Build Command sur Render

1. Connectez-vous à votre compte Render
2. Allez dans votre service (Web Service)
3. Cliquez sur **Settings** (Paramètres)
4. Trouvez la section **Build Command**
5. Remplacez la commande par :
   ```bash
   node scripts/pre-migrate.js && npx prisma migrate deploy && npm run build
   ```
6. Cliquez sur **Save Changes**
7. Redémarrez le service ou déclenchez un nouveau build

## Alternative

Si vous préférez utiliser le script de build complet :

```bash
npm run build:render
```

Mais vous devrez peut-être modifier le Build Command pour :
```bash
npm run build:render
```

## Note

Le script `pre-migrate.js` nettoie automatiquement les migrations échouées sans faire échouer le build si la base de données n'est pas accessible. Il est sûr à utiliser en production.

