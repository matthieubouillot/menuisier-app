# 🪵 Menuisier Pro

Application web complète de gestion pour **tous les types d'ateliers de menuiserie** : artisans indépendants, petites entreprises, spécialistes (cuisines, escaliers, fenêtres, agencement, mobilier sur mesure, etc.). Optimisez votre administration, créez des devis professionnels en quelques clics, et gagnez du temps sur votre gestion quotidienne.

## 🎯 Pour qui ?

✅ **Artisans menuisiers indépendants**  
✅ **Petites entreprises de menuiserie**  
✅ **Spécialistes en cuisines**  
✅ **Fabricants d'escaliers**  
✅ **Menuisiers agenceurs**  
✅ **Fabricants de mobilier sur mesure**  
✅ **Menuisiers spécialisés fenêtres/portes**  
✅ **Tous les métiers du bois nécessitant des devis et factures**

L'application est **100% flexible** : vous pouvez créer n'importe quel type de projet, ajouter vos propres matériaux et prestations, et personnaliser vos devis selon vos besoins spécifiques.

## ✨ Fonctionnalités principales

### 📄 Gestion des Devis & Factures

- **Création de devis professionnels** : Interface intuitive pour créer des devis conformes à la législation française
- **Calculs automatiques** : Totaux HT/TTC, TVA, calculs de marge intégrés
- **PDF professionnels** : Génération automatique de PDF prêts à envoyer à vos clients
- **Conversion devis → facture** : Transformez un devis signé en facture en un clic
- **Gestion des statuts** : Suivez vos devis (brouillon, envoyé, signé, refusé, expiré)
- **Conformité légale** : Toutes les mentions obligatoires pour la France (SIRET, TVA, pénalités de retard, etc.)
- **Accès client sécurisé** : Partagez vos devis/factures via un lien sécurisé avec token

### 🧮 Calculateur de Matériaux & Chiffrage

- **Catalogue de matériaux personnalisable** : Gérez votre propre base de données de matériaux avec prix unitaires
- **Catégories flexibles** : Bois, quincaillerie, fournitures, finitions, et catégories personnalisées
- **Unités de mesure variées** : m², m, m³, kg, unité, lot, forfait, paire, pièce, boîte, rouleau, panneau, etc.
- **Lignes libres** : Ajoutez n'importe quelle prestation personnalisée à vos devis
- **Chiffrage intelligent** : Calculez automatiquement les coûts avec marge et main-d'œuvre
- **Export vers devis** : Exportez directement vos calculs vers un devis
- **Adaptable à tous les projets** : Cuisines, escaliers, fenêtres, mobilier, agencement, sur-mesure, etc.

### 👥 Gestion Clients & Projets

- **Base de données clients** : Centralisez toutes les informations de vos clients
- **Types de clients** : Gestion des particuliers et professionnels (avec SIRET)
- **Projets associés** : Liez vos devis et factures à vos projets
- **Historique complet** : Consultez tous les documents liés à un client ou projet

### 📅 Calendrier & Planning

- **Gestion des chantiers** : Planifiez vos interventions et rendez-vous
- **Association aux projets** : Liez vos événements à vos projets existants
- **Vue d'ensemble** : Visualisez votre planning en un coup d'œil

### 📊 Tableau de Bord

- **Statistiques financières** : Suivez votre chiffre d'affaires et vos factures
- **Vue d'ensemble** : Derniers devis, factures, projets en cours
- **Indicateurs clés** : Devis signés, factures payées, etc.

### ⚙️ Paramètres & Configuration

- **Informations légales** : Configurez une fois vos informations (SIRET, adresse, TVA, etc.)
- **Conditions de paiement** : Définissez vos conditions par défaut
- **Mentions légales** : Personnalisez vos mentions légales
- **Guide de démarrage** : Tutoriel intégré pour prendre en main l'application

## 🚀 Technologies

- **Next.js 16.0.4** - Framework React avec App Router et Turbopack
- **TypeScript** - Typage statique pour une meilleure maintenabilité
- **Prisma 7.0.1** - ORM moderne avec adaptateur PostgreSQL
- **PostgreSQL** - Base de données (production et développement)
- **NextAuth 5.0** - Authentification sécurisée (credentials, OAuth Google/GitHub)
- **React 19** - Bibliothèque UI moderne
- **Tailwind CSS 4.0** - Framework CSS utilitaire
- **@react-pdf/renderer** - Génération de PDF professionnels
- **Lucide React** - Icônes modernes

## 📋 Prérequis

- **Node.js** 18+ (recommandé : 20+)
- **npm** ou **yarn**
- **PostgreSQL** 12+ (pour la production et le développement)

## 🔧 Installation

### 1. Cloner le repository

```bash
git clone https://github.com/matthieubouillot/menuisier-app.git
cd menuisier-app
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Créer la base de données PostgreSQL

Créez une base de données PostgreSQL pour le développement :

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE menuisier_db;

# Créer un utilisateur (optionnel, vous pouvez utiliser postgres)
CREATE USER menuisier_user WITH PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE menuisier_db TO menuisier_user;

# Quitter psql
\q
```

### 4. Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# Base de données PostgreSQL
# Remplacez user, password et menuisier_db par vos identifiants
DATABASE_URL="postgresql://user:password@localhost:5432/menuisier_db"

# NextAuth
NEXTAUTH_SECRET="votre-secret-super-securise-genere-aleatoirement"
NEXTAUTH_URL="http://localhost:3000"

# OAuth (optionnel)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
```

### 5. Générer le client Prisma

```bash
npm run db:generate
```

### 6. Lancer les migrations

```bash
# Pour le développement
npm run db:migrate

# Pour la production
npm run db:deploy
```

### 7. Démarrer l'application

```bash
# Mode développement
npm run dev

# Mode production
npm run build
npm start
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🎯 Guide de démarrage rapide

### 1. Créer un compte

- Allez sur `/register`
- Remplissez le formulaire d'inscription
- Connectez-vous avec vos identifiants

### 2. Configurer vos informations légales

- Allez dans **Paramètres** → **Entreprise**
- Remplissez vos informations (SIRET, adresse, TVA, etc.)
- Configurez vos conditions de paiement par défaut
- ⚠️ **Important** : Faites-le en premier, c'est nécessaire pour créer des devis conformes

### 3. Ajouter vos clients

- Allez dans **Paramètres** → **Clients**
- Cliquez sur "Ajouter un client"
- Remplissez les informations (nom, adresse, téléphone, email)
- Choisissez le type : particulier ou professionnel

### 4. Créer votre catalogue de matériaux

- Allez dans **Mon atelier** → **Catalogue**
- Ajoutez vos matériaux (bois, quincaillerie, colle, etc.)
- Définissez les prix unitaires et les unités de mesure

### 5. Créer votre premier devis

- Allez dans **Devis & Factures** → **Nouveau devis**
- Sélectionnez un client et un projet
- Ajoutez vos lignes de prestation
- Le système calcule automatiquement les totaux
- Téléchargez le PDF et envoyez-le à votre client

### 6. Consulter le guide complet

- Allez dans **Paramètres** → **Guide de démarrage**
- Suivez le tutoriel pas à pas pour maîtriser toutes les fonctionnalités

## 📁 Structure du projet

```
menuisier-app/
├── app/                          # Pages Next.js (App Router)
│   ├── api/                      # Routes API
│   │   ├── devis/                # API devis et factures
│   │   ├── clients/               # API clients
│   │   ├── projects/              # API projets
│   │   ├── materials/             # API matériaux
│   │   └── settings/              # API paramètres
│   ├── dashboard/                 # Tableau de bord
│   ├── devis/                     # Gestion devis/factures
│   ├── atelier/                   # Atelier (catalogue, chiffrage)
│   ├── calendrier/                # Calendrier et planning
│   ├── parametres/                # Paramètres (entreprise, clients, tutoriel)
│   ├── client/                    # Espace client (accès via token)
│   ├── login/                     # Authentification
│   └── register/                  # Inscription
├── components/                    # Composants React
│   ├── ui/                        # Composants UI de base (shadcn/ui)
│   ├── layout/                    # Layout (Navbar, etc.)
│   ├── settings/                  # Composants paramètres
│   ├── devis/                     # Composants devis
│   └── facture/                   # Composants facture
├── lib/                           # Utilitaires et configurations
│   ├── prisma.ts                  # Client Prisma
│   ├── auth.ts                    # Configuration NextAuth
│   ├── utils.ts                   # Fonctions utilitaires
│   ├── server-utils.ts            # Utilitaires serveur
│   └── pdf-generator.tsx          # Génération PDF
├── prisma/                        # Configuration Prisma
│   ├── schema.prisma              # Schéma de base de données
│   ├── migrations/                # Migrations
│   └── config.ts                  # Configuration Prisma
└── public/                        # Fichiers statiques
```

## 🗄️ Base de données

Le schéma Prisma inclut les modèles suivants :

- **User** - Utilisateurs avec informations légales
- **Client** - Clients (particuliers et professionnels)
- **Project** - Projets/Chantiers
- **Devis** - Devis avec items et informations légales complètes
- **DevisItem** - Lignes de devis
- **Facture** - Factures avec items
- **FactureItem** - Lignes de facture
- **Material** - Catalogue de matériaux
- **MaterialCalculation** - Calculs de chiffrage sauvegardés
- **CalendarEvent** - Événements du calendrier
- **Template** - Templates de devis (pour usage futur)

## 🔐 Authentification

L'application utilise **NextAuth 5.0** avec :

- **Authentification par credentials** (email/mot de passe)
- **OAuth Google** (optionnel, si configuré)
- **OAuth GitHub** (optionnel, si configuré)
- **Hashage des mots de passe** avec bcrypt
- **Sessions JWT** sécurisées

## 📄 Conformité légale (France)

L'application garantit la conformité avec la législation française pour les devis et factures :

### Devis

- ✅ Numérotation séquentielle
- ✅ Date de validité obligatoire
- ✅ Date de début des travaux obligatoire
- ✅ Durée estimée des travaux obligatoire
- ✅ Délai de paiement obligatoire
- ✅ Mentions légales complètes
- ✅ TVA conforme (avec option art. 293 B du CGI)

### Factures

- ✅ Numérotation séquentielle
- ✅ SIRET obligatoire
- ✅ Adresse complète obligatoire
- ✅ Date de prestation obligatoire
- ✅ Mentions légales (pénalités de retard, indemnité forfaitaire)
- ✅ Conditions de paiement
- ✅ TVA conforme

## 🚀 Déploiement

### Déploiement sur Render

L'application est configurée pour être déployée sur Render :

1. **Créer un service Web** sur Render
2. **Connecter le repository GitHub**
3. **Configurer les variables d'environnement** :
   - `DATABASE_URL` (PostgreSQL fourni par Render)
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (URL de votre service Render)
4. **Build Command** : `npm install && npm run build`
5. **Start Command** : `npm start`

Les migrations Prisma s'exécutent automatiquement lors du build.

### Variables d'environnement requises

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://votre-app.onrender.com
```

## 📝 Scripts disponibles

```bash
# Développement
npm run dev              # Démarrer le serveur de développement

# Production
npm run build           # Builder l'application
npm start               # Démarrer le serveur de production

# Base de données
npm run db:generate     # Générer le client Prisma
npm run db:migrate      # Lancer les migrations (dev)
npm run db:deploy       # Déployer les migrations (prod)
npm run db:studio       # Ouvrir Prisma Studio

# Qualité
npm run lint            # Linter le code
```

## 🎨 Personnalisation

### Modifier les couleurs

Éditez `app/globals.css` pour modifier les variables CSS de thème.

### Ajouter des unités de mesure

Modifiez le composant de sélection d'unités dans `app/atelier/catalogue/page.tsx`.

## 📚 Documentation

- **Guide de démarrage** : Accessible dans l'application via **Paramètres** → **Guide de démarrage**
- **Messages LinkedIn** : Voir `MESSAGE_LINKEDIN.md` pour des templates de messages

## 🤝 Contribution

Ce projet est actuellement en développement actif. Pour toute question ou suggestion, contactez le développeur.

## 📄 Licence

Ce projet est développé pour un usage professionnel.

## 💡 Support

Pour toute question, problème ou suggestion d'amélioration, n'hésitez pas à ouvrir une issue sur GitHub.

---

**Développé avec ❤️ pour les menuisiers et artisans du bois**

_Gagnez 5 heures par semaine sur l'administration et concentrez-vous sur votre cœur de métier._
