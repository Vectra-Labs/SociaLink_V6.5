# 🌐 SociaLink V6 - Plateforme de Recrutement Social

<div align="center">

![SociaLink](https://img.shields.io/badge/SociaLink-V6-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-4169E1?style=for-the-badge&logo=postgresql)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss)

**Plateforme de mise en relation entre travailleurs sociaux et établissements médico-sociaux au Maroc**

[🚀 Installation](#-installation) • [📖 Documentation](#-documentation) • [📊 Fonctionnalités](#-fonctionnalités-clés) • [🧪 Tests](#-testing)

</div>

---

## 📋 Aperçu

SociaLink est une plateforme web innovante dédiée à la mise en relation entre les **travailleurs sociaux** (aides-soignants, éducateurs, infirmiers, etc.) et les **établissements médico-sociaux** (EHPAD, crèches, centres sociaux, cliniques) au Maroc. Elle facilite le recrutement, la gestion des missions et la validation des candidatures via une interface fluide et sécurisée.

---

## 🛠️ Stack Technique

| Couche | Technologies |
|--------|-------------|
| **Frontend** | React 19 + Vite 7, Tailwind CSS 4, Lucide React, React Router 7, React Query |
| **Backend** | Node.js, Express 5, Socket.io |
| **Base de Données** | PostgreSQL via Prisma ORM 6.x |
| **Authentification** | JWT + HTTP-Only Cookies + Bcrypt |
| **Email** | Nodemailer (Support Brevo/SMTP) |
| **Stockage** | Multer (local) + Supabase Storage (cloud) |
| **Paiements** | Stripe (prêt à intégrer) |
| **Tests** | Vitest, Playwright (E2E), Testing Library |

---

## ✨ Fonctionnalités Clés

### 🔐 Authentification & Sécurité
- **Inscription multi-rôle** : Travailleur ou Établissement
- **Vérification Email (OTP)** : Code à 6 chiffres envoyé par email
- **Mot de passe oublié** : Flux complet de réinitialisation avec lien sécurisé
- **Protection des Routes** : Middleware vérifiant Token, Rôle et Statut de validation

### 👷 Espace Travailleur
- **Dashboard Personnel** : Vue d'ensemble des candidatures et missions
- **Profil Complet** : Gestion des diplômes, expériences, spécialités et CV
- **Marché des Missions** : Recherche et filtrage des missions disponibles
- **Candidature** : Postuler aux missions (validation du profil requise)
- **Calendrier** : Gestion des disponibilités
- **Abonnement Premium** : Accès illimité aux missions et fonctionnalités avancées

### 🏥 Espace Établissement
- **Gestion des Missions** : Création, modification et suivi des offres d'emploi
- **Suivi des Candidats** : Réception des candidatures, consultation des profils
- **Statistiques** : Vue sur les missions actives et suggestions de candidats
- **Recherche de Travailleurs** : Filtrage par spécialités et localisation

### 🛡️ Administration
- **Admin Dashboard** : Validation des profils et documents utilisateurs
- **Gestion des Litiges** : Modération et arbitrage des conflits
- **Centre de Notifications** : Communication avec les utilisateurs

### 👑 Super Administration
- **Dashboard Financier** : Revenus, abonnements, métriques globales
- **Gestion des Plans** : Configuration des abonnements (BASIC, PREMIUM, PRO)
- **Gestion des Admins** : CRUD complet des administrateurs
- **Paramètres Système** : Configuration globale de la plateforme

---

## 💳 Système d'Abonnements

| Plan | Cible | Prix | Limitations |
|------|-------|------|-------------|
| **BASIC** | Workers | Gratuit | 3 candidatures, 5 missions visibles, délai 48h |
| **PREMIUM** | Workers | 149 DH/mois | Illimité, accès instantané, auto-matching |
| **PRO** | Établissements | 499 DH/mois | Missions illimitées, recherche workers, posts urgents |

---

## 📂 Structure du Projet

```
SociaLink_v6/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Schéma DB (25+ modèles)
│   │   └── seed.js            # Données de test
│   ├── src/
│   │   ├── controllers/       # 14 controllers (auth, worker, mission, etc.)
│   │   ├── routes/            # 13 fichiers de routes API
│   │   ├── middleware/        # Auth, Role, Validation, Upload
│   │   └── server.js          # Point d'entrée
│   └── uploads/               # Fichiers uploadés
│
├── frontend/
│   ├── src/
│   │   ├── components/        # Layouts, UI réutilisables
│   │   │   ├── WorkerLayout.jsx
│   │   │   ├── EstablishmentLayout.jsx
│   │   │   ├── AdminLayout.jsx
│   │   │   └── SuperAdminLayout.jsx
│   │   ├── pages/             # 46+ pages
│   │   │   ├── worker/        # Dashboard, Missions, Profile, Subscription
│   │   │   ├── establishment/ # Dashboard, Missions, Applications
│   │   │   ├── admin/         # Validations, Documents, Users
│   │   │   └── auth/          # Login, Register, Verify
│   │   ├── context/           # AuthContext, SubscriptionContext
│   │   └── hooks/             # useAuth, etc.
│   └── public/                # Assets statiques
│
└── Documentation/
    ├── ANALYSIS_V6.md         # Analyse technique complète
    ├── SYSTEMES.md            # Documentation des systèmes
    ├── RULES_ACCESS_CONTROL.md # Règles de contrôle d'accès
    └── TESTING.md             # Guide de tests
```

---

## 🚀 Installation

### Prérequis
- Node.js v18+
- PostgreSQL (Local ou Cloud)
- npm ou yarn

### 1. Cloner le projet
```bash
git clone https://github.com/Vectra-Labs/SociaLink_V6_2.0.git
cd SociaLink_V6_2.0
```

### 2. Configuration du Backend
```bash
cd backend
npm install
```

Créez un fichier `.env` dans le dossier `backend`:
```env
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/socialink_db"

# Authentification
JWT_SECRET="votre_secret_super_securise"
PORT=5001

# Email (SMTP)
SMTP_HOST="smtp-relay.brevo.com"
SMTP_PORT=587
SMTP_USER="votre_email"
SMTP_PASS="votre_clé"

# Supabase (optionnel)
SUPABASE_URL="votre_url_supabase"
SUPABASE_SERVICE_ROLE_KEY="votre_clé_supabase"
```

Initialisez la base de données:
```bash
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

### 3. Configuration du Frontend
```bash
cd frontend
npm install
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

---

## 🧪 Testing

### Comptes de Test (après seed)

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Super Admin | superadmin@socialink.ma | superadmin123 |
| Admin | admin@socialink.ma | admin123 |
| Worker Premium | worker.premium@test.ma | test123 |
| Worker Basic | worker.nosub@test.ma | test123 |
| Worker En Attente | worker.pending@test.ma | test123 |
| Établissement Pro | etab.pro@test.ma | test123 |
| Établissement Basic | etab.nosub@test.ma | test123 |

### Commandes de Test

```bash
# Backend - Tests unitaires
cd backend
npm test

# Frontend - Tests unitaires
cd frontend
npm test

# Frontend - Tests E2E (Playwright)
npm run test:e2e

# Frontend - Tests E2E avec UI
npm run test:e2e:ui
```

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [ANALYSIS_V6.md](./ANALYSIS_V6.md) | Analyse technique complète du projet |
| [SYSTEMES.md](./SYSTEMES.md) | Documentation de tous les systèmes |
| [RULES_ACCESS_CONTROL.md](./RULES_ACCESS_CONTROL.md) | Règles de contrôle d'accès par rôle |
| [TESTING.md](./TESTING.md) | Guide complet de tests |

---

## 🔐 Contrôle d'Accès par Rôle

| Fonctionnalité | WORKER | ESTABLISHMENT | ADMIN | SUPER_ADMIN |
|----------------|--------|---------------|-------|-------------|
| Voir missions | ✅ (avec limites) | ✅ Propres | ✅ Toutes | ✅ Toutes |
| Postuler | ✅ (si validé) | ❌ | ❌ | ❌ |
| Publier missions | ❌ | ✅ | ❌ | ❌ |
| Valider profils | ❌ | ❌ | ✅ | ✅ |
| Gérer abonnements | ❌ | ❌ | ❌ | ✅ |
| Dashboard financier | ❌ | ❌ | ❌ | ✅ |

---

## 📈 Roadmap

### V6 (Actuelle) ✅
- [x] Système complet d'authentification multi-rôle
- [x] Gestion des profils enrichis (Worker + Établissement)
- [x] Système de missions et candidatures
- [x] Administration et Super Administration complète
- [x] Système d'abonnements (BASIC, PREMIUM, PRO)
- [x] Documents avec validation admin
- [x] Calendrier de disponibilité
- [x] Dashboard Worker amélioré
- [x] Système de messagerie (Socket.io)
- [x] Tests E2E avec Playwright

### V7 (Planifiée)
- [ ] Paiements réels (Stripe intégration complète)
- [ ] Application mobile (PWA)
- [ ] Push Notifications
- [ ] IA matching (recommandations intelligentes)
- [ ] Support multilingue (Arabe, Français)

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez consulter les guidelines de contribution avant de soumettre une PR.

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add: Amazing Feature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📞 Support

Pour toute question technique:
- **Email**: support@socialink.ma
- **Documentation API**: `/api-docs` (Swagger)

---

## 📄 Licence

Ce projet est sous licence propriétaire. Tous droits réservés.

---

<div align="center">

**SociaLink V6** - Plateforme de Recrutement Social pour le Maroc

*Dernière mise à jour: Janvier 2026*

</div>
