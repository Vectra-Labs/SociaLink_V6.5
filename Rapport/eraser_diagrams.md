# Diagrammes Eraser.io - SociaLink

Ce fichier contient des diagrammes techniques créés pour Eraser.io.
Copiez-collez chaque section dans Eraser.io pour générer les diagrammes.

---

## 1. Architecture Système Globale (Cloud Architecture)

```eraser
title SociaLink - Architecture Système Globale

// Client Layer
Browser [icon: monitor] {
  React SPA
  TailwindCSS
}

// Frontend
Browser > API Gateway: HTTPS Requests

// API Layer
API Gateway [icon: cloud] {
  Node.js/Express
  Port 5001
}

API Gateway > Auth Service: JWT Verification
API Gateway > Business Logic: Route to Controllers

// Business Logic Layer
Business Logic [icon: server] {
  Controllers
  - authController
  - missionController
  - profileController
  - adminController
}

Business Logic > Database: Prisma ORM
Business Logic > External Services: API Calls

// Database
Database [icon: database, color: blue] {
  PostgreSQL 16
  18 Tables
}

// External Services
External Services [icon: puzzle] {
  Stripe API
  Nodemailer
  Socket.io
}

// Real-time Communication
Browser > Socket.io Server: WebSocket
Socket.io Server [icon: message]: Real-time Messaging

Socket.io Server > Database: Store Messages

// Notes
note "Authentication Flow" as n1 [color: yellow]
n1 > API Gateway

note "File Storage" as n2 [color: green]
n2 > Business Logic: Multer uploads

note "RBAC: Worker, Establishment, Admin" as n3 [color: purple]
n3 > Auth Service
```

---

## 2. Séquence d'Authentification JWT

```eraser
title SociaLink - Flux d'Authentification JWT

User [icon: user]
Frontend [icon: monitor]
Backend [icon: server]
Database [icon: database]
Email Service [icon: mail]

// Registration Flow
User > Frontend: 1. Remplir formulaire inscription
Frontend > Backend: 2. POST /api/auth/register
Backend > Database: 3. Vérifier email unique
Database > Backend: 4. OK
Backend > Backend: 5. Hash password (Bcrypt)
Backend > Database: 6. CREATE User
Backend > Backend: 7. Générer code OTP (6 chiffres)
Backend > Database: 8. Stocker OTP + expiration (15min)
Backend > Email Service: 9. Envoyer email OTP
Email Service > User: 10. Recevoir email
Backend > Frontend: 11. Response 201 Created

// Email Verification
User > Frontend: 12. Saisir code OTP
Frontend > Backend: 13. POST /api/auth/verify-email
Backend > Database: 14. Vérifier OTP + expiration
Database > Backend: 15. OTP valide
Backend > Database: 16. UPDATE isEmailVerified = true
Backend > Backend: 17. Générer JWT (7j expiration)
Backend > Frontend: 18. Response { token, user }
Frontend > Frontend: 19. Stocker token (localStorage)

// Authenticated Request
User > Frontend: 20. Action nécessitant auth
Frontend > Backend: 21. GET /api/* + Header: Bearer {token}
Backend > Backend: 22. Vérifier JWT signature
Backend > Backend: 23. Décoder payload (user_id, role)
Backend > Database: 24. Vérifier RBAC permissions
Database > Backend: 25. User autorisé
Backend > Frontend: 26. Response 200 + Data
Frontend > User: 27. Afficher données
```

---

## 3. Diagramme de Base de Données (Entity-Relationship)

```eraser
title SociaLink - Modèle de Données Relationnel

// Core User Entity
User [icon: user, color: blue] {
  user_id uuid PK
  email string unique
  password hash
  role enum
  isEmailVerified boolean
  otp_code string nullable
  otp_expires timestamp nullable
  created_at timestamp
}

// Worker Profile
WorkerProfile [icon: briefcase, color: green] {
  profile_id uuid PK
  user_id uuid FK
  first_name string
  last_name string
  phone string
  city_id int FK
  profile_pic_url string nullable
  cv_url string nullable
  verification_status enum
  bio text nullable
}

// Establishment Profile
EstablishmentProfile [icon: building, color: purple] {
  profile_id uuid PK
  user_id uuid FK
  name string
  type enum
  phone string
  address string
  city_id int FK
  logo_url string nullable
  verification_status enum
  description text nullable
}

// Diploma
Diploma [icon: award, color: orange] {
  diploma_id uuid PK
  worker_profile_id uuid FK
  institution string
  degree string
  graduation_year int
  doc_url string
  verified boolean
}

// Experience
Experience [icon: calendar, color: teal] {
  experience_id uuid PK
  worker_profile_id uuid FK
  job_title string
  company string
  start_date date
  end_date date nullable
  current_job boolean
  description text
}

// Mission
Mission [icon: target, color: red] {
  mission_id uuid PK
  establishment_profile_id uuid FK
  title string
  description text
  speciality_id int FK
  city_id int FK
  contract_type enum
  work_mode enum
  salary_min decimal nullable
  salary_max decimal nullable
  start_date date
  end_date date nullable
  status enum
  created_at timestamp
}

// Application
Application [icon: file-text, color: yellow] {
  application_id uuid PK
  mission_id uuid FK
  worker_profile_id uuid FK
  status enum
  cover_letter text nullable
  created_at timestamp
  updated_at timestamp
}

// Review
Review [icon: star, color: pink] {
  review_id uuid PK
  application_id uuid FK
  reviewer_id uuid FK
  reviewee_id uuid FK
  rating int
  comment text
  created_at timestamp
}

// Subscription
Subscription [icon: credit-card, color: indigo] {
  subscription_id uuid PK
  user_id uuid FK
  stripe_subscription_id string unique
  plan enum
  status enum
  current_period_start timestamp
  current_period_end timestamp
}

// City Reference
City [icon: map-pin, color: gray] {
  city_id int PK
  name string
  region_id int FK
}

// Speciality Reference
Speciality [icon: heart, color: cyan] {
  speciality_id int PK
  name string
  category string
}

// Relationships
User 1--1 WorkerProfile: possède
User 1--1 EstablishmentProfile: possède
User 1--* Subscription: souscrit

WorkerProfile 1--* Diploma: détient
WorkerProfile 1--* Experience: a
WorkerProfile 1--* Application: soumet

EstablishmentProfile 1--* Mission: publie

Mission 1--* Application: reçoit

Application 1--0..1 Review: génère

City 1--* WorkerProfile: localise
City 1--* EstablishmentProfile: localise
City 1--* Mission: situe

Speciality 1--* Mission: concerne
```

---

## 4. Flux Utilisateur - Candidature à une Mission

```eraser
title Flux Utilisateur - Candidature à une Mission (Worker)

// Start
start [shape: oval, color: green]: Connexion Worker

// Search Phase
start > search: Rechercher missions
search [icon: search]: Page /worker/search-missions
search > filters: Appliquer filtres
filters [icon: filter] {
  Spécialité
  Localisation
  Type contrat
  Expérience requise
}

filters > results: Afficher résultats
results [icon: list]: 12 missions trouvées

// Mission Selection
results > select: Cliquer "Voir détails"
select > details: Page mission/{id}
details [icon: file-text] {
  Titre
  Description complète
  Établissement
  Conditions
  Salaire
  Dates
}

// Decision Point
details > decision{}: Worker intéressé ?
decision{} -- Non > search: Retour recherche
decision{} -- Oui > check_profile: Vérifier profil

// Profile Check
check_profile{}: Profil validé ?
check_profile{} -- Non > complete_profile: Compléter profil
complete_profile [icon: user, color: orange]: Avertissement
complete_profile > end_blocked: Impossible de postuler

check_profile{} -- Oui > check_subscription: Vérifier abonnement

// Subscription Check (Premium Feature)
check_subscription{}: Plan Premium ?
check_subscription{} -- Non > limit_check: Vérifier limite candidatures
limit_check{}: < 5 candidatures/mois ?
limit_check{} -- Non > upgrade_prompt: Proposer upgrade
upgrade_prompt [icon: star, color: gold]: Passer à Premium
upgrade_prompt > end_blocked

limit_check{} -- Oui > apply_form
check_subscription{} -- Oui > apply_form

// Application Form
apply_form [icon: edit]: Formulaire candidature
apply_form {
  Lettre de motivation
  CV (auto)
  Disponibilités
}

apply_form > submit: Soumettre candidature
submit > create_app: POST /api/applications

// Backend Processing
create_app [icon: server, color: blue]: Backend
create_app > db_insert: INSERT Application
db_insert [icon: database]: status = PENDING

// Notifications
db_insert > notify_worker: Email confirmation
notify_worker [icon: mail, color: green]
db_insert > notify_estab: Notifier établissement
notify_estab [icon: mail, color: purple]

// Success
notify_worker > success: Candidature envoyée
success [icon: check-circle, color: green]
success > dashboard: Redirection /worker/candidates

// End States
dashboard [shape: oval]: Suivi candidatures
end_blocked [shape: oval, color: red]: Fin (bloqué)
```

---

## 5. Architecture API REST - Endpoints

```eraser
title SociaLink - Architecture API REST

// Public Endpoints
Public [icon: globe, color: green] {
  POST /auth/register
  POST /auth/login
  POST /auth/verify-email
  POST /auth/forgot-password
  POST /auth/reset-password
  GET /specialities
  GET /cities
  GET /regions
}

// Worker Endpoints
Worker [icon: user, color: blue] {
  GET /worker/profile
  PUT /worker/profile
  POST /worker/profile/cv
  GET /worker/missions/search
  POST /worker/applications
  GET /worker/applications
  GET /worker/subscription
  POST /worker/subscription/create
}

// Establishment Endpoints
Establishment [icon: building, color: purple] {
  GET /establishment/profile
  PUT /establishment/profile
  POST /establishment/missions
  GET /establishment/missions
  PUT /establishment/missions/:id
  DELETE /establishment/missions/:id
  GET /establishment/applications
  PUT /establishment/applications/:id/status
  GET /establishment/subscription
}

// Admin Endpoints
Admin [icon: shield, color: red] {
  GET /admin/users
  GET /admin/validation/pending
  PUT /admin/validation/:id
  GET /admin/stats
  GET /admin/subscriptions
  DELETE /admin/users/:id
  PUT /admin/users/:id/role
}

// Shared Endpoints (Authenticated)
Shared [icon: lock, color: orange] {
  GET /messages
  POST /messages
  GET /notifications
  PUT /notifications/:id/read
}

// Middleware Layers
Public > Validation: express-validator
Worker > AuthMiddleware: JWT Verification
Worker > RBACMiddleware: Role = WORKER
Establishment > AuthMiddleware
Establishment > RBACMiddleware: Role = ESTABLISHMENT
Admin > AuthMiddleware
Admin > RBACMiddleware: Role = ADMIN
Shared > AuthMiddleware

// Controllers
Validation > Controllers: Route to Logic
AuthMiddleware > Controllers
RBACMiddleware > Controllers

Controllers [icon: server] {
  authController
  profileController
  missionController
  applicationController
  adminController
  messageController
}

// Database Access
Controllers > PrismaORM: Database Queries
PrismaORM [icon: database, color: cyan]: PostgreSQL
```

---

## Instructions d'utilisation

1. **Allez sur** https://app.eraser.io
2. **Créez un nouveau document**
3. **Copiez-collez** le code d'un diagramme ci-dessus
4. Le diagramme se génère automatiquement !
5. **Exportez** en PNG/SVG pour votre rapport

## Personnalisation

- Modifiez les couleurs : `color: blue, red, green, purple, etc.`
- Ajoutez des icônes : `icon: user, database, server, cloud, etc.`
- Changez les formes : `shape: oval, rectangle, diamond`
