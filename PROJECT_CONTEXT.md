# 🎯 SociaLink V4 - Contexte Projet

> **Document à partager avec l'IA lors de nouvelles sessions**  
> **Dernière mise à jour** : 12 Janvier 2026

---

## 📋 Résumé du Projet

SociaLink est une **plateforme de mise en relation** entre travailleurs sociaux (aides-soignants, éducateurs, etc.) et établissements (crèches, EHPAD, centres sociaux) au Maroc.

### Objectif Principal
Faciliter le recrutement dans le secteur social avec :
- Publication de missions par les établissements
- Candidatures des travailleurs
- Système de validation admin
- Abonnements (Basic/Premium/Pro)

---

## 🛠️ Stack Technique

### Backend
- **Runtime** : Node.js + Express.js
- **ORM** : Prisma
- **Base de données** : PostgreSQL
- **Auth** : JWT + Cookies HTTP-Only + Bcrypt
- **Upload** : Multer (stockage disque local)

### Frontend
- **Framework** : React 18 + Vite
- **Style** : Tailwind CSS
- **Icons** : Lucide React
- **Routing** : React Router DOM

### Ports
- Frontend : `http://localhost:5173`
- Backend : `http://localhost:5001`

---

## 📂 Structure du Projet

```
SociaLink_v4-/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma      ← Modèles de données
│   ├── src/
│   │   ├── controllers/       ← Logique métier
│   │   ├── routes/            ← Endpoints API
│   │   ├── middleware/        ← Auth, Upload, etc.
│   │   └── server.js          ← Point d'entrée
│   └── uploads/documents/     ← Fichiers uploadés
│
├── frontend/
│   ├── src/
│   │   ├── pages/             ← Toutes les pages
│   │   │   ├── worker/        ← Dashboard, Calendrier, Documents
│   │   │   ├── establishment/ ← Missions, Candidatures
│   │   │   ├── admin/         ← Validation, Modération
│   │   │   └── auth/          ← Login, Register, OTP
│   │   ├── components/        ← Layouts, Navbar, etc.
│   │   ├── hooks/             ← useAuth, etc.
│   │   └── api/               ← Client Axios
│   └── public/
│
├── AUDIT.md                   ← Audit complet du projet
├── SYSTEMES.md                ← Documentation des systèmes
└── PROJECT_CONTEXT.md         ← CE FICHIER
```

---

## ✅ Ce qui est FAIT (Fonctionnel)

### Backend
- [x] Authentification complète (register, login, OTP, reset password)
- [x] CRUD Missions avec filtres
- [x] Système de candidatures
- [x] Validation profils par admin
- [x] Système d'abonnements (logique, pas paiement réel)
- [x] Évaluations post-mission
- [x] **Documents avec validation admin** (NEW - 11/01/2026)
- [x] **Calendrier de disponibilité** (NEW - 11/01/2026)
- [x] **Upload fichiers Multer** (5MB, PDF/JPG/PNG)

### Frontend
- [x] 4 Layouts : Worker, Establishment, Admin, SuperAdmin
- [x] Dashboard complet pour chaque rôle
- [x] Page missions avec filtres avancés
- [x] **WorkerCalendar.jsx** - Calendrier avec jours fériés marocains
- [x] **WorkerDocuments.jsx** - Gestion documents avec badges statut

---

## 🔄 En Cours / Planifié

### Prochaines étapes immédiates
1. **Redesign WorkerDashboard** - Mini-calendrier, profil LinkedIn-like
2. **Carte OpenStreetMap** - Zone de disponibilité géographique
3. **Profil public worker** - Vue pour les recruteurs

### V5 (Future)
- [ ] Paiements réels (Stripe)
- [ ] Messagerie temps réel (Socket.io)
- [ ] Stockage Supabase (au lieu du disque local)
- [ ] Tests automatisés

---

## 🔑 Comptes de Test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Super Admin | superadmin@socialink.ma | superadmin123 |
| Admin | admin@socialink.ma | admin123 |
| Worker Premium | worker.premium@test.ma | Test123! |
| Worker Basic | worker.basic@test.ma | Test123! |
| Établissement | establishment@test.ma | Test123! |

---

## 📌 Préférences Utilisateur

Ces choix ont été validés avec l'utilisateur :

| Choix | Décision |
|-------|----------|
| Carte géoloc | OpenStreetMap (pas Google Maps) |
| Calendrier | Composant custom (pas FullCalendar) |
| OCR diplômes | Semi-automatique (extraction + validation manuelle) |
| Documents | Validation admin obligatoire avec badges |
| Stockage | Disque local maintenant, Supabase plus tard |
| Upload max | 5 MB |

---

## 🚀 Commandes Utiles

### Démarrer le projet
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Base de données
```bash
cd backend
npx prisma generate  # Régénérer le client
npx prisma db push   # Appliquer les changements de schema
npx prisma studio    # Interface visuelle DB
```

### Seed (données de test)
```bash
cd backend
npx prisma db seed
```

---

## 📁 Fichiers Clés à Connaître

| Fichier | Importance |
|---------|------------|
| `backend/prisma/schema.prisma` | Modèles de données |
| `backend/src/server.js` | Configuration Express |
| `frontend/src/App.jsx` | Routes React |
| `frontend/src/components/WorkerLayout.jsx` | Navigation worker |
| `frontend/src/pages/worker/WorkerCalendar.jsx` | Calendrier |
| `frontend/src/pages/worker/WorkerDocuments.jsx` | Documents |

---

## 💬 Comment Reprendre

Quand vous démarrez une nouvelle conversation, dites simplement :

> "Je continue le projet SociaLink V4. Voici le contexte du projet : [coller le contenu de ce fichier ou le chemin]. Je veux [décrire ce que vous voulez faire]."

Ou plus court :

> "Je travaille sur SociaLink V4. Lis le fichier PROJECT_CONTEXT.md à la racine du projet pour comprendre le contexte, puis [votre demande]."

---

## 📝 Notes Importantes

1. **Le backend écoute sur le port 5001** (pas 5000)
2. **Les admins doivent avoir isEmailVerified=true** pour se connecter
3. **Après modification du schema Prisma**, toujours faire `npx prisma generate`
4. **Les fichiers uploadés** vont dans `backend/uploads/documents/{userId}/`
5. **Le frontend utilise un proxy** vers le backend via Vite

---

*Mise à jour : 12 Janvier 2026 à 03:45*
