# SociaLink V6.5 - Plateforme de Mise en Relation Professionnelle

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)

> **Marketplace** de mise en relation entre **travailleurs qualifiés** et **établissements** recherchant des collaborateurs pour missions temporaires ou permanentes.

## 📋 Table des Matières

- [Aperçu](#-aperçu)
- [Fonctionnalités](#-fonctionnalités)
- [Stack Technique](#-stack-technique)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [Structure du Projet](#-structure-du-projet)
- [API Documentation](#-api-documentation)
- [Tests](#-tests)
- [Contribution](#-contribution)
- [Licence](#-licence)

---

## 🎯 Aperçu

**SociaLink** est une plateforme web full-stack développée avec React et Node.js, offrant un écosystème complet pour :

- 👷 **Travailleurs** : Créer un profil, chercher des missions, postuler, gérer les candidatures
- 🏢 **Établissements** : Publier des missions, rechercher des candidats qualifiés, gérer les recrutements
- 🛡️ **Administrateurs** : Valider les profils, modérer les missions, gérer les litiges
- 👑 **Super Admins** : Gérer les admins, statistiques, finance, marketing, système

### Captures d'Écran

*Screenshots à ajouter dans `/docs/screenshots/`*

---

## ✨ Fonctionnalités

### Pour les Travailleurs
- ✅ Profil complet avec CV, compétences, expériences
- ✅ Upload de documents (diplômes, certifications)
- ✅ Recherche avancée de missions (filtres par ville, secteur, salaire)
- ✅ Candidature en un clic
- ✅ Calendrier de disponibilité
- ✅ Messagerie intégrée
- ✅ Abonnement Premium (fonctionnalités avancées)

### Pour les Établissements
- ✅ Publication de missions (temporaires ou permanentes)
- ✅ Recherche de travailleurs par compétences
- ✅ Gestion des candidatures reçues
- ✅ Profil entreprise détaillé
- ✅ Statistiques de missions

### Pour les Administrateurs
- ✅ Dashboard de supervision
- ✅ Validation des profils et documents
- ✅ Modération des missions
- ✅ Gestion des litiges
- ✅ Messagerie support

### Pour les Super Admins
- ✅ Gestion complète des administrateurs
- ✅ Gestion des utilisateurs (suspend/validate)
- ✅ Plans d'abonnement
- ✅ Campagnes marketing (bannières, notifications)
- ✅ Statistiques financières (MRR, transactions)
- ✅ Contrôle qualité
- ✅ Configuration système

---

## 🛠 Stack Technique

### Frontend
- **Framework** : React 18.3.1
- **Routing** : React Router DOM v7
- **Styling** : Tailwind CSS 3.4
- **Icons** : Lucide React
- **HTTP Client** : Axios
- **State Management** : React Hooks (Context API)

### Backend
- **Runtime** : Node.js 20.x
- **Framework** : Express.js 4.21
- **ORM** : Prisma 6.3
- **Database** : PostgreSQL 16
- **Authentication** : JWT (jsonwebtoken)
- **Security** : bcrypt, CORS, helmet
- **File Upload** : Multer
- **Payment** : Stripe API

### DevOps & Tools
- **Version Control** : Git + GitHub
- **Package Manager** : npm
- **Code Editor** : VS Code
- **API Testing** : Postman
- **DB Management** : Prisma Studio, pgAdmin 4

---

## 🏗 Architecture

```
┌─────────────────────────────────┐
│      Client (React SPA)         │
│  ┌──────────┐  ┌──────────┐   │
│  │ Worker   │  │Establish.│    │
│  │ Dashboard│  │ Dashboard│    │
│  └──────────┘  └──────────┘    │
│  ┌──────────┐  ┌──────────┐   │
│  │  Admin   │  │SuperAdmin│    │
│  │ Dashboard│  │ Dashboard│    │
│  └──────────┘  └──────────┘    │
└────────────┬────────────────────┘
             │ HTTP/HTTPS (Axios)
             ▼
┌─────────────────────────────────┐
│    Express.js Backend API       │
│                                 │
│  ┌─────────────────────────┐  │
│  │   Routes + Middleware   │  │
│  │  (Auth, RBAC, Upload)   │  │
│  └───────────┬─────────────┘  │
│              ▼                  │
│  ┌─────────────────────────┐  │
│  │     Controllers         │  │
│  │  (Business Logic)       │  │
│  └───────────┬─────────────┘  │
│              ▼                  │
│  ┌─────────────────────────┐  │
│  │      Prisma ORM         │  │
│  │   (Query Builder)       │  │
│  └───────────┬─────────────┘  │
└──────────────┼─────────────────┘
               ▼
┌─────────────────────────────────┐
│     PostgreSQL Database         │
│   (Users, Missions, etc.)       │
└─────────────────────────────────┘
```

---

## 📦 Installation

### Prérequis
- Node.js **20.x** ou supérieur
- PostgreSQL **16** ou supérieur
- npm **10.x** ou supérieur
- Git

### Étapes

#### 1. Cloner le Repository
```bash
git clone https://github.com/Vectra-Labs/SociaLink_V6.5.git
cd SociaLink_V6.5
```

#### 2. Installation Backend
```bash
cd backend
npm install
```

#### 3. Installation Frontend
```bash
cd ../frontend
npm install
```

#### 4. Configuration de la Base de Données
```bash
cd ../backend

# Créer la base de données PostgreSQL
createdb socialink

# Configurer le fichier .env (voir section Configuration)

# Générer le client Prisma
npx prisma generate

# Pousser le schéma vers la DB
npx prisma db push

# (Optionnel) Seed des données de test
npm run seed
```

#### 5. Lancement

**Backend** (Terminal 1)
```bash
cd backend
npm run dev
# API accessible sur http://localhost:5000
```

**Frontend** (Terminal 2)
```bash
cd frontend
npm run dev
# App accessible sur http://localhost:5173
```

---

## ⚙️ Configuration

### Backend Environment Variables

Créer un fichier `.env` dans `/backend/` :

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/socialink

# Security
JWT_SECRET=your_super_secret_key_change_in_production_min_32_characters
PORT=5000

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:5173

# Stripe (Payment)
STRIPE_SECRET_KEY=sk_test_your_stripe_test_key

# Email (Optional - pour vérification email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Frontend Environment Variables

Créer un fichier `.env` dans `/frontend/` :

```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
```

---

## 🚀 Utilisation

### Comptes de Test

Des comptes de test sont disponibles dans `TEST_ACCOUNTS.md` :

```markdown
# SUPER ADMIN
Email: admin@socialink.ma
Password: Admin@2024

# WORKER
Email: worker@test.com
Password: Worker@123

# ESTABLISHMENT
Email: establishment@test.com
Password: Establishment@123
```

### Workflows Principaux

#### 1. Inscription Travailleur
1. Naviguer vers `/register/worker`
2. Remplir le formulaire (email, nom, prénom, mot de passe)
3. Vérifier l'email (lien de confirmation)
4. Compléter le profil (compétences, documents)
5. Attendre validation admin

#### 2. Publication de Mission (Établissement)
1. Se connecter en tant qu'établissement
2. Dashboard → "Publier une Mission"
3. Remplir les détails (titre, description, salaire, dates)
4. Soumettre
5. Attendre validation admin
6. Mission visible publiquement

#### 3. Candidature à une Mission (Travailleur)
1. Se connecter en tant que travailleur
2. Dashboard → "Rechercher Missions"
3. Filtrer par ville, secteur, salaire
4. Consulter les détails d'une mission
5. Cliquer sur "Postuler"
6. Attendre réponse de l'établissement

---

## 📁 Structure du Projet

```
SociaLink_V6.5/
├── backend/
│   ├── public/
│   │   └── uploads/          # Fichiers uploadés
│   ├── src/
│   │   ├── config/           # Configuration DB
│   │   ├── controllers/      # Logique métier
│   │   ├── middleware/       # Auth, RBAC, Upload
│   │   ├── routes/           # Définition des routes
│   │   ├── services/         # Services métier
│   │   ├── prisma/
│   │   │   └── schema.prisma # Schéma de DB
│   │   └── server.js         # Point d'entrée
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/               # Assets statiques
│   ├── src/
│   │   ├── api/              # Axios config
│   │   ├── components/       # Composants React
│   │   │   ├── Layout.jsx
│   │   │   ├── WorkerLayout.jsx
│   │   │   ├── EstablishmentLayout.jsx
│   │   │   └── AdminLayout.jsx
│   │   ├── pages/            # Pages de l'app
│   │   │   ├── worker/
│   │   │   ├── establishment/
│   │   │   └── admin/
│   │   ├── hooks/            # Custom hooks
│   │   ├── utils/            # Utilitaires
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
│
├── docs/                     # Documentation
├── .gitignore
├── README.md
└── TEST_ACCOUNTS.md
```

---

## 📚 API Documentation

### Authentication

#### POST `/api/auth/register`
Inscription d'un nouvel utilisateur

**Body:**
```json
{
  "email": "user@example.com",
  "password": "Password@123",
  "role": "WORKER",
  "prenom": "John",
  "nom": "Doe"
}
```

**Response:**
```json
{
  "message": "Inscription réussie",
  "userId": 123
}
```

#### POST `/api/auth/login`
Connexion utilisateur

**Body:**
```json
{
  "email": "user@example.com",
  "password": "Password@123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 123,
    "email": "user@example.com",
    "role": "WORKER",
    "status": "VALIDATED"
  }
}
```

### Missions

#### GET `/api/missions`
Liste publique des missions (avec filtres)

**Query Params:**
- `city_id` (optional)
- `sector` (optional)
- `page` (default: 1)
- `limit` (default: 20)

#### POST `/api/establishment/missions`
Créer une nouvelle mission (ESTABLISHMENT only)

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "title": "Infirmier H/F",
  "description": "Recherche infirmier qualifié...",
  "salary_min": 5000,
  "salary_max": 7000,
  "start_date": "2026-03-01",
  "end_date": "2026-12-31",
  "city_id": 1,
  "sector": "Santé"
}
```

### Admin

#### GET `/api/super-admin/users`
Liste de tous les utilisateurs (SUPER_ADMIN only)

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "user_id": 1,
    "email": "worker@test.com",
    "role": "WORKER",
    "status": "VALIDATED",
    "created_at": "2026-01-15T10:30:00Z"
  }
]
```

*Pour la documentation complète des endpoints, voir `/docs/API.md`*

---

## 🧪 Tests

### Tests Manuels

Des scénarios de test sont documentés dans `/docs/TESTING.md`

### Exécution
```bash
# Backend tests (si implémentés)
cd backend
npm test

# Frontend tests (si implémentés)
cd frontend
npm test
```

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Merci de suivre ces étapes :

1. **Fork** le projet
2. Créer une **branche** pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. **Commit** vos changements (`git commit -m 'Add some AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une **Pull Request**

### Guidelines
- Respecter les conventions de code existantes
- Documenter les nouvelles fonctionnalités
- Tester avant de soumettre

---

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier `LICENSE` pour plus de détails.

---

## 👥 Auteurs

**Vectra Labs**
- GitHub: [@Vectra-Labs](https://github.com/Vectra-Labs)
- Email: contact@vectra-labs.com

---

## 🙏 Remerciements

- [React](https://reactjs.org/) - Framework Frontend
- [Node.js](https://nodejs.org/) - Runtime JavaScript
- [Prisma](https://www.prisma.io/) - ORM moderne
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitaire
- [Stripe](https://stripe.com/) - Plateforme de paiement

---

## 📞 Support

Pour toute question ou problème :
- 📧 Email : support@socialink.ma
- 🐛 Issues : [GitHub Issues](https://github.com/Vectra-Labs/SociaLink_V6.5/issues)
- 📖 Documentation : `/docs/`

---

**Made with ❤️ by Vectra Labs**
