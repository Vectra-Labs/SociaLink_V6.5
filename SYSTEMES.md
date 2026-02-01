# 📋 SociaLink V4 - Documentation des Systèmes

> **Projet** : SociaLink - Plateforme de mise en relation sociale  
> **Version** : V4  
> **Date** : 11 Janvier 2026  
> **Statut** : En production

---

## 📊 Vue d'Ensemble

SociaLink est une plateforme de mise en relation entre **travailleurs sociaux** et **établissements** (crèches, EHPAD, centres sociaux, etc.). Elle permet de faciliter le recrutement et la gestion des missions dans le secteur social.

### Métriques Clés

| Élément | Quantité |
|---------|----------|
| Controllers Backend | 13 |
| Routes API | 12+ |
| Pages Frontend | 42+ |
| Composants réutilisables | 18 |
| Modèles de données (Prisma) | 25+ |

---

## 🔐 1. Système d'Authentification

### 1.1 Fonctionnalités

| Fonction | Description | Status |
|----------|-------------|--------|
| Inscription Worker | Formulaire multi-étapes avec validation | ✅ |
| Inscription Établissement | Formulaire dédié avec SIRET | ✅ |
| Connexion sécurisée | JWT + Cookies HTTP-Only | ✅ |
| Vérification email | Code OTP à 6 chiffres | ✅ |
| Mot de passe oublié | Reset par email avec token | ✅ |
| Protection par rôle | Middleware d'autorisation | ✅ |

### 1.2 Rôles Utilisateurs

- **WORKER** : Travailleurs sociaux cherchant des missions
- **ESTABLISHMENT** : Établissements publiant des offres
- **ADMIN** : Administrateurs validant les profils
- **SUPER_ADMIN** : Gestionnaires de la plateforme

---

## 👤 2. Gestion des Profils

### 2.1 Profil Travailleur

| Élément | Description | Status |
|---------|-------------|--------|
| Informations personnelles | Nom, prénom, photo, contact | ✅ |
| Biographie | Présentation professionnelle | ✅ |
| Expériences | Historique professionnel | ✅ |
| Compétences | Tags de spécialités | ✅ |
| Diplômes (legacy) | Upload et gestion | ✅ |
| Documents vérifiés | Avec validation admin | ✅ 🆕 |
| Calendrier | Disponibilités et RDV | ✅ 🆕 |
| Zone géographique | Rayon d'intervention | ✅ 🆕 |

### 2.2 Profil Établissement

| Élément | Description | Status |
|---------|-------------|--------|
| Informations structure | Nom, type, adresse | ✅ |
| Contact référent | Responsable des recrutements | ✅ |
| Logo | Image de marque | ✅ |
| Missions publiées | Liste des offres | ✅ |
| Statistiques | Candidatures, missions | ✅ |

---

## 📋 3. Système de Missions

### 3.1 Création et Gestion

| Fonction | Description | Status |
|----------|-------------|--------|
| Création de mission | Formulaire complet | ✅ |
| Modification | Édition post-publication | ✅ |
| Suppression | Avec confirmation | ✅ |
| Clôture | Fin de recrutement | ✅ |

### 3.2 Types de Contrats

- CDI (Contrat à Durée Indéterminée)
- CDD (Contrat à Durée Déterminée)
- Intérim
- Stage
- Bénévolat
- Freelance

### 3.3 Filtres de Recherche

| Filtre | Description |
|--------|-------------|
| Région | 12 régions du Maroc |
| Secteur | Petite enfance, EHPAD, Handicap, etc. |
| Type de contrat | CDI, CDD, Intérim, etc. |
| Salaire | Fourchette min-max |
| Urgence | Missions urgentes |
| Expérience | Niveau requis |

---

## 📝 4. Système de Candidatures

### 4.1 Workflow

```
[Worker postule] → [PENDING] → [Établissement examine]
                                    ↓
                    [ACCEPTED] ←→ [REJECTED]
                        ↓
                [Mission en cours]
                        ↓
                [Mission terminée]
                        ↓
                 [Évaluation mutuelle]
```

### 4.2 Fonctionnalités

| Fonction | Description | Status |
|----------|-------------|--------|
| Postuler | Envoi de candidature | ✅ |
| Accepter | Par l'établissement | ✅ |
| Refuser | Avec motif optionnel | ✅ |
| Historique | Suivi des candidatures | ✅ |
| Notifications | Alertes en temps réel | ✅ |

---

## ⭐ 5. Système d'Évaluations

### 5.1 Mécanisme

- Les établissements notent les workers après chaque mission
- Les workers peuvent noter les établissements
- Notes de 1 à 5 étoiles
- Commentaires obligatoires

### 5.2 Impact

| Élément | Effet |
|---------|-------|
| Note moyenne | Affichée sur le profil |
| Historique | Visible par les recruteurs |
| Réputation | Influence sur la visibilité |

---

## 💳 6. Système d'Abonnements

### 6.1 Plans Disponibles

| Plan | Prix | Avantages |
|------|------|-----------|
| **BASIC** | Gratuit | 3 missions visibles, candidatures limitées |
| **PREMIUM** | 99 DH/mois | Missions illimitées, priorité |
| **PRO** | 199 DH/mois | Tout Premium + badge vérifié + support |

### 6.2 Limitations BASIC

- Accès à 3 missions complètes maximum
- Missions suivantes masquées/floues
- Incitation à passer Premium

### 6.3 Paiements

| Fonction | Status |
|----------|--------|
| Logique d'abonnement | ✅ |
| Gestion des plans | ✅ |
| Interface paiement | ✅ |
| Paiement réel (Stripe) | ⏳ V5 |

---

## 📄 7. Système de Documents (NOUVEAU)

### 7.1 Types Supportés

| Type | Description | Usage |
|------|-------------|-------|
| DIPLOMA | Diplôme | Prouver les qualifications |
| CIN | Carte d'identité | Vérification identité |
| CASIER_JUDICIAIRE | Casier judiciaire | Exigence légale |
| ATTESTATION_TRAVAIL | Attestation employeur | Expérience vérifiée |
| CARTE_CNSS | Carte CNSS | Couverture sociale |
| CERTIFICATE | Certificat/Formation | Compétences additionnelles |
| OTHER | Autre document | Cas particuliers |

### 7.2 Workflow de Validation

```
[Upload par Worker] → [PENDING] → [Admin examine]
                                       ↓
                     [VERIFIED ✅] ←→ [REJECTED ❌]
                          ↓                ↓
                    [Badge affiché]   [Notification + motif]
```

### 7.3 Spécifications Techniques

| Paramètre | Valeur |
|-----------|--------|
| Taille max | 5 MB |
| Formats | PDF, JPG, PNG, WEBP |
| Stockage | Disque local (→ Supabase V5) |
| Organisation | Dossier par utilisateur |

---

## 📅 8. Système de Calendrier (NOUVEAU)

### 8.1 Fonctionnalités

| Fonction | Description | Status |
|----------|-------------|--------|
| Vue mensuelle | Navigation mois par mois | ✅ |
| Types d'événements | Disponible, Occupé, Bloqué | ✅ |
| Jours fériés | Marocains 2025-2026 | ✅ |
| Création rapide | Clic sur date | ✅ |
| Suppression | Clic sur événement | ✅ |

### 8.2 Jours Fériés Intégrés

- 1er Janvier : Jour de l'An
- 11 Janvier : Manifeste de l'Indépendance
- 1er Mai : Fête du Travail
- 30 Juillet : Fête du Trône
- Aïd al-Fitr (dates variables)
- Aïd al-Adha (dates variables)
- Et plus...

---

## 👨‍💼 9. Administration

### 9.1 Tableau de Bord Admin

| Section | Fonction |
|---------|----------|
| Validations | Approuver/rejeter les profils |
| Documents | Vérifier les justificatifs |
| Litiges | Gérer les signalements |
| Notifications | Centre de messages |
| Messagerie | Communication avec utilisateurs |

### 9.2 Actions Disponibles

- Valider un profil worker
- Rejeter avec motif
- Suspendre un compte
- Vérifier un document
- Rejeter un document avec raison
- Répondre aux litiges

---

## 👑 10. Super Administration

### 10.1 Dashboard Global

| KPI | Description |
|-----|-------------|
| Utilisateurs totaux | Tous rôles confondus |
| Nouvelles inscriptions | Par période |
| Revenus | Abonnements et paiements |
| Missions actives | En cours de recrutement |
| Taux de conversion | Gratuit → Premium |

### 10.2 Modules

| Module | Fonction |
|--------|----------|
| Utilisateurs | CRUD complet tous rôles |
| Admins | Gestion des administrateurs |
| Abonnements | Plans et configurations |
| Finance | Logs paiements, revenus |
| Marketing | Bannières promotionnelles |
| Qualité | Métriques de service |
| Litiges | Arbitrage des conflits |
| Paramètres | Configuration système |

---

## 🏗️ Architecture Technique

### Backend

```
Node.js + Express.js
    ↓
Prisma ORM
    ↓
PostgreSQL
```

### Frontend

```
React 18 + Vite
    ↓
Tailwind CSS
    ↓
Lucide Icons
```

### Authentification

```
JWT (Access Token)
    +
Cookies HTTP-Only (Refresh Token)
    +
Bcrypt (Password Hashing)
```

---

## 📈 Roadmap

### V4 (Actuelle) ✅

- [x] Système complet d'authentification
- [x] Gestion des profils enrichis
- [x] Système de missions et candidatures
- [x] Administration et Super Administration
- [x] Système d'abonnements
- [x] Documents avec validation admin
- [x] Calendrier de disponibilité

### V5 (Planifiée)

- [ ] Paiements réels (Stripe)
- [ ] Messagerie temps réel (Socket.io)
- [ ] Stockage cloud (Supabase)
- [ ] Carte de localisation (OpenStreetMap)
- [ ] Tests automatisés

### V6 (Future)

- [ ] Application mobile (PWA/React Native)
- [ ] Push Notifications
- [ ] IA matching (recommandations)

---

## 📞 Support

Pour toute question technique :
- Email : support@socialink.ma
- Documentation API : /api-docs (Swagger)

---

*Document généré le 11 Janvier 2026*
*SociaLink V4 - Tous droits réservés*
