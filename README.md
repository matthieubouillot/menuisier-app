# Menuisier Pro - Application de Gestion Complète

Application web complète dédiée aux menuisiers pour optimiser leur gestion quotidienne et améliorer leur rentabilité.

## 🎯 Fonctionnalités MVP (Phase 1)

### ✅ 1. Gestion des Devis & Factures
- Création de devis avec templates personnalisables
- Calcul automatique des totaux HT/TTC
- Conversion devis → facture en 1 clic
- Suivi des statuts (brouillon, envoyé, accepté, refusé)
- Gestion des paiements (payé, impayé)
- Export et visualisation professionnels

### ✅ 2. Calculateur de Matériaux Intelligent
- Calcul automatique selon le type de projet :
  - Cuisine
  - Armoire
  - Étagère
  - Table
- Estimation des quantités nécessaires
- Calcul des coûts totaux
- Sauvegarde des calculs pour référence future

### ✅ 3. Calendrier de Chantiers
- Gestion des événements (chantiers, rendez-vous, maintenance)
- Vue d'ensemble des projets en cours
- Événements du jour et à venir
- Association avec les projets

### ✅ 4. Tableau de Bord Financier
- Vue d'ensemble du chiffre d'affaires
- Suivi des factures payées/impayées
- Statistiques des devis
- Projets en cours
- Derniers devis et factures

## 🚀 Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Étapes

1. **Cloner et installer les dépendances**
```bash
cd menuisier-app
npm install
```

2. **Configurer la base de données**
Le fichier `.env` est déjà configuré avec SQLite. La base de données sera créée automatiquement.

3. **Générer le client Prisma**
```bash
npx prisma generate
```

4. **Lancer les migrations**
```bash
npx prisma migrate dev
```

5. **Démarrer le serveur de développement**
```bash
npm run dev
```

6. **Ouvrir l'application**
Rendez-vous sur [http://localhost:3000](http://localhost:3000)

## 📝 Première utilisation

1. **Créer un compte**
   - Allez sur `/register`
   - Remplissez le formulaire d'inscription
   - Connectez-vous avec vos identifiants

2. **Créer votre premier devis**
   - Allez dans "Devis & Factures"
   - Cliquez sur "Nouveau devis"
   - Remplissez les informations et ajoutez les lignes
   - Sauvegardez

3. **Utiliser le calculateur de matériaux**
   - Allez dans "Matériaux"
   - Sélectionnez un type de projet
   - Entrez les dimensions
   - Cliquez sur "Calculer les matériaux"

4. **Gérer votre calendrier**
   - Allez dans "Calendrier"
   - Créez des événements pour vos chantiers
   - Suivez vos rendez-vous

## 🛠️ Technologies utilisées

- **Next.js 14** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Prisma** - ORM pour la base de données
- **SQLite** - Base de données (facilement migrable vers PostgreSQL)
- **NextAuth** - Authentification
- **Tailwind CSS** - Styling
- **Lucide React** - Icônes

## 📁 Structure du projet

```
menuisier-app/
├── app/                    # Pages et routes Next.js
│   ├── api/               # API routes
│   ├── dashboard/         # Tableau de bord
│   ├── devis/             # Gestion devis/factures
│   ├── materiaux/         # Calculateur de matériaux
│   └── calendrier/        # Calendrier
├── components/            # Composants React
│   ├── ui/                # Composants UI de base
│   ├── layout/            # Composants de layout
│   ├── devis/             # Composants devis
│   └── facture/           # Composants facture
├── lib/                   # Utilitaires et configurations
│   ├── prisma.ts          # Client Prisma
│   ├── auth.ts            # Configuration NextAuth
│   └── utils.ts           # Fonctions utilitaires
└── prisma/                # Schéma Prisma
    └── schema.prisma      # Modèles de données
```

## 🔐 Authentification

L'application utilise NextAuth avec authentification par credentials. Les mots de passe sont hashés avec bcrypt.

## 📊 Base de données

Le schéma Prisma inclut :
- **User** - Utilisateurs
- **Client** - Clients
- **Project** - Projets/Chantiers
- **Devis** - Devis avec items
- **Facture** - Factures avec items
- **Template** - Templates de devis
- **Material** - Matériaux
- **MaterialCalculation** - Calculs sauvegardés
- **CalendarEvent** - Événements du calendrier

## 🎨 Personnalisation

### Modifier les couleurs
Éditez `app/globals.css` pour changer les variables CSS.

### Ajouter des types de projets
Modifiez `app/materiaux/page.tsx` pour ajouter de nouveaux types de projets et leurs calculs.

### Créer des templates
Les templates de devis peuvent être créés via l'interface (fonctionnalité à venir) ou directement en base de données.

## 🚧 Prochaines étapes (Phase 2)

- [ ] Visualiseur 3D simplifié
- [ ] Espace client avec suivi
- [ ] Gestion des stocks avec alertes
- [ ] Analytics avancés
- [ ] Intégrations (fournisseurs, comptabilité)
- [ ] Application mobile

## 📄 Licence

Ce projet est développé pour un usage professionnel.

## 💡 Support

Pour toute question ou problème, contactez le développeur.

---

**Développé avec ❤️ pour les menuisiers**
