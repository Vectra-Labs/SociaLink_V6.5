# 📊 GUIDE CRÉATION DIAGRAMMES ERASER.IO
## SociaLink v6.5 - 12 Diagrammes pour Rapport de Formation

---

## 🎯 INSTRUCTIONS GÉNÉRALES

Pour chaque diagramme:
1. Ouvrir [Eraser.io](https://eraser.io)
2. Créer un nouveau canvas
3. Utiliser les formes et connexions spécifiées
4. Appliquer les couleurs suggérées
5. Exporter en PNG (1200px width)
6. Renommer: `Diagramme_0X_NomDiagramme.png`

---

## 📐 DIAGRAMME 01: ARCHITECTURE GLOBALE

**Type**: System Architecture  
**Taille Canvas**: 1400x800  
**Couleur Fond**: Blanc

### Éléments à Créer:

#### Box 1: Frontend (Bleu)
```
┌─────────────────────────┐
│    FRONTEND (React)     │
│  ┌───────────────────┐  │
│  │ 42+ Pages         │  │
│  │ 18+ Components    │  │
│  │ Tailwind CSS      │  │
│  └───────────────────┘  │
└─────────────────────────┘
Position: X=50, Y=150
```

#### Box 2: API Layer (Violet)
```
┌──────────────────────┐
│   COMMUNICATION      │
│ HTTP REST + JSON     │
│ JWT Tokens + Cookies │
│ CORS Enabled         │
└──────────────────────┘
Position: X=450, Y=150
```

#### Box 3: Backend (Vert)
```
┌──────────────────────────┐
│  BACKEND (Express.js)    │
│ ┌────────────────────┐   │
│ │ 13 Controllers     │   │
│ │ 50+ Endpoints      │   │
│ │ Prisma ORM         │   │
│ │ Security: JWT      │   │
│ └────────────────────┘   │
└──────────────────────────┘
Position: X=850, Y=150
```

#### Box 4: Database (Orange)
```
┌──────────────────────┐
│  PostgreSQL 16       │
│ ┌────────────────┐   │
│ │ 25+ Models     │   │
│ │ Relations      │   │
│ │ Indexes        │   │
│ └────────────────┘   │
└──────────────────────┘
Position: X=1100, Y=150
```

#### Box 5: External Services (Rouge)
```
┌────────────────────────────┐
│  EXTERNAL INTEGRATIONS     │
│ • Stripe (Payments)        │
│ • SendGrid (Email)         │
│ • Tesseract.js (OCR)       │
│ • Socket.io (Real-time)    │
└────────────────────────────┘
Position: X=400, Y=500
```

#### Box 6: Storage (Gris)
```
┌──────────────────┐
│  FILE STORAGE    │
│ /uploads/        │
│ • Avatars        │
│ • Documents      │
│ • Diplomas       │
└──────────────────┘
Position: X=1100, Y=500
```

### Connexions:
```
Frontend → API Layer (Flèche bleue bidirectionnelle)
API Layer → Backend (Flèche violet bidirectionnelle)
Backend → Database (Flèche verte bidirectionnelle)
Backend → External Services (Flèches rouges)
Backend → Storage (Flèche grise)
```

---

## 📊 DIAGRAMME 02: FLUX D'AUTHENTIFICATION

**Type**: Flowchart  
**Taille Canvas**: 1000x1200  
**Couleur Fond**: Blanc

### Étapes (du haut vers le bas):

```
1. START [Ellipse, Vert]
   ↓
2. USER REGISTRATION [Rectangle, Bleu]
   Email + Password + Type Compte (Worker/Establishment)
   ↓
3. VALIDATION [Losange, Orange]
   Email valid? Password strong?
   ├─ NO → Error Message [Rouge] → Back to 2
   └─ YES ↓
4. SEND OTP EMAIL [Rectangle, Violet]
   6-digit code générée
   ↓
5. USER VERIFIES OTP [Rectangle, Bleu]
   Saisir code 6 chiffres
   ↓
6. VALIDATION OTP [Losange, Orange]
   Code valid? Expires in 10min?
   ├─ NO → Retry? [Losange]
   │       ├─ YES → Back to 4
   │       └─ NO → Account Rejected [Rouge]
   └─ YES ↓
7. STATUS = PENDING [Rectangle, Jaune]
   En attente validation admin
   ↓
8. ADMIN VALIDATION [Rectangle, Violet]
   Admin vérifie documents/profil
   ↓
9. DECISION [Losange, Orange]
   Approved? Rejected?
   ├─ REJECTED → Notification [Rouge] → END [Ellipse, Rouge]
   └─ APPROVED ↓
10. STATUS = VALIDATED [Rectangle, Vert]
    ↓
11. USER READY TO LOGIN [Rectangle, Bleu]
    Email + Password
    ↓
12. GENERATE JWT [Rectangle, Violet]
    Token valide 30 jours
    ↓
13. STORE IN COOKIE [Rectangle, Bleu]
    HTTP-Only, Secure, SameSite=Strict
    ↓
14. REDIRECT TO DASHBOARD [Rectangle, Vert]
    ↓
15. END [Ellipse, Vert]
```

### Couleurs:
- **Début/Fin**: Vert
- **Actions Utilisateur**: Bleu
- **Vérifications**: Orange
- **Actions Système**: Violet
- **Erreurs**: Rouge
- **Attente**: Jaune

---

## 🔄 DIAGRAMME 03: WORKFLOW CANDIDATURES

**Type**: State Machine / Flowchart  
**Taille Canvas**: 1200x800  
**Couleur Fond**: Blanc

### États (Swim Lanes - 3 colonnes):

#### Colonne 1: Worker
```
┌────────────────────┐
│ WORKER             │
├────────────────────┤
│ 1. Browse Missions │
│    (Search Filters)│
│        ↓           │
│ 2. Find Match      │
│    (Details Page)  │
│        ↓           │
│ 3. APPLY BUTTON    │
│    (1-click)       │
└────────────────────┘
```

#### Colonne 2: Central Process
```
┌──────────────────────────┐
│ APPLICATION PROCESS      │
├──────────────────────────┤
│ Status: PENDING          │
│ (Data saved in DB)       │
│        ↓                 │
│ Notification sent to     │
│ Establishment            │
│        ↓                 │
│ Await Establishment      │
│ Decision...              │
└──────────────────────────┘
```

#### Colonne 3: Establishment
```
┌────────────────────┐
│ ESTABLISHMENT      │
├────────────────────┤
│ 1. Receive Alert   │
│    (New Applicant) │
│        ↓           │
│ 2. View Profile    │
│    (Check Score)   │
│        ↓           │
│ 3. ACCEPT/REJECT   │
│    (Decision)      │
└────────────────────┘
```

### Post-Decision Paths:

```
ACCEPTED Path:
├─ Status: ACCEPTED (DB update)
├─ Notification to Worker
├─ Show Establishment Contact
├─ Mission Timeline Appears
└─ Worker marks Availability

REJECTED Path:
├─ Status: REJECTED (DB update)
├─ Notification to Worker
├─ Optional Reason shown
└─ Worker can apply elsewhere
```

### After Mission Completion:

```
┌─────────────────────────────────┐
│ MISSION COMPLETED               │
├─────────────────────────────────┤
│ Establishment rates Worker      │
│ ⭐⭐⭐⭐⭐ + Comment             │
│          ↓                      │
│ Worker can respond              │
│          ↓                      │
│ Review appears on Profile       │
└─────────────────────────────────┘
```

---

## 📈 DIAGRAMME 04: ENTITY-RELATIONSHIP DIAGRAM (ERD)

**Type**: Database Schema  
**Taille Canvas**: 1400x1000  
**Couleur Fond**: Blanc

### Entités Principales:

#### User (Centre, Rose)
```
USER
├─ user_id (PK)
├─ email (UNIQUE)
├─ password (hashed)
├─ role (ENUM: WORKER, ESTABLISHMENT, ADMIN, SUPER_ADMIN)
├─ status (ENUM: PENDING, VALIDATED, REJECTED, SUSPENDED)
└─ created_at
```

#### WorkerProfile (Gauche, Bleu)
```
WORKER_PROFILE
├─ worker_id (PK)
├─ user_id (FK) → User
├─ bio
├─ avatar_url
├─ region_id (FK) → Region
└─ rating_avg
```

#### EstablishmentProfile (Droite, Vert)
```
ESTABLISHMENT_PROFILE
├─ establishment_id (PK)
├─ user_id (FK) → User
├─ name
├─ siret
├─ logo_url
└─ region_id (FK) → Region
```

#### Mission (Bas-Gauche, Jaune)
```
MISSION
├─ mission_id (PK)
├─ establishment_id (FK) → EstablishmentProfile
├─ title
├─ description
├─ salary
├─ contract_type
├─ status (ENUM: OPEN, IN_PROGRESS, COMPLETED)
├─ region_id (FK) → Region
└─ created_at
```

#### Application (Bas-Centre, Orange)
```
APPLICATION
├─ application_id (PK)
├─ worker_id (FK) → WorkerProfile
├─ mission_id (FK) → Mission
├─ status (ENUM: PENDING, ACCEPTED, REJECTED)
├─ created_at
└─ UNIQUE(worker_id, mission_id)
```

#### Review (Bas-Droite, Violet)
```
REVIEW
├─ review_id (PK)
├─ from_user_id (FK) → User
├─ to_user_id (FK) → User
├─ rating (1-5)
├─ comment
└─ created_at
```

#### Supporting Tables:
```
WORKER_DOCUMENT
├─ document_id (PK)
├─ worker_id (FK) → WorkerProfile
├─ file_path
└─ status

REGION
├─ region_id (PK)
└─ name

CITY
├─ city_id (PK)
├─ region_id (FK) → Region
└─ name
```

### Connexions:
```
User (1) ──→ (∞) WorkerProfile
User (1) ──→ (∞) EstablishmentProfile
WorkerProfile (1) ──→ (∞) Application
Mission (1) ──→ (∞) Application
EstablishmentProfile (1) ──→ (∞) Mission
User (1) ──→ (∞) Review (from_user)
User (1) ──→ (∞) Review (to_user)
Region (1) ──→ (∞) WorkerProfile
Region (1) ──→ (∞) EstablishmentProfile
Region (1) ──→ (∞) Mission
```

---

## 🎭 DIAGRAMME 05: USE CASE DIAGRAM

**Type**: Use Case  
**Taille Canvas**: 1200x900  
**Couleur Fond**: Blanc

### Acteurs (Circles, à gauche et droite):

#### Gauche (Utilisateurs Non-Authentifiés):
```
┌──────────────────┐
│  Public Visitor  │
└──────────────────┘
```

#### Centre-Gauche (Workers):
```
┌──────────────────┐
│  Worker          │
│  (Travailleur)   │
└──────────────────┘
```

#### Centre-Droite (Establishments):
```
┌──────────────────┐
│  Establishment   │
│  (Recruteur)     │
└──────────────────┘
```

#### Droite (Admins):
```
┌──────────────────┐
│  Admin           │
└──────────────────┘

┌──────────────────┐
│  Super Admin     │
└──────────────────┘
```

### Use Cases (Ellipses, Centre):

#### For Public:
```
UC1: View Missions
UC2: Search by Filters
UC3: Register
UC4: Login
```

#### For Workers:
```
UC5: Create Profile
UC6: Upload Documents
UC7: Browse Missions
UC8: Apply to Mission
UC9: View Applications
UC10: Rate Establishment
UC11: Manage Calendar
UC12: Subscribe (Premium)
```

#### For Establishments:
```
UC13: Create Profile
UC14: Publish Mission
UC15: Browse Candidates
UC16: Review Candidates
UC17: Accept/Reject Application
UC18: Rate Worker
UC19: View Candidates History
```

#### For Admin:
```
UC20: Validate Profiles
UC21: Review Documents
UC22: Moderate Missions
UC23: View Dashboard Stats
UC24: Handle Support
```

#### For SuperAdmin:
```
UC25: Manage Admins
UC26: Manage Users
UC27: Configure Subscriptions
UC28: Marketing Campaigns
UC29: Finance Reports
UC30: System Config
```

### Connexions (Stick figures aux use cases)

---

## 🔀 DIAGRAMME 06: STATE MACHINE - MISSION LIFECYCLE

**Type**: State Diagram  
**Taille Canvas**: 1000x700  
**Couleur Fond**: Blanc

### États et Transitions:

```
         ┌─────────┐
         │  DRAFT  │ (New mission, not published)
         └────┬────┘
              │ publish()
              ↓
         ┌─────────┐
    ┌────│  OPEN   │◄────────┐
    │    └────┬────┘         │ reopen()
    │         │              │
    │ close() │ (Workers apply)
    │         ↓              │
    │    ┌──────────┐        │
    │    │ CLOSED   │────────┘
    │    └──────────┘
    │
    ↓
┌──────────────────┐
│  IN_PROGRESS     │ (Worker accepted, mission active)
└────┬─────────────┘
     │
     │ complete()
     ↓
┌──────────────────┐
│  COMPLETED       │ (Mission done, can rate)
└────┬─────────────┘
     │
     │ archive()
     ↓
┌──────────────────┐
│  ARCHIVED        │ (Closed permanently)
└──────────────────┘
```

### Détails des États:

**DRAFT** (Jaune)
- Workers: ❌ Can't see
- Establishment: ✅ Can edit

**OPEN** (Vert)
- Workers: ✅ Can view & apply
- Establishment: ✅ Can view applications

**CLOSED** (Orange)
- Workers: ❌ Can't apply
- Establishment: ✅ Can reopen or archive

**IN_PROGRESS** (Bleu)
- Workers: ✅ View timeline
- Establishment: ✅ Track progress

**COMPLETED** (Violet)
- Workers & Establishment: ✅ Can rate each other

**ARCHIVED** (Gris)
- Visible only in history

---

## 📊 DIAGRAMME 07: DATA FLOW DIAGRAM (DFD) - LEVEL 1

**Type**: Data Flow Diagram  
**Taille Canvas**: 1400x1000  
**Couleur Fond**: Blanc

### Level 0 (Simple):
```
┌──────────────┐         ┌──────────────┐
│   USER       │────────→│   SYSTEM     │
│ (External)   │←────────│  SociaLink   │
└──────────────┘         └──────────────┘
                              ↕
                         ┌──────────────┐
                         │  DATABASE    │
                         └──────────────┘
```

### Level 1 (Détaillé par Process):

#### Process 1.0: Authentication
```
External Entity: User
├─ Input: Email, Password, OTP
│
Process: 1.1 - Authenticate User
├─ Validate credentials
├─ Generate OTP
├─ Verify OTP
│
Data Store: DB - Users
│
Output: JWT Token
```

#### Process 2.0: Mission Management
```
External Entities: Worker, Establishment

Process: 2.1 - Create Mission
├─ Input: Mission details from Establishment
├─ Validate form data
├─ Save to DB
│
Process: 2.2 - Search Missions
├─ Input: Filter criteria from Worker
├─ Query Database with filters
├─ Return matching missions

Data Stores: DB - Missions, Requirements, Cities

Outputs: Mission list, Confirmation
```

#### Process 3.0: Application Management
```
External Entities: Worker, Establishment

Process: 3.1 - Apply to Mission
├─ Input: Worker ID, Mission ID
├─ Check if already applied
├─ Create Application record

Process: 3.2 - Manage Application
├─ Input: Accept/Reject decision from Establishment
├─ Update Application status
├─ Send notifications

Data Store: DB - Applications

Outputs: Notification, Status update
```

#### Process 4.0: Review & Ratings
```
External Entities: Worker, Establishment

Process: 4.1 - Submit Review
├─ Input: Rating, Comment
├─ Validate data
├─ Save to DB

Process: 4.2 - Calculate Scores
├─ Average ratings
├─ Update user scoring

Data Store: DB - Reviews

Outputs: Updated profile, Statistics
```

---

## 🧩 DIAGRAMME 08: COMPONENT HIERARCHY - FRONTEND

**Type**: Tree/Hierarchy Diagram  
**Taille Canvas**: 1200x1400  
**Couleur Fond**: Blanc

### Structure Arborescente:

```
┌─────────────────────────┐
│      App.jsx            │ (Root)
└────────┬────────────────┘
         │
    ┌────┴──────────────────────────┬──────────────┐
    ↓                               ↓              ↓
┌──────────────┐    ┌──────────────────┐  ┌──────────────┐
│ Routes       │    │ Context Providers│  │ Global       │
│              │    │                  │  │ Styles       │
├──────────────┤    ├──────────────────┤  └──────────────┘
│ /auth/*      │    │ AuthContext      │
│ /dashboard   │    │ ThemeContext     │
│ /missions    │    │ NotificationCtx  │
│ /admin       │    │ SubscriptionCtx  │
└──────────────┘    └──────────────────┘

AUTH LAYOUT (Private Route)
    ├─ Navbar
    ├─ Sidebar
    └─ Outlet (pages)

WORKER LAYOUT
    ├─ WorkerNav
    ├─ WorkerSidebar
    ├─ Pages:
    │   ├─ WorkerDashboard
    │   ├─ MissionMarket
    │   ├─ MyApplications
    │   ├─ WorkerCalendar
    │   ├─ WorkerDocuments
    │   ├─ WorkerExperience
    │   ├─ SpecialitiesManager
    │   ├─ WorkerReviews
    │   └─ WorkerSettings
    └─ Shared Components:
        ├─ MissionCard
        ├─ ReviewModal
        ├─ NotificationAlert
        └─ SubscriptionBanner

ESTABLISHMENT LAYOUT
    ├─ EstablishmentNav
    ├─ EstablishmentSidebar
    ├─ Pages:
    │   ├─ EstablishmentDashboard
    │   ├─ CreateMission
    │   ├─ EditMission
    │   ├─ MyMissions
    │   ├─ Candidates
    │   ├─ SearchWorker
    │   ├─ Billing
    │   └─ EstablishmentSettings
    └─ Shared Components (same as Worker)

ADMIN LAYOUT
    ├─ AdminNav
    ├─ AdminDashboard
    ├─ Pages:
    │   ├─ ValidateProfiles
    │   ├─ ReviewDocuments
    │   ├─ ModerateMissions
    │   ├─ AdminStats
    │   └─ SupportMessages
    └─ Shared Components (limited)

SUPER_ADMIN LAYOUT
    ├─ SuperAdminNav
    ├─ Pages:
    │   ├─ AdminManagement
    │   ├─ UserManagement
    │   ├─ SubscriptionPlans
    │   ├─ FinanceDashboard
    │   ├─ MarketingCampaigns
    │   └─ SystemConfig

PUBLIC PAGES
    ├─ HomePage
    ├─ MissionsPage (Search)
    ├─ MissionDetail
    ├─ PublicWorkerProfile
    ├─ LoginPage
    └─ RegisterPage
```

### Composants Réutilisables (ui/):
```
├─ Button
├─ Input
├─ Select
├─ Modal
├─ Card
├─ Badge
├─ Spinner
├─ Toast
├─ Pagination
├─ FilterSidebar
└─ MissionCard
```

---

## 🔌 DIAGRAMME 09: API ENDPOINTS MAP

**Type**: API Architecture / Mind Map  
**Taille Canvas**: 1400x1000  
**Couleur Fond**: Blanc

### Structure REST:

```
BASE_URL: /api

├─ /auth (POST, GET)
│  ├─ POST /register → Register new user
│  ├─ POST /login → Login with credentials
│  ├─ POST /verify-otp → Verify 6-digit code
│  ├─ POST /resend-otp → Resend OTP
│  ├─ POST /forgot-password → Send reset link
│  ├─ POST /reset-password → Reset password
│  ├─ POST /logout → Logout user
│  └─ GET /me → Current user info
│
├─ /workers (GET, POST, PATCH, DELETE)
│  ├─ GET /workers → List all (with filters)
│  ├─ GET /workers/:id → Get single worker
│  ├─ POST /workers → Create worker profile
│  ├─ PATCH /workers/:id → Update profile
│  ├─ DELETE /workers/:id → Delete account
│  └─ GET /workers/:id/availability → Get calendar
│
├─ /experiences (GET, POST, PATCH, DELETE)
│  ├─ GET /experiences → List worker's experiences
│  ├─ POST /experiences → Add experience
│  ├─ PATCH /experiences/:id → Update experience
│  └─ DELETE /experiences/:id → Delete experience
│
├─ /documents (GET, POST, PATCH, DELETE)
│  ├─ GET /documents → List worker's documents
│  ├─ POST /documents → Upload document
│  ├─ PATCH /documents/:id/status → Update status
│  └─ DELETE /documents/:id → Delete document
│
├─ /missions (GET, POST, PATCH, DELETE)
│  ├─ GET /missions → List all (advanced filters)
│  ├─ GET /missions/:id → Get mission details
│  ├─ POST /missions → Create mission (Establishment)
│  ├─ PATCH /missions/:id → Update mission
│  └─ DELETE /missions/:id → Delete mission
│
├─ /applications (GET, POST, PATCH)
│  ├─ GET /applications → List user's applications
│  ├─ POST /applications → Apply to mission
│  ├─ PATCH /applications/:id/status → Accept/Reject
│  └─ GET /applications/:id → Get application details
│
├─ /reviews (GET, POST, PATCH)
│  ├─ GET /reviews → List received reviews
│  ├─ POST /reviews → Create review
│  ├─ PATCH /reviews/:id/response → Respond to review
│  └─ GET /reviews/average → Average rating
│
├─ /subscriptions (GET, POST, PATCH)
│  ├─ GET /subscriptions → List user's subscriptions
│  ├─ GET /subscriptions/plans → Available plans
│  ├─ POST /subscriptions → Create subscription
│  ├─ PATCH /subscriptions/:id/cancel → Cancel
│  └─ POST /subscriptions/checkout → Stripe session
│
├─ /admin (GET, POST, PATCH, DELETE)
│  ├─ GET /admin/profiles-pending → Profiles to validate
│  ├─ POST /admin/profiles/:id/validate → Validate profile
│  ├─ PATCH /admin/documents/:id/review → Review document
│  ├─ GET /admin/stats → Dashboard statistics
│  ├─ GET /admin/missions-flagged → Flagged missions
│  └─ DELETE /admin/missions/:id → Delete mission
│
├─ /superadmin (GET, POST, PATCH, DELETE)
│  ├─ GET /superadmin/users → All users list
│  ├─ POST /superadmin/admins → Create admin
│  ├─ PATCH /superadmin/users/:id/suspend → Suspend user
│  ├─ GET /superadmin/finance → Revenue dashboard
│  ├─ POST /superadmin/campaigns → Create marketing campaign
│  └─ GET /superadmin/system → System configuration
│
├─ /messages (GET, POST)
│  ├─ GET /messages/:conversationId → Get messages
│  ├─ POST /messages → Send message
│  └─ GET /conversations → List conversations
│
└─ /notifications (GET, PATCH)
   ├─ GET /notifications → Get user notifications
   ├─ PATCH /notifications/:id/read → Mark as read
   └─ PATCH /notifications/read-all → Mark all read

TOTAL: 50+ Endpoints
```

### Color Coding:
```
GET: Bleu (Read)
POST: Vert (Create)
PATCH: Orange (Update)
DELETE: Rouge (Delete)
```

---

## 🚀 DIAGRAMME 10: DEPLOYMENT ARCHITECTURE

**Type**: Infrastructure Diagram  
**Taille Canvas**: 1200x800  
**Couleur Fond**: Blanc

### Layers (de gauche à droite):

#### Layer 1: Client (Bleu)
```
┌──────────────────────┐
│   CLIENT DEVICES     │
│ ┌────────────────┐   │
│ │ Web Browser    │   │
│ │ (HTTPS)        │   │
│ └────────────────┘   │
└──────────────────────┘
```

#### Layer 2: CDN & Frontend Hosting (Cyan)
```
┌──────────────────────┐
│   CDN / Frontend     │
│ ┌────────────────┐   │
│ │ Vercel/Netlify│   │
│ │ React Build   │   │
│ │ Static Assets │   │
│ └────────────────┘   │
└──────────────────────┘
```

#### Layer 3: API Gateway (Violet)
```
┌──────────────────────┐
│   API GATEWAY        │
│ ┌────────────────┐   │
│ │ CORS Policy    │   │
│ │ Rate Limiting  │   │
│ │ Load Balancer  │   │
│ └────────────────┘   │
└──────────────────────┘
```

#### Layer 4: Backend Application (Vert)
```
┌──────────────────────────┐
│   BACKEND APPLICATION    │
│ ┌────────────────────┐   │
│ │ Node.js + Express  │   │
│ │ Running on:        │   │
│ │ AWS EC2 / Heroku   │   │
│ │ Docker Container   │   │
│ │ Env: Production    │   │
│ └────────────────────┘   │
└──────────────────────────┘
```

#### Layer 5: Data Layer (Orange)
```
┌─────────────────────────────┐
│   DATA & STORAGE            │
│ ┌────────────────────────┐  │
│ │ PostgreSQL Database    │  │
│ │ AWS RDS / Cloud SQL    │  │
│ │ Backup: Daily         │  │
│ └────────────────────────┘  │
│ ┌────────────────────────┐  │
│ │ File Storage           │  │
│ │ AWS S3 / Supabase      │  │
│ │ Documents, Avatars     │  │
│ └────────────────────────┘  │
└─────────────────────────────┘
```

#### Layer 6: External Services (Rouge)
```
┌──────────────────────────┐
│  EXTERNAL INTEGRATIONS   │
│ ┌────────────────────┐   │
│ │ Stripe (Payments)  │   │
│ │ SendGrid (Email)   │   │
│ │ Tesseract (OCR)    │   │
│ └────────────────────┘   │
└──────────────────────────┘
```

### Flow Diagram:
```
User Browser
    ↓ HTTPS
Vercel CDN (Static assets)
    ↓ API Calls (fetch/axios)
API Gateway (Rate limit, CORS)
    ↓ HTTP
Node.js Server
    ├─ Process request
    ├─ Validate auth
    └─ Query Database / Call External APIs
    ↓
PostgreSQL DB (Read/Write)
External Services (Email, Payments, etc.)
    ↓
Send response to Browser
```

### Monitoring & Logs:
```
┌──────────────────────────────┐
│  MONITORING & OBSERVABILITY  │
│ ├─ Datadog (APM)             │
│ ├─ CloudWatch (Logs)         │
│ ├─ Sentry (Error Tracking)   │
│ └─ Uptime Robot (Health)     │
└──────────────────────────────┘
```

---

## 🎯 DIAGRAMME 11: USER JOURNEY MAP - WORKER

**Type**: Journey Map  
**Taille Canvas**: 1600x900  
**Couleur Fond**: Gris clair

### Timeline (Du haut vers le bas):

```
STAGE 1: DISCOVERY
├─ Touchpoint: SociaLink Website
├─ Actions: Browse, Read testimonials
├─ Emotions: ✅ Interested, ❓ Curious
├─ Pain Points: None yet
└─ Opportunity: Clear call-to-action

STAGE 2: REGISTRATION
├─ Touchpoint: Register Form
├─ Actions: Fill profile, Select type (Worker)
├─ Emotions: ✅ Hopeful, ⚠️ Some uncertainty
├─ Pain Points: Password requirements complex?
└─ Opportunity: Inline help text

STAGE 3: EMAIL VERIFICATION
├─ Touchpoint: Email + OTP Code
├─ Actions: Check email, Enter 6-digit code
├─ Emotions: ⚠️ Waiting, ❓ Expecting confirmation
├─ Pain Points: Email delay? OTP expiration?
└─ Opportunity: Resend button, Clear expiry time

STAGE 4: ADMIN VALIDATION (PENDING)
├─ Touchpoint: Dashboard (Limited access)
├─ Actions: Complete profile, Upload documents
├─ Emotions: ⚠️ Uncertain about wait time
├─ Pain Points: Can't use full features yet
└─ Opportunity: Show estimated validation time

STAGE 5: ADMIN APPROVAL
├─ Touchpoint: Email notification
├─ Actions: Receive approval
├─ Emotions: ✅ Excited, Ready to use platform
├─ Pain Points: Wait time frustration
└─ Opportunity: Celebrate approval!

STAGE 6: PROFILE COMPLETION
├─ Touchpoint: Dashboard, Add Experience
├─ Actions: Add work history, Skills, Calendar
├─ Emotions: ✅ Engaged, 💪 In control
├─ Pain Points: Remembering old job dates?
└─ Opportunity: Date picker, Auto-fill

STAGE 7: DOCUMENT UPLOAD
├─ Touchpoint: Documents section
├─ Actions: Upload diplomas, Certificates
├─ Emotions: ✅ Confident, Secure
├─ Pain Points: File format restrictions?
└─ Opportunity: Drag-and-drop, Clear specs

STAGE 8: MISSION DISCOVERY
├─ Touchpoint: Search & Filter page
├─ Actions: Browse missions, Apply filters
├─ Emotions: ✅ Excited, 🔍 Exploring
├─ Pain Points: Too many results? Wrong filters?
└─ Opportunity: Saved filters, Smart recommendations

STAGE 9: MISSION APPLICATION
├─ Touchpoint: Mission detail + Apply button
├─ Actions: Click apply, Instant confirmation
├─ Emotions: ✅ Hopeful, 🎯 Taking action
├─ Pain Points: Worry about rejection
└─ Opportunity: Success animation, Next steps

STAGE 10: AWAITING RESPONSE
├─ Touchpoint: Dashboard, Notifications
├─ Actions: Monitor applications
├─ Emotions: ⚠️ Anxious, Waiting
├─ Pain Points: Not knowing status
└─ Opportunity: Clear status + ETA

STAGE 11: APPLICATION ACCEPTED
├─ Touchpoint: Notification + Dashboard
├─ Actions: View mission details, Confirm availability
├─ Emotions: ✅ Thrilled! 💪 Confident
├─ Pain Points: Now have to arrange logistics
└─ Opportunity: Contact info, Onboarding guide

STAGE 12: MISSION EXECUTION
├─ Touchpoint: Calendar, Timeline
├─ Actions: Track mission progress, Update calendar
├─ Emotions: ✅ Professional, Engaged
├─ Pain Points: Need to track hours? Communication?
└─ Opportunity: Task checklist, Messaging

STAGE 13: MISSION COMPLETION
├─ Touchpoint: Dashboard notification
├─ Actions: Mission marked complete
├─ Emotions: ✅ Accomplished, Satisfied
├─ Pain Points: Hope establishment was satisfied
└─ Opportunity: Celebration, Certificate?

STAGE 14: REVIEW PHASE
├─ Touchpoint: Review request from Establishment
├─ Actions: View review, Can respond
├─ Emotions: 😊 If positive, 😟 If negative
├─ Pain Points: Unfair review?
└─ Opportunity: Response option, Appeals process

STAGE 15: FUTURE MISSIONS
├─ Touchpoint: Profile with history & ratings
├─ Actions: Better ranking for next mission
├─ Emotions: ✅ Proud, Motivated
├─ Pain Points: Want to improve rating
└─ Opportunity: Feedback, Improvement tips

STAGE 16: PREMIUM UPGRADE
├─ Touchpoint: Subscription recommendation
├─ Actions: View Premium benefits
├─ Emotions: 💭 Considering investment
├─ Pain Points: Worth the cost?
└─ Opportunity: Free trial, Clear ROI
```

### Metrics Row:
```
Satisfaction: [0%]──────────────────[100%]
Effort: [High]──────────────────[Low]
Confidence: [Low]──────────────────[High]
```

---

## 💰 DIAGRAMME 12: SUBSCRIPTION TIERS COMPARISON

**Type**: Comparison Table / Matrix  
**Taille Canvas**: 1400x900  
**Couleur Fond**: Blanc

### Structure 3 Colonnes:

```
┌──────────────────────┬──────────────────────┬──────────────────────┐
│       BASIC          │      PREMIUM         │        PRO           │
│   (Gratuit)          │   (149 DH/mois)      │   (499 DH/mois)      │
├──────────────────────┼──────────────────────┼──────────────────────┤
│ For: Starting workers│ For: Active workers  │ For: Pro establishments
│                      │                      │                      │
│ ✅ FEATURES          │ ✅ FEATURES          │ ✅ FEATURES          │
│ ├─ Profile création  │ ├─ Tout du Basic     │ ├─ Tout du Premium   │
│ ├─ Doc upload (5MB)  │ ├─ Featured profile  │ ├─ Advanced analytics│
│ ├─ Apply missions    │ ├─ No ads            │ ├─ Priority support  │
│ ├─ View calendar     │ ├─ Advanced filters  │ ├─ Candidate export  │
│ ├─ Receive reviews   │ ├─ Match scoring 💡  │ ├─ Bulk operations   │
│ └─ Basic ratings     │ └─ Video interviews  │ └─ API access        │
│                      │                      │                      │
│ ⛔ LIMITATIONS       │ ⛔ LIMITATIONS       │ ⛔ LIMITATIONS       │
│ ├─ Max 5 missions/mo │ ├─ Max 50 apps/mo    │ ├─ None              │
│ ├─ Ads shown         │ ├─ Featured for 30d  │ └─ None              │
│ ├─ Limited reach     │ └─ 1 month cycle     │                      │
│ └─ 1 month support   │                      │ 📊 STATS             │
│                      │ 📊 STATS             │ ├─ Detailed reports  │
│ 📊 STATS             │ ├─ Monthly review    │ ├─ Monthly export    │
│ ├─ Basic metrics     │ ├─ Match history     │ └─ API webhooks      │
│ └─ Profile views     │ └─ Trend analysis    │                      │
│                      │                      │ 🎯 USE CASE          │
│ 🎯 USE CASE          │ 🎯 USE CASE          │ ├─ Crèches           │
│ ├─ Students          │ ├─ Experienced       │ ├─ EHPAD             │
│ ├─ Side income       │ ├─ Active seekers    │ ├─ Large networks    │
│ └─ Explorers         │ └─ Career focused    │ └─ Recruiters        │
│                      │                      │                      │
│ 💵 PRICE             │ 💵 PRICE             │ 💵 PRICE             │
│ ├─ 0 DH/month        │ ├─ 149 DH/month      │ ├─ 499 DH/month      │
│ ├─ 0 DH/year         │ ├─ 1,490 DH/year     │ ├─ 4,990 DH/year     │
│ └─ Always free       │ └─ or pay per month  │ └─ or pay per month  │
│                      │                      │                      │
│ ✨ VALUE             │ ✨ VALUE             │ ✨ VALUE             │
│ └─ Try platform      │ └─ Maximize presence │ └─ Complete solution │
└──────────────────────┴──────────────────────┴──────────────────────┘
```

### Feature Comparison Matrix:

```
FEATURE                │  BASIC  │ PREMIUM │   PRO
───────────────────────┼─────────┼─────────┼─────────
Profile Creation       │   ✅    │   ✅    │   ✅
Document Upload        │   ✅    │   ✅    │   ✅
Apply to Missions      │   ✅    │   ✅    │   ✅
Create Missions        │   ❌    │   ✅    │   ✅
Advanced Search Filters│   ❌    │   ✅    │   ✅
Featured Profile       │   ❌    │   ✅    │   ✅
Priority Support       │   ❌    │   ⏱️    │   ✅
Analytics Dashboard    │   ❌    │   ✅    │   ✅
API Access             │   ❌    │   ❌    │   ✅
Video Interviews       │   ❌    │   ✅    │   ✅
Candidate Export       │   ❌    │   ❌    │   ✅
Bulk Operations        │   ❌    │   ❌    │   ✅
```

### Benefits Summary:

```
┌─────────────────────────────────────────────────────┐
│  WHY UPGRADE TO PREMIUM?                            │
│                                                     │
│  📈 Get 10x more visibility                        │
│  ⚡ Access to exclusive missions                   │
│  💬 Direct messaging with establishments           │
│  🎯 AI-powered job recommendations                 │
│  ⭐ Featured profile badge                         │
│  📊 Monthly performance reports                    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  WHY UPGRADE TO PRO?                                │
│                                                     │
│  🚀 Recruit at scale                              │
│  🔧 Full API integration                           │
│  📈 Advanced analytics & reporting                 │
│  👥 Bulk candidate management                      │
│  🎯 Custom workflows                               │
│  📞 VIP support 24/7                               │
└─────────────────────────────────────────────────────┘
```

### Conversion Funnel:

```
1. AWARENESS
   BASIC Users aware Premium exists
   
2. CONSIDERATION
   User sees Premium benefits
   "Should I upgrade?"
   
3. DECISION
   Cost vs. Benefit analysis
   "Is 149 DH worth it?"
   
4. ACTION
   Click "Upgrade" button
   Stripe payment
   
5. RETENTION
   Premium features unlock
   Higher engagement
   Lifetime value increases
```

---

## 📋 RÉSUMÉ DIAGRAMMES

| # | Nom | Type | Éléments | Temps Création |
|---|-----|------|----------|-----------------|
| 1 | Architecture Globale | System | 6 boxes + connexions | 15 min |
| 2 | Flux Authentification | Flowchart | 15 étapes + décisions | 20 min |
| 3 | Workflow Candidatures | State Machine | 3 swim lanes + transitions | 15 min |
| 4 | Entity-Relationship | Database | 8 entités + relations | 25 min |
| 5 | Use Case Diagram | UML | 30 use cases + 5 acteurs | 20 min |
| 6 | State Machine Missions | State | 6 états + transitions | 15 min |
| 7 | Data Flow (DFD) | DFD | 4 processes + stores | 20 min |
| 8 | Component Hierarchy | Tree | 4 layouts + 30+ pages | 15 min |
| 9 | API Endpoints Map | Architecture | 50+ endpoints | 20 min |
| 10 | Deployment Architecture | Infrastructure | 6 layers | 15 min |
| 11 | User Journey Map | UX | 16 stages + metrics | 30 min |
| 12 | Subscription Comparison | Table | 3 tiers + features | 15 min |

**Temps total estimé: ~3 heures**

---

## 🎯 ÉTAPES POUR EXPORTER

Pour chaque diagramme créé:

1. **Créer le diagramme** selon les spécifications ci-dessus
2. **Exporter en PNG**:
   - Fichier → Export → PNG
   - Largeur: 1200px (minimum)
   - Résolution: 150 DPI
3. **Renommer**: `Diagramme_0X_NomDuDiagramme.png`
4. **Sauvegarder** dans: `/Rapport/diagrammes/`

**Exemple**:
- `Diagramme_01_Architecture_Globale.png`
- `Diagramme_02_Flux_Authentification.png`
- `Diagramme_03_Workflow_Candidatures.png`
- etc.

---

## 💡 CONSEILS CREATION ERASER

✅ **DO**:
- Utiliser des couleurs distinctes par module
- Grouper les éléments logiquement
- Ajouter des légendes claires
- Alignement propre, espacement régulier

❌ **DON'T**:
- Trop de texte par élément
- Lignes croisées chaotiques
- Couleurs trop pâles (difficilement lisibles)
- Polices trop petites

---

**Total: 12 Diagrammes pour un rapport professionnel complet**
