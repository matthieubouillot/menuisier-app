# Guide de démarrage rapide

## 🚀 Installation et lancement

1. **Installer les dépendances** (déjà fait)
```bash
npm install
```

2. **Configurer l'environnement**
```bash
# Le fichier .env existe déjà avec DATABASE_URL
# Ajoutez NEXTAUTH_SECRET si nécessaire
echo 'NEXTAUTH_SECRET="votre-secret-aleatoire-ici"' >> .env
```

3. **Générer le client Prisma** (déjà fait)
```bash
npx prisma generate
```

4. **Les migrations sont déjà appliquées**
La base de données SQLite est créée dans `prisma/dev.db`

5. **Lancer l'application**
```bash
npm run dev
```

6. **Accéder à l'application**
Ouvrez [http://localhost:3000](http://localhost:3000)

## 📝 Première utilisation

1. **Créer un compte**
   - Allez sur `/register`
   - Remplissez le formulaire
   - Connectez-vous

2. **Tester les fonctionnalités**
   - **Tableau de bord** : `/dashboard` - Vue d'ensemble
   - **Devis** : `/devis` - Créer et gérer vos devis
   - **Matériaux** : `/materiaux` - Calculer les besoins en matériaux
   - **Calendrier** : `/calendrier` - Gérer vos chantiers et rendez-vous

## 🎯 Fonctionnalités disponibles

### ✅ Gestion Devis/Factures
- Création de devis avec lignes détaillées
- Templates (à venir - structure prête)
- Conversion devis → facture
- Suivi des statuts et paiements

### ✅ Calculateur de Matériaux
- Calculs automatiques pour :
  - Cuisine
  - Armoire
  - Étagère
  - Table
- Estimation des coûts
- Sauvegarde des calculs

### ✅ Calendrier
- Gestion des événements
- Association avec projets
- Vue du jour et à venir

### ✅ Tableau de bord
- Statistiques financières
- Vue d'ensemble de l'activité
- Derniers devis et factures

## 🔧 Commandes utiles

```bash
# Développement
npm run dev

# Build production
npm run build
npm start

# Base de données
npm run db:generate    # Générer le client Prisma
npm run db:migrate     # Appliquer les migrations
npm run db:studio      # Ouvrir Prisma Studio (interface DB)
```

## 📁 Structure importante

- `app/` - Pages et routes Next.js
- `app/api/` - API routes (backend)
- `components/` - Composants React réutilisables
- `lib/` - Utilitaires et configurations
- `prisma/` - Schéma de base de données

## 🐛 Dépannage

**Erreur de connexion à la base de données**
- Vérifiez que `prisma/dev.db` existe
- Relancez `npx prisma migrate dev`

**Erreur d'authentification**
- Vérifiez que `NEXTAUTH_SECRET` est défini dans `.env`
- Redémarrez le serveur

**Erreurs TypeScript**
- Relancez `npx prisma generate`
- Vérifiez que tous les packages sont installés

## 📚 Prochaines étapes

L'application est prête pour la Phase 1 (MVP). Les fonctionnalités suivantes peuvent être ajoutées :

- Visualiseur 3D
- Espace client
- Gestion des stocks
- Analytics avancés
- Intégrations externes

---

**L'application est prête à être utilisée ! 🎉**

