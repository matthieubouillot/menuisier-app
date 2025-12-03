# 🚀 Guide Complet : Déploiement sur Render

## 📋 Prérequis

- ✅ Compte Render créé sur [render.com](https://render.com)
- ✅ Code poussé sur GitHub (dépôt `menuisier-app`)
- ✅ Migration PostgreSQL créée (étape 1 terminée)

---

## Étape 1 : Créer la Base de Données PostgreSQL

### 1.1 Accéder à Render

1. Connectez-vous sur [render.com](https://render.com)
2. Cliquez sur le bouton **"New +"** en haut à droite
3. Sélectionnez **"PostgreSQL"**

### 1.2 Configurer la Base de Données

Remplissez le formulaire :

- **Name** : `menuisier-db`
- **Database** : `menuisier`
- **User** : `menuisier`
- **Region** : Choisissez la région la plus proche (ex: `Frankfurt` pour l'Europe)
- **PostgreSQL Version** : `Latest` (ou la version recommandée)
- **Plan** :
  - Pour tester : `Free` (gratuit, mais limité à 90 jours)
  - Pour production : `Starter` ($7/mois) ou supérieur

### 1.3 Créer et Noter la Connection String

1. Cliquez sur **"Create Database"**
2. Attendez 2-3 minutes que la base soit créée
3. Une fois créée, allez dans les **"Connections"** de votre base de données
4. **Copiez la "Internal Database URL"** (vous en aurez besoin plus tard)

   Elle ressemble à :

   ```
   postgresql://menuisier:password@dpg-xxxxx-a.frankfurt-postgres.render.com/menuisier
   ```

⚠️ **Important** : Gardez cette URL secrète ! Ne la partagez jamais publiquement.

---

## Étape 2 : Créer le Service Web

### 2.1 Créer un Nouveau Service Web

1. Dans votre dashboard Render, cliquez sur **"New +"**
2. Sélectionnez **"Web Service"**

### 2.2 Connecter votre Dépôt GitHub

1. Si c'est la première fois :
   - Cliquez sur **"Connect account"** ou **"Connect GitHub"**
   - Autorisez Render à accéder à vos dépôts GitHub
   - Sélectionnez le dépôt `menuisier-app`
2. Si vous avez déjà connecté GitHub :
   - Sélectionnez le dépôt `menuisier-app` dans la liste

### 2.3 Configurer le Service

Remplissez les champs suivants :

#### Informations de base :

- **Name** : `menuisier-app`
- **Region** : Même région que votre base de données (ex: `Frankfurt`)
- **Branch** : `main` (ou `master` selon votre dépôt)
- **Root Directory** : Laissez vide (racine du projet)
- **Runtime** : `Node`
- **Build Command** :
  ```
  npm install && npx prisma generate && npx prisma migrate deploy && npm run build
  ```
- **Start Command** :
  ```
  npm start
  ```
- **Plan** :
  - Pour tester : `Free` (gratuit, mais se met en veille après 15 min d'inactivité)
  - Pour production : `Starter` ($7/mois) ou supérieur

⚠️ **Ne cliquez pas encore sur "Create Web Service"** ! On doit d'abord configurer les variables d'environnement.

---

## Étape 3 : Configurer les Variables d'Environnement

### 3.1 Avant de créer le service

Dans le formulaire de création du service web, il y a une section **"Environment Variables"**. Cliquez sur **"Add Environment Variable"** pour chaque variable ci-dessous.

### 3.2 Variables Obligatoires

Ajoutez ces variables **une par une** :

#### 1. `NODE_ENV`

- **Key** : `NODE_ENV`
- **Value** : `production`

#### 2. `DATABASE_URL`

- **Key** : `DATABASE_URL`
- **Value** : Collez la **Internal Database URL** que vous avez copiée à l'étape 1.3
  ```
  postgresql://menuisier:password@dpg-xxxxx-a.frankfurt-postgres.render.com/menuisier
  ```

#### 3. `NEXTAUTH_SECRET`

- **Key** : `NEXTAUTH_SECRET`
- **Value** : Générez une clé secrète aléatoire

  **Pour générer la clé** :

  **Option A - En ligne de commande** :

  ```bash
  openssl rand -base64 32
  ```

  **Option B - En ligne** :
  Allez sur https://generate-secret.vercel.app/32

  **Option C - Node.js** :

  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  ```

  Copiez le résultat et collez-le comme valeur.

#### 4. `NEXTAUTH_URL`

- **Key** : `NEXTAUTH_URL`
- **Value** : `https://menuisier-app.onrender.com`

  ⚠️ **Note** : Remplacez `menuisier-app` par le nom exact que vous avez donné à votre service web à l'étape 2.3. Render génère l'URL automatiquement, vous pouvez la modifier après la création du service.

### 3.3 Variables Optionnelles (OAuth)

Si vous voulez activer la connexion Google/GitHub :

#### Google OAuth

- **Key** : `GOOGLE_CLIENT_ID`
- **Value** : Votre Google Client ID

- **Key** : `GOOGLE_CLIENT_SECRET`
- **Value** : Votre Google Client Secret

⚠️ **Important** : Dans Google Cloud Console, ajoutez cette URL de redirection :

```
https://menuisier-app.onrender.com/api/auth/callback/google
```

#### GitHub OAuth

- **Key** : `GITHUB_CLIENT_ID`
- **Value** : Votre GitHub Client ID

- **Key** : `GITHUB_CLIENT_SECRET`
- **Value** : Votre GitHub Client Secret

⚠️ **Important** : Dans GitHub OAuth App settings, ajoutez cette URL de redirection :

```
https://menuisier-app.onrender.com/api/auth/callback/github
```

### 3.4 Variables Optionnelles (Email)

Si vous voulez envoyer des emails :

- **Key** : `SMTP_HOST`
- **Value** : `smtp.gmail.com` (ou votre serveur SMTP)

- **Key** : `SMTP_PORT`
- **Value** : `587`

- **Key** : `SMTP_USER`
- **Value** : Votre adresse email

- **Key** : `SMTP_PASSWORD`
- **Value** : Votre mot de passe d'application (pour Gmail, créez un "App Password")

- **Key** : `EMAIL_FROM`
- **Value** : Votre adresse email (ex: `votre-email@gmail.com`)

---

## Étape 4 : Créer et Déployer

### 4.1 Créer le Service

1. Vérifiez que toutes les variables d'environnement sont ajoutées
2. Cliquez sur **"Create Web Service"**
3. Render va maintenant :
   - Cloner votre dépôt
   - Installer les dépendances (`npm install`)
   - Générer le client Prisma (`npx prisma generate`)
   - **Appliquer les migrations** (`npx prisma migrate deploy`) ✅
   - Builder l'application (`npm run build`)
   - Démarrer le service (`npm start`)

### 4.2 Suivre le Déploiement

1. Vous verrez les **logs de build** en temps réel
2. Le processus prend **5-10 minutes** la première fois
3. Surveillez les logs pour détecter d'éventuelles erreurs

### 4.3 Vérifier le Déploiement

Une fois le build terminé :

1. Votre application sera disponible sur : `https://menuisier-app.onrender.com`
2. Testez l'application :
   - Visitez l'URL
   - Créez un compte sur `/register`
   - Connectez-vous

---

## Étape 5 : Mettre à Jour NEXTAUTH_URL (si nécessaire)

### 5.1 Vérifier l'URL Réelle

1. Une fois le service créé, Render vous donnera l'URL exacte
2. Elle sera du type : `https://menuisier-app-xxxx.onrender.com`
3. Notez cette URL exacte

### 5.2 Mettre à Jour la Variable

1. Allez dans votre service web sur Render
2. Cliquez sur **"Environment"** dans le menu de gauche
3. Trouvez la variable `NEXTAUTH_URL`
4. Cliquez sur **"Edit"** (icône crayon)
5. Mettez à jour avec l'URL exacte : `https://votre-url-exacte.onrender.com`
6. Cliquez sur **"Save Changes"**
7. Render redéploiera automatiquement

---

## 🔧 Configuration Post-Déploiement

### Créer votre Compte Administrateur

1. Visitez : `https://votre-app.onrender.com/register`
2. Créez votre premier compte
3. Connectez-vous

### Générer des Données de Démo (Optionnel)

1. Connectez-vous
2. Allez sur le dashboard
3. Cliquez sur **"Générer des données de démonstration"**

---

## 🐛 Dépannage

### Erreur : "Database connection failed"

**Solution** :

1. Vérifiez que `DATABASE_URL` est correct
2. Vérifiez que vous utilisez la **Internal Database URL** (pas l'externe)
3. Vérifiez que la base de données est bien créée et active

### Erreur : "Prisma Client not generated"

**Solution** :

1. Vérifiez que `npx prisma generate` est dans le build command
2. Regardez les logs de build pour voir l'erreur exacte

### Erreur : "Migration failed"

**Solution** :

1. Vérifiez que la migration existe dans `prisma/migrations/`
2. Vérifiez les logs pour voir quelle migration échoue
3. Assurez-vous que `npx prisma migrate deploy` est dans le build command

### Erreur : "NextAuth secret missing"

**Solution** :

1. Vérifiez que `NEXTAUTH_SECRET` est défini
2. Vérifiez que la valeur n'est pas vide
3. Régénérez une nouvelle clé si nécessaire

### L'application redémarre en boucle

**Solution** :

1. Vérifiez les logs dans Render
2. Vérifiez que toutes les variables d'environnement sont définies
3. Vérifiez que `NEXTAUTH_URL` correspond à l'URL réelle de votre service

### L'application se met en veille (plan gratuit)

**Solution** :

- C'est normal avec le plan gratuit
- Le premier démarrage après veille prend 30-60 secondes
- Pour éviter cela, passez au plan payant

---

## 📝 Checklist de Déploiement

Cochez chaque étape au fur et à mesure :

- [ ] Compte Render créé
- [ ] Base de données PostgreSQL créée
- [ ] Connection String copiée
- [ ] Service Web créé
- [ ] Dépôt GitHub connecté
- [ ] Build Command configuré
- [ ] Start Command configuré
- [ ] Variable `NODE_ENV` ajoutée
- [ ] Variable `DATABASE_URL` ajoutée
- [ ] Variable `NEXTAUTH_SECRET` générée et ajoutée
- [ ] Variable `NEXTAUTH_URL` ajoutée
- [ ] Variables OAuth ajoutées (si nécessaire)
- [ ] Variables Email ajoutées (si nécessaire)
- [ ] Service créé et déployé
- [ ] Build réussi
- [ ] Application accessible
- [ ] Compte administrateur créé
- [ ] `NEXTAUTH_URL` mis à jour avec l'URL réelle

---

## 🎉 Félicitations !

Votre application est maintenant déployée sur Render !

### Prochaines Étapes

1. **Sauvegardes** : Configurez des sauvegardes automatiques de votre base de données
2. **Monitoring** : Surveillez les logs et les performances
3. **Domain personnalisé** : Ajoutez votre propre domaine (optionnel)
4. **Mises à jour** : Chaque push sur `main` déclenchera un nouveau déploiement automatique

---

## 📚 Ressources

- [Documentation Render](https://render.com/docs)
- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Prisma](https://www.prisma.io/docs)

---

## 💡 Astuces

1. **Plan gratuit** : Parfait pour tester, mais pensez à passer au plan payant pour la production
2. **Logs** : Consultez régulièrement les logs pour détecter les problèmes
3. **Variables d'environnement** : Ne commitez jamais vos variables dans Git
4. **Mises à jour** : Les déploiements automatiques sont activés par défaut sur la branche `main`
