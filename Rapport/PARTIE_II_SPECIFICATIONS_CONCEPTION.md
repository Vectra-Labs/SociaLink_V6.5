# PARTIE II : SPÉCIFICATIONS ET CONCEPTION

**Document de Rapport de Fin de Formation**  
**Projet SociaLink V6.5**  
**Février 2026**

---

## 2.1 Analyse du Cahier des Charges (Besoin Initial)

### 2.1.1 Contexte et Justification

#### Le Problème Identifié
Au Maroc, le secteur social (crèches, EHPAD, centres de services à la personne) fait face à plusieurs défis :

1. **Manque de professionnels qualifiés** : Difficulté à recruter rapidement des travailleurs sociaux compétents
2. **Fragmentation du marché** : Absence de plateforme centralisée de mise en relation
3. **Problèmes de qualité** : Pas de mécanisme fiable de vérification et de validation des compétences
4. **Inefficacité administrative** : Processus de recrutement long et coûteux

#### La Vision SociaLink
Créer un **marketplace innovant** qui :
- Connecte les establishments avec des professionnels hautement qualifiés
- Garantit une qualité de service via un système de labellisation
- Limite la multiplication des intervenants (enjeu de continuité de soins)
- Offre une solution numérique simple et accessible

### 2.1.2 Objectifs Fonctionnels Principaux

#### Objectif 1 : Authentification et Gestion des Rôles
| Critère | Description | Validé |
|---------|-------------|--------|
| **Inscription multicanal** | Workflow distinct pour workers et establishments | ✅ |
| **Vérification email** | OTP à 6 chiffres avec expiration | ✅ |
| **Authentification sécurisée** | JWT + Cookies HTTP-Only | ✅ |
| **Gestion des rôles** | 4 rôles (Worker, Establishment, Admin, Super Admin) | ✅ |
| **Récupération de mot de passe** | Token avec délai d'expiration | ✅ |

#### Objectif 2 : Profils Enrichis et Validation
| Critère | Description | Validé |
|---------|-------------|--------|
| **Profil Worker complet** | Infos perso, expériences, diplômes, documents | ✅ |
| **Upload de documents** | PDF, JPG, PNG jusqu'à 5MB | ✅ |
| **Validation admin** | Workflow de vérification des qualifications | ✅ |
| **Profil Establishment** | Infos structure, contact, logo, statistiques | ✅ |
| **Données géographiques** | Villes, régions, zone de disponibilité | ✅ |

#### Objectif 3 : Système de Missions
| Critère | Description | Validé |
|---------|-------------|--------|
| **Publication de missions** | Création et gestion complète | ✅ |
| **Types de contrats** | CDI, CDD, Intérim, Stage, Bénévolat, Freelance | ✅ |
| **Filtres avancés** | Région, secteur, salaire, urgence, expérience | ✅ |
| **Recherche intelligente** | Matching par compétences et localisation | ✅ |
| **Statuts de mission** | DRAFT, PUBLISHED, IN_PROGRESS, COMPLETED, CLOSED | ✅ |

#### Objectif 4 : Système de Candidatures
| Critère | Description | Validé |
|---------|-------------|--------|
| **Postulation en un clic** | Interface fluide et intuitive | ✅ |
| **Gestion des candidatures** | Acceptance/Rejection avec notifications | ✅ |
| **Notifications temps réel** | Alertes push et email | ✅ |
| **Historique** | Suivi complet du workflow | ✅ |
| **Limitations par plan** | Restrictions BASIC/PREMIUM | ✅ |

#### Objectif 5 : Système de Qualité et Évaluations
| Critère | Description | Validé |
|---------|-------------|--------|
| **Notes et commentaires** | 1-5 étoiles avec feedback obligatoire | ✅ |
| **Profils publics** | Consultation des évaluations reçues | ✅ |
| **Réputation worker** | Note moyenne affichée sur profil | ✅ |
| **Gestion des disputes** | System d'arbitrage admin | ✅ |

#### Objectif 6 : Système d'Abonnements
| Critère | Description | Validé |
|---------|-------------|--------|
| **Plans tarifés** | BASIC (Gratuit), PREMIUM (99 DH), PRO (199 DH) | ✅ |
| **Limitations BASIC** | 3 missions visibles max, candidatures limitées | ✅ |
| **Gestion des paiements** | Infrastructure préparée pour Stripe V5 | ✅ |
| **Facturation** | Modèle d'abonnement mensuel | ✅ |

### 2.1.3 Objectifs Non-Fonctionnels

| Objectif | Spécification | Justification |
|----------|---------------|---------------|
| **Sécurité** | RGPD, chiffrement AES-256, Bcrypt | Données sensibles (CV, contacts) |
| **Performance** | Temps réponse < 500ms, SPA fluide | Expérience utilisateur fluide |
| **Scalabilité** | Architecture modulaire MERN | Croissance future |
| **Accessibilité** | Responsive design, standards WCAG | Multi-appareils (mobile/desktop) |
| **Maintenabilité** | Code modulaire, tests E2E | Évolution long terme |

---

## 2.2 Acteurs et Rôles du Système

### 2.2.1 Typologies d'Utilisateurs

```
┌─────────────────────────────────────────────────────────────┐
│                    ÉCOSYSTÈME SOCIALINK                     │
├─────────────────┬──────────────────┬──────────────────────┤
│   TRAVAILLEURS  │  ÉTABLISSEMENTS  │   ADMINISTRATEURS    │
│   (Workers)     │  (Employers)     │   (Admins)           │
└─────────────────┴──────────────────┴──────────────────────┘
```

### 2.2.2 Détail des Rôles

#### A. **WORKER** (Travailleur Social Indépendant)

**Caractéristiques principales :**
- Type de compte : Travailleur autonome ou salarié en recherche
- Activité : Cherche des missions temporaires ou permanentes
- Qualifications : Diplômes + expériences professionnelles vérifiées

**Permissions et droits :**
```
Authentification:
├── Inscription avec email + mot de passe
├── Vérification email (OTP)
├── Gestion du mot de passe
└── Déconnexion sécurisée

Profil:
├── Modifier infos personnelles
├── Télécharger CV
├── Ajouter expériences professionnelles
├── Ajouter diplômes et documents
├── Gérer disponibilités (calendrier)
├── Définir zone géographique
└── Statut: PENDING → IN_REVIEW → VALIDATED/REJECTED

Missions:
├── Rechercher missions (avec filtres)
├── Voir détails mission (selon abonnement)
├── Postuler à missions
├── Voir mes candidatures
└── Gérer statut candidature

Communications:
├── Recevoir notifications
├── Accéder messagerie
├── Consulter profil public
└── Voir ses évaluations

Abonnement:
├── Plan BASIC (gratuit): 3 missions, 3 candidatures/mois
├── Plan PREMIUM (99 DH): missions illimitées
└── Plan PRO (199 DH): tout PREMIUM + badge
```

**Limitations BASIC :**
- Voir seulement 3 missions complètes
- Les suivantes sont masquées avec invitation Premium
- Max 3 candidatures/mois
- Pas accès missions urgentes
- Délai de visibilité : 48h pour missions < 48h

---

#### B. **ESTABLISHMENT** (Établissement Employeur)

**Caractéristiques principales :**
- Type de structure : Crèche, EHPAD, centre social, etc.
- Objectif : Publier des offres et recruter des professionnels
- Vérification : Documents SIRET/ICE requis

**Permissions et droits :**
```
Authentification:
├── Inscription avec email + mot de passe
├── Vérification email (OTP)
├── Gestion du mot de passe
└── Déconnexion sécurisée

Profil Entreprise:
├── Modifier infos structure (nom, adresse, contact)
├── Télécharger logo et banner
├── Ajouter présentation entreprise
├── Mettre à jour documents légaux
└── Statut: PENDING → VERIFIED/REJECTED

Missions:
├── Créer nouvelle mission
├── Modifier mission (avant publication)
├── Publier mission
├── Voir candidatures reçues
├── Accepter/Refuser candidatures
├── Clôturer mission
└── Archiver mission

Communications:
├── Recevoir notifications candidatures
├── Messagerie avec workers
├── Envoyer invitations personnalisées
└── Recevoir évaluations

Abonnement:
├── Plan STARTER (gratuit): 3 missions max, 20 cand/mois
├── Plan BUSINESS (299 DH): missions illimitées
└── Plan ENTERPRISE (799 DH): + API + Account Manager
```

---

#### C. **ADMIN** (Administrateur)

**Caractéristiques principales :**
- Rôle : Modération et validation des utilisateurs
- Supervision : Qualité des profils et missions
- Arbitrage : Gestion des disputes

**Permissions et droits :**
```
Dashboard Admin:
├── Vue d'ensemble plateforme
├── Statistiques (actifs, missions, évaluations)
├── Graphiques tendances
└── Alertes systèmes

Gestion Utilisateurs:
├── Consulter liste workers
├── Consulter liste establishments
├── Valider/Rejeter profils workers
├── Valider/Rejeter profils establishments
├── Vérifier documents uploadés
├── Suspendre utilisateurs
└── Réinitialiser mots de passe

Gestion Missions:
├── Consulter toutes missions
├── Voir candidatures
├── Modérer contenu
├── Archiver missions
├── Générer rapports
└── Analyser trends

Support:
├── Accéder messagerie admin
├── Traiter disputes
├── Répondre tickets support
└── Gérer plaintes

Permissions Admin (Système JSON):
├── CAN_VALIDATE (valider profils)
├── CAN_MODERATE (modérer contenu)
├── CAN_MANAGE_DISPUTES (arbitrage)
├── CAN_VIEW_ANALYTICS (statistiques)
├── CAN_MANAGE_ADMINS (gérer admins - super admin only)
└── CAN_MANAGE_SYSTEM (config système - super admin only)
```

---

#### D. **SUPER_ADMIN** (Super Administrateur)

**Caractéristiques principales :**
- Rôle : Gestion complète de la plateforme
- Autorité : Superviseur de tous les administrateurs
- Pouvoir : Configuration système et finance

**Permissions et droits :**
```
Tout ce que fait ADMIN +

Dashboard Super Admin:
├── MRR (Monthly Recurring Revenue)
├── Metrics financières complètes
├── Santé système
├── Alertes critiques
└── Audit trail complet

Gestion Administrateurs:
├── Créer/Éditer/Supprimer admins
├── Assigner permissions (JSON)
├── Consulter activité des admins
├── Révoquer accès
└── Générer rapports d'activité

Gestion Système:
├── Configurer paramètres globaux
├── Gérer plans abonnement
├── Paramètres monétisation
├── Upload limites
├── Délais d'expiration tokens
├── Régions et villes
└── Structures types

Gestion Financière:
├── Transactions/Paiements
├── Facturation
├── Remboursements
├── Rapports financiers
└── Commissions

Marketing & Communication:
├── Créer bannières promotionnelles
├── Envoyer notifications globales
├── Gérer campagnes emails
├── Analytics campagnes
└── Gestion contenus

Audit & Conformité:
├── Logs d'activités utilisateurs
├── Logs API
├── Logs authentification
├── Audit trail complet
└── Export données RGPD
```

---

### 2.2.3 Matrice de Permissions

| Fonction | Worker | Establishment | Admin | Super Admin |
|----------|--------|--------------|-------|------------|
| **Créer profil** | ✅ | ✅ | - | - |
| **Créer mission** | ❌ | ✅ | ❌ | ❌ |
| **Postuler mission** | ✅ | ❌ | ❌ | ❌ |
| **Accepter candidature** | ❌ | ✅ | ❌ | ❌ |
| **Valider profil** | ❌ | ❌ | ✅ | ✅ |
| **Gérer admins** | ❌ | ❌ | ❌ | ✅ |
| **Config système** | ❌ | ❌ | ❌ | ✅ |
| **Voir analytics** | ❌ | ✅ (limited) | ✅ | ✅ |
| **Évaluer** | ✅ | ✅ | ❌ | ❌ |
| **Consulter messages** | ✅ | ✅ | ✅ | ✅ |

---

## 2.3 Conception Fonctionnelle (Use Cases)

### 2.3.1 Diagramme des Cas d'Utilisation

```
                    ┌──────────────────────────────────────┐
                    │       PLATEFORME SOCIALINK           │
                    └──────────────────────────────────────┘
                                   │
        ┌──────────────┬───────────┼───────────┬──────────────┐
        │              │           │           │              │
    ┌────────┐   ┌───────────┐ ┌──────┐  ┌─────────┐  ┌──────────┐
    │ WORKER │   │ESTABLISH. │ │ADMIN │  │ SUPER   │  │ SYSTÈME  │
    │        │   │           │ │      │  │ ADMIN   │  │          │
    └────────┘   └───────────┘ └──────┘  └─────────┘  └──────────┘
        │ │           │ │          │         │            │
        │ └─────┬─────┘ └─────┬────┘        │           │
        │       │             │            │           │
   ┌────┴───────┴─────────┬───┴────────────┼────────────┘
   │                      │                │
```

### 2.3.2 Use Cases Détaillés

#### **UC-01 : Inscription Worker**
```
Acteur principal    : Utilisateur non authentifié
Préconditions       : L'utilisateur n'a pas de compte
Scénario normal     :
    1. Cliquer sur "S'inscrire comme Travailleur"
    2. Remplir formulaire (email, mdp, infos perso)
    3. Recevoir OTP par email
    4. Entrer OTP pour vérifier email
    5. Créer profil initial
    6. Compte créé avec statut PENDING
    
Scénarios alternatifs:
    - Email déjà utilisé → Erreur
    - OTP expiré → Envoyer nouveau code
    - Mot de passe faible → Validation

Post-conditions:
    - Utilisateur avec rôle WORKER créé
    - Status: PENDING (en attente de validation admin)
    - Email vérifié : isEmailVerified = true
```

#### **UC-02 : Inscription Establishment**
```
Acteur principal    : Responsable structure non authentifié
Préconditions       : L'utilisateur n'a pas de compte
Scénario normal     :
    1. Cliquer sur "S'inscrire comme Établissement"
    2. Remplir formulaire (email, mdp, infos entreprise)
    3. Entrer SIRET/ICE
    4. Recevoir et vérifier OTP
    5. Créer profil structure
    6. Compte créé avec statut PENDING
    7. Admin doit vérifier documents légaux
    
Post-conditions:
    - Utilisateur avec rôle ESTABLISHMENT créé
    - Status: PENDING (attente vérification documents)
    - Email vérifié
```

#### **UC-03 : Authentification (Login)**
```
Acteur principal    : Utilisateur existant
Préconditions       : Utilisateur inscrit
Scénario normal     :
    1. Accéder page login
    2. Entrer email et mot de passe
    3. Vérifier credentials
    4. Générer JWT token
    5. Stocker token en cookie HTTP-Only
    6. Rediriger vers dashboard approprié au rôle
    
Scénarios alternatifs:
    - Email inexistant → Message d'erreur
    - Mot de passe incorrect → Erreur (3 essais max?)
    - Compte suspendu → Accès refusé
    - Email non vérifié (admin) → Redirection OTP

Post-conditions:
    - Session active avec JWT
    - User authentifié peut accéder ressources
```

#### **UC-04 : Compléter Profil Worker**
```
Acteur principal    : Worker authentifié
Préconditions       : Compte créé
Scénario normal     :
    1. Accéder page "Mon Profil"
    2. Ajouter infos personnelles (photo, bio, exp)
    3. Télécharger CV (PDF)
    4. Ajouter expériences professionnelles
    5. Ajouter diplômes via documents
    6. Définir compétences/spécialités
    7. Définir zone de disponibilité (rayon km + GPS)
    8. Sauvegarder profil
    9. Notifier admin pour validation
    
Validations:
    - Photo : JPG/PNG max 5MB
    - CV : PDF max 5MB
    - Diplômes : PDF/JPG max 5MB
    - Bio : max 500 caractères
    - Zone géographique : latitude/longitude valides

Post-conditions:
    - Profil enrichi avec documents
    - Status passe à IN_REVIEW (en cours de vérification)
    - Admin notifié pour validation
```

#### **UC-05 : Valider Profil Worker (Admin)**
```
Acteur principal    : Admin
Préconditions       : Worker a IN_REVIEW status
Scénario normal     :
    1. Admin accède dashboard "Profils à valider"
    2. Consulter documents uploadés
    3. Vérifier authenticité (diplômes, CV)
    4. Vérifier absence antécédents
    5. Accepter ou refuser
    6. Écrire commentaire si rejet
    7. Mettre à jour status
    8. Notifier worker
    
Status possibles:
    - VALIDATED : Accepté, peut posturer
    - REJECTED : Refusé avec motif
    
Post-conditions:
    - Worker reçoit notification
    - Si VALIDATED : peut accéder missions
    - Si REJECTED : peut modifier et remettre
```

#### **UC-06 : Créer Mission (Establishment)**
```
Acteur principal    : Establishment authentifié
Préconditions       : Profil établissement VERIFIED
Scénario normal     :
    1. Cliquer "Créer une mission"
    2. Remplir formulaire (titre, description, etc.)
    3. Spécifier critères (compétences, exp, localisation)
    4. Définir détails (type contrat, salaire, durée)
    5. Ajouter label "Urgent" si besoin
    6. Publier mission
    7. Mission visible aux workers (selon filtres)
    
Champs mission:
    ├── Titre (requis)
    ├── Description (requis)
    ├── Type contrat (CDI/CDD/Intérim/Stage/Bénévolat)
    ├── Compétences requises
    ├── Années expérience min
    ├── Salaire (min-max)
    ├── Localisation (région/ville)
    ├── Durée (si CDD)
    ├── Urgent (boolean)
    ├── Date début
    └── Nombre de postes

Post-conditions:
    - Mission créée avec statut PUBLISHED
    - Visible en recherche
    - Workers reçoivent notifications (si match)
```

#### **UC-07 : Rechercher Mission (Worker)**
```
Acteur principal    : Worker authentifié
Préconditions       : Worker profil VALIDATED
Scénario normal     :
    1. Accéder page "Missions"
    2. Voir liste missions avec filtres
    3. Appliquer filtres (région, secteur, salaire)
    4. Voir détails mission
    5. Consulter profil établissement
    6. Postuler en un clic
    
Filtres disponibles:
    ├── Région (liste déroulante)
    ├── Ville
    ├── Secteur (crèche, EHPAD, etc.)
    ├── Type contrat
    ├── Salaire min-max
    ├── Expérience requise
    ├── Label "Urgent"
    ├── Proximité (géolocalisation)
    └── Date/Récence

Limitations:
    - BASIC : voit 3 missions max (autres floues)
    - PREMIUM : toutes missions
    
Post-conditions:
    - Worker peut postuler directement
```

#### **UC-08 : Postuler à Mission (Worker)**
```
Acteur principal    : Worker authentifié
Préconditions       : Mission publiée, Worker VALIDATED
Scénario normal     :
    1. Ouvrir mission
    2. Cliquer "Postuler"
    3. Vérifier infos pré-remplies
    4. Ajouter message optionnel
    5. Confirmer candidature
    6. Candidature enregistrée avec statut PENDING
    7. Establishment notifié
    
Vérifications:
    ├── Worker n'a pas déjà postulé
    ├── Worker n'a pas dépassé limite candidatures/mois (BASIC)
    └── Mission encore ouverte

Post-conditions:
    - Application créée
    - Establishment reçoit notification
    - Worker peut suivre candidature
```

#### **UC-09 : Gérer Candidatures (Establishment)**
```
Acteur principal    : Establishment authentifié
Préconditions       : Missions publiées avec candidatures
Scénario normal     :
    1. Accéder tableau candidatures
    2. Voir CV et profil worker
    3. Consulter expériences et évaluations antérieures
    4. Accepter ou refuser
    5. Ajouter commentaire si rejet
    6. Notifier worker
    
Status candidature:
    ├── PENDING : en attente
    ├── ACCEPTED : candidat retenu
    ├── REJECTED : refusé
    └── COMPLETED : mission terminée
    
Post-conditions:
    - Worker notifié
    - Si accepté : mission en cours de réalisation
    - Si rejeté : establishment peut continuer recrutement
```

#### **UC-10 : Évaluer Mission (Establishment)**
```
Acteur principal    : Establishment après mission complétée
Préconditions       : Mission COMPLETED
Scénario normal     :
    1. Accéder mission terminée
    2. Voir fiche worker assigné
    3. Noter de 1 à 5 étoiles
    4. Écrire commentaire détaillé (obligatoire)
    5. Soumettre évaluation
    6. Évaluation visible sur profil worker
    
Validation:
    ├── Note obligatoire
    ├── Commentaire obligatoire (min 20 caractères)
    └── Dates consistantes
    
Post-conditions:
    - Évaluation enregistrée
    - Note moyenne worker mise à jour
    - Worker notifié
```

#### **UC-11 : Gérer Documents (Admin)**
```
Acteur principal    : Admin
Préconditions       : Worker a uploadé documents
Scénario normal     :
    1. Admin consulte doc worker
    2. Vérifier authenticité (diplômes, casier, CNI)
    3. Vérifier dates d'expiration
    4. Accepter ou refuser
    5. Marquer statut (VERIFIED/REJECTED)
    6. Ajouter commentaire si rejet
    7. Worker notifié de la décision
    
Types documents:
    ├── DIPLOMA
    ├── CIN (Carte d'Identité)
    ├── CASIER_JUDICIAIRE
    ├── ATTESTATION_TRAVAIL
    ├── CARTE_CNSS
    ├── CERTIFICATE
    └── OTHER
    
Post-conditions:
    - Document statut VERIFIED ou REJECTED
    - Worker peut rectifier si rejeté
```

#### **UC-12 : Gérer Disponibilités (Worker)**
```
Acteur principal    : Worker authentifié
Préconditions       : Aucune
Scénario normal     :
    1. Accéder page "Calendrier"
    2. Voir calendrier mensuel
    3. Cliquer sur jour pour marquer dispo/indispo
    4. Ajouter événement spécifique (RDV, congé)
    5. Sauvegarde automatique
    6. Establishment peut voir dispo lors candidature
    
Types événements:
    ├── Disponible (blanc)
    ├── Indisponible (grisé)
    ├── RDV (bleu)
    ├── Congé (rouge)
    └── En mission (vert)
    
Post-conditions:
    - Calendrier mis à jour
    - Visible au establishments
```

---

### 2.3.3 Workflow Principal : Mise en Relation

```
                          START
                            │
                ┌───────────┴────────────┐
                │                        │
            ┌───▼────┐            ┌──────▼──┐
            │ WORKER │            │ESTABLISHMENT│
            └────────┘            └──────────────┘
                │                        │
                │ 1. Complète profil     │ 1. Crée mission
                │    + upload docs       │    + description
                │                        │    + critères
                ▼                        ▼
            ┌─────────────┐      ┌────────────────┐
            │ VALIDATION  │      │ PUBLICATION    │
            │ ADMIN       │      │ MISSION        │
            └────┬────────┘      └────────┬───────┘
                 │ Accepté              │
                 ▼                      ▼
            ┌────────────────────────────────┐
            │ RECHERCHE + CANDIDATURE        │
            │ - Worker voit missions         │
            │ - Worker postule               │
            └────────────┬───────────────────┘
                         │
                    ┌────▼────┐
                    │PROCESSING│ PENDING
                    └────┬─────┘
                         │
            ┌────────────┬┴────────────┐
            │            │             │
        ┌───▼─┐     ┌────▼────┐  ┌────▼────┐
        │ACCEPT    │REJECT    │  │ WAITING │
        └───┬──┘     └──┬──────┘  └─────────┘
            │          │
            ▼          └──────────────┐
        ┌──────────────┐              │
        │ IN_PROGRESS  │              │
        │ Réalisation  │              │
        └──┬───────────┘              │
           │                          │
           ▼                          │
        ┌──────────────┐              │
        │ COMPLETED    │              │
        │ Mission OK   │              │
        └──┬───────────┘              │
           │                          │
           ├──────────┬───────────┬───┘
           │          │           │
        ┌──▼─┐   ┌────▼───┐   ┌──▼──┐
        │EVAL│   │ARCHIVED│   │OTHER│
        └────┘   └────────┘   └─────┘
           │
           ▼
        ┌──────────────┐
        │ END          │
        └──────────────┘
```

---

## 2.4 Modélisation des Données (Base de Données)

### 2.4.1 Entités Principales

#### **1. Entité USER (Utilisateurs)**
```sql
CREATE TABLE "User" (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL (Hashed Bcrypt),
  role ENUM('WORKER', 'ESTABLISHMENT', 'ADMIN', 'SUPER_ADMIN') NOT NULL,
  status ENUM('PENDING', 'IN_REVIEW', 'VALIDATED', 'REJECTED', 'SUSPENDED') 
         DEFAULT 'PENDING',
  
  -- Email Verification
  isEmailVerified BOOLEAN DEFAULT false,
  verificationCode VARCHAR(6),
  verificationCodeExpiresAt TIMESTAMP,
  
  -- Password Reset
  resetPasswordToken VARCHAR(255),
  resetPasswordTokenExpiresAt TIMESTAMP,
  
  -- Admin Permissions (JSON)
  admin_permissions JSON,  -- ["CAN_VALIDATE", "CAN_MODERATE", ...]
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_status (status),
  INDEX idx_role (role),
  INDEX idx_email (email)
);
```

**Rôles et statuts :**
- **UserRole** : WORKER | ESTABLISHMENT | ADMIN | SUPER_ADMIN
- **UserStatus** : PENDING → IN_REVIEW → VALIDATED/REJECTED ou SUSPENDED

---

#### **2. Entité WORKER_PROFILE (Profils Travailleurs)**
```sql
CREATE TABLE "WorkerProfile" (
  user_id INT PRIMARY KEY,
  
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  title VARCHAR(100),  -- Ex: "Aide-soignante"
  experience_years INT,
  bio TEXT,
  
  -- Informations de contact
  address VARCHAR(255),
  city_id INT REFERENCES City(city_id),
  phone VARCHAR(20),
  
  -- Médias
  profile_pic_url VARCHAR(255),
  banner_url VARCHAR(255),
  cv_url VARCHAR(255),
  
  -- Zone géographique
  availability_radius_km INT DEFAULT 30,  -- Rayon en km
  availability_lat DECIMAL(10,8),         -- Latitude
  availability_lng DECIMAL(11,8),         -- Longitude
  
  -- Compétences
  skills JSON,  -- ["Permis B", "Gériatrie", "Soin palliatif"]
  
  -- Vérification
  verification_status ENUM('PENDING', 'VERIFIED', 'REJECTED') 
                      DEFAULT 'PENDING',
  
  FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
  FOREIGN KEY (city_id) REFERENCES City(city_id),
  INDEX idx_verification (verification_status),
  INDEX idx_city (city_id)
);
```

---

#### **3. Entité ESTABLISHMENT_PROFILE (Profils Établissements)**
```sql
CREATE TABLE "EstablishmentProfile" (
  user_id INT PRIMARY KEY,
  
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,  -- URL-friendly name
  
  -- Contact responsable
  contact_first_name VARCHAR(100) NOT NULL,
  contact_last_name VARCHAR(100) NOT NULL,
  contact_function VARCHAR(100),
  
  -- Documents légaux
  ice_number VARCHAR(20) UNIQUE NOT NULL,
  rc_number VARCHAR(20),
  
  -- Localisation
  address VARCHAR(255),
  city_id INT REFERENCES City(city_id),
  phone VARCHAR(20),
  
  -- Description
  website VARCHAR(255),
  description TEXT,
  founding_year INT,
  employee_count VARCHAR(20),
  service VARCHAR(100),  -- Type de service (crèche, EHPAD, etc.)
  
  -- Médias
  logo_url VARCHAR(255),
  banner_url VARCHAR(255),
  
  -- Vérification
  verification_status ENUM('PENDING', 'VERIFIED', 'REJECTED') 
                      DEFAULT 'PENDING',
  
  structure_id INT REFERENCES Structure(id),
  
  FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
  FOREIGN KEY (city_id) REFERENCES City(city_id),
  UNIQUE KEY (ice_number),
  INDEX idx_verification (verification_status),
  INDEX idx_city (city_id)
);
```

---

#### **4. Entité MISSION (Missions)**
```sql
CREATE TABLE "Mission" (
  mission_id INT PRIMARY KEY AUTO_INCREMENT,
  establishment_id INT NOT NULL,
  
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  required_skills JSON,
  min_experience INT DEFAULT 0,
  
  -- Détails contrat
  contract_type ENUM('CDI', 'CDD', 'INTERIM', 'STAGE', 'BENEFICE', 'FREELANCE') 
                NOT NULL,
  duration_days INT,  -- Si CDD
  start_date DATE,
  end_date DATE,
  
  -- Rémunération
  salary_min DECIMAL(10,2),
  salary_max DECIMAL(10,2),
  
  -- Localisation
  city_id INT NOT NULL REFERENCES City(city_id),
  
  -- Urgence
  is_urgent BOOLEAN DEFAULT false,
  number_of_positions INT DEFAULT 1,
  
  -- Statut
  status ENUM('DRAFT', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED', 'CLOSED') 
         DEFAULT 'DRAFT',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (establishment_id) REFERENCES EstablishmentProfile(user_id),
  FOREIGN KEY (city_id) REFERENCES City(city_id),
  INDEX idx_status (status),
  INDEX idx_establishment (establishment_id),
  INDEX idx_city (city_id)
);
```

---

#### **5. Entité APPLICATION (Candidatures)**
```sql
CREATE TABLE "Application" (
  application_id INT PRIMARY KEY AUTO_INCREMENT,
  mission_id INT NOT NULL,
  worker_id INT NOT NULL,
  
  -- Statut candidature
  status ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED') 
         DEFAULT 'PENDING',
  
  -- Message du worker
  cover_letter TEXT,
  
  -- Feedback establishment
  rejection_reason VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (mission_id) REFERENCES Mission(mission_id),
  FOREIGN KEY (worker_id) REFERENCES WorkerProfile(user_id),
  UNIQUE KEY unique_application (mission_id, worker_id),
  INDEX idx_status (status),
  INDEX idx_worker (worker_id)
);
```

---

#### **6. Entité REVIEW (Évaluations)**
```sql
CREATE TABLE "Review" (
  review_id INT PRIMARY KEY AUTO_INCREMENT,
  mission_id INT NOT NULL,
  reviewer_id INT NOT NULL,
  reviewed_id INT NOT NULL,
  
  rating INT CHECK (rating BETWEEN 1 AND 5),  -- 1-5 étoiles
  comment TEXT NOT NULL,
  
  -- Type d'évaluation
  review_type ENUM('WORKER_REVIEW', 'ESTABLISHMENT_REVIEW'),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (mission_id) REFERENCES Mission(mission_id),
  FOREIGN KEY (reviewer_id) REFERENCES User(user_id),
  FOREIGN KEY (reviewed_id) REFERENCES User(user_id),
  INDEX idx_reviewed (reviewed_id),
  INDEX idx_mission (mission_id)
);
```

---

#### **7. Entité DOCUMENT (Documents)**
```sql
CREATE TABLE "WorkerDocument" (
  document_id INT PRIMARY KEY AUTO_INCREMENT,
  worker_id INT NOT NULL,
  
  -- Type document
  document_type ENUM('DIPLOMA', 'CIN', 'CASIER_JUDICIAIRE', 
                     'ATTESTATION_TRAVAIL', 'CARTE_CNSS', 'CERTIFICATE', 'OTHER'),
  
  -- Fichier
  file_url VARCHAR(255) NOT NULL,
  file_name VARCHAR(255),
  file_size INT,  -- en bytes
  file_type VARCHAR(50),  -- application/pdf, image/jpeg
  
  -- Vérification
  verification_status ENUM('PENDING', 'VERIFIED', 'REJECTED') 
                      DEFAULT 'PENDING',
  verification_comment TEXT,
  verified_by INT,  -- Référence admin
  verified_at TIMESTAMP,
  
  -- Expiration
  expiration_date DATE,
  is_expired BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (worker_id) REFERENCES WorkerProfile(user_id),
  FOREIGN KEY (verified_by) REFERENCES User(user_id),
  INDEX idx_worker (worker_id),
  INDEX idx_status (verification_status)
);
```

---

#### **8. Entité CALENDAR_EVENT (Calendrier)**
```sql
CREATE TABLE "CalendarEvent" (
  event_id INT PRIMARY KEY AUTO_INCREMENT,
  worker_id INT NOT NULL,
  
  event_date DATE NOT NULL,
  
  -- Type événement
  event_type ENUM('UNAVAILABLE', 'HOLIDAY', 'APPOINTMENT', 'IN_MISSION', 'OFF') 
             DEFAULT 'UNAVAILABLE',
  
  description VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (worker_id) REFERENCES WorkerProfile(user_id),
  UNIQUE KEY unique_event (worker_id, event_date),
  INDEX idx_worker (worker_id)
);
```

---

#### **9. Entité SUBSCRIPTION (Abonnements)**
```sql
CREATE TABLE "Subscription" (
  subscription_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  
  -- Plan
  tier ENUM('BASIC', 'PREMIUM', 'PRO') DEFAULT 'BASIC',
  status ENUM('ACTIVE', 'TRIAL', 'EXPIRED', 'CANCELLED') DEFAULT 'ACTIVE',
  
  -- Dates
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP,
  trial_end TIMESTAMP,
  
  -- Paiement
  payment_method VARCHAR(50),  -- 'STRIPE', 'BANK_TRANSFER'
  stripe_customer_id VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES User(user_id),
  INDEX idx_tier (tier),
  INDEX idx_status (status)
);
```

---

#### **10. Entité NOTIFICATION (Notifications)**
```sql
CREATE TABLE "Notification" (
  notification_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  
  type ENUM('INFO', 'WARNING', 'SUCCESS', 'URGENT', 
            'MISSION_INVITE', 'APPLICATION_UPDATE', 'NEW_MESSAGE', 'CV_REQUEST'),
  
  title VARCHAR(255),
  message TEXT,
  
  -- Lien
  link_type VARCHAR(50),  -- 'mission', 'application', 'profile'
  link_id INT,
  
  is_read BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES User(user_id),
  INDEX idx_user (user_id),
  INDEX idx_is_read (is_read)
);
```

---

### 2.4.2 Diagramme Entité-Relation (ERD)

```
┌─────────────────┐
│     USER        │
├─────────────────┤
│ user_id (PK)    │
│ email (UNIQUE)  │
│ password        │
│ role            │
│ status          │
│ created_at      │
└────────┬────────┘
         │
    ┌────┴─────┬──────────┬──────────────┐
    │           │          │              │
    ▼           ▼          ▼              ▼
┌──────────┐ ┌──────────────┐ ┌────────┐ ┌─────┐
│WORKER    │ │ESTABLISHMENT │ │ ADMIN  │ │SUBS │
│PROFILE   │ │  PROFILE     │ │PROFILE │ │CRIP │
├──────────┤ ├──────────────┤ └────────┘ └─────┘
│ user_id  │ │ user_id      │
│ (FK)     │ │ (FK)         │
│ name     │ │ name         │
│ ...      │ │ ice_number   │
└────┬─────┘ └──────┬───────┘
     │              │
     │    ┌─────────┘
     │    │
     ▼    ▼
┌──────────────────────┐
│   MISSION            │
├──────────────────────┤
│ mission_id (PK)      │
│ establishment_id(FK) │
│ title                │
│ description          │
│ status               │
│ city_id              │
│ contract_type        │
│ created_at           │
└────┬─────────────────┘
     │
     │   ┌──────────────────────┐
     └──►│  APPLICATION         │
         ├──────────────────────┤
         │ application_id (PK)  │
         │ mission_id (FK)      │
         │ worker_id (FK)       │
         │ status               │
         │ cover_letter         │
         └──────────────────────┘

┌──────────────────────┐
│  REVIEW              │
├──────────────────────┤
│ review_id (PK)       │
│ mission_id (FK)      │
│ reviewer_id (FK)     │
│ reviewed_id (FK)     │
│ rating (1-5)         │
│ comment              │
└──────────────────────┘

┌──────────────────────┐
│  WORKER_DOCUMENT     │
├──────────────────────┤
│ document_id (PK)     │
│ worker_id (FK)       │
│ document_type        │
│ file_url             │
│ verification_status  │
│ expiration_date      │
└──────────────────────┘

┌──────────────────────┐
│  CALENDAR_EVENT      │
├──────────────────────┤
│ event_id (PK)        │
│ worker_id (FK)       │
│ event_date           │
│ event_type           │
│ description          │
└──────────────────────┘
```

---

### 2.4.3 Relations et Contraintes

| Table 1 | Relation | Table 2 | Cardinalité | Intégrité |
|---------|----------|---------|-------------|-----------|
| User | 1:1 | WorkerProfile | 1:1 | ON DELETE CASCADE |
| User | 1:1 | EstablishmentProfile | 1:1 | ON DELETE CASCADE |
| User | 1:1 | Subscription | 1:1 | ON DELETE CASCADE |
| EstablishmentProfile | 1:N | Mission | 1:N | ON DELETE CASCADE |
| Mission | 1:N | Application | 1:N | ON DELETE CASCADE |
| WorkerProfile | 1:N | Application | 1:N | ON DELETE CASCADE |
| Mission | 1:N | Review | 1:N | ON DELETE CASCADE |
| User | 1:N | Review | 1:N | ON DELETE SET NULL |
| WorkerProfile | 1:N | WorkerDocument | 1:N | ON DELETE CASCADE |
| WorkerProfile | 1:N | CalendarEvent | 1:N | ON DELETE CASCADE |
| City | 1:N | WorkerProfile | 1:N | RESTRICT |
| City | 1:N | EstablishmentProfile | 1:N | RESTRICT |
| City | 1:N | Mission | 1:N | RESTRICT |

---

## 2.5 Architecture de l'Information et UX

### 2.5.1 Hiérarchie des Pages

#### **A. Pages Publiques (Non authentifiées)**
```
┌─────────────────────────────────────────┐
│         LANDING PAGE                    │
│  ├─ Présentation SociaLink             │
│  ├─ CTA Inscription Worker              │
│  ├─ CTA Inscription Establishment       │
│  └─ CTA Login                           │
│                                         │
├─────────────────────────────────────────┤
│ LOGIN                                   │
│  ├─ Email input                         │
│  ├─ Password input                      │
│  ├─ "Mot de passe oublié?" link        │
│  └─ "S'inscrire" link                  │
│                                         │
├─────────────────────────────────────────┤
│ REGISTER WORKER                         │
│  ├─ Email input                         │
│  ├─ Password input                      │
│  ├─ Password confirm                    │
│  └─ Accepter conditions                 │
│                                         │
├─────────────────────────────────────────┤
│ REGISTER ESTABLISHMENT                  │
│  ├─ Company name input                  │
│  ├─ SIRET/ICE input                    │
│  ├─ Contact name inputs                 │
│  ├─ Email & password                    │
│  └─ Accept terms                        │
│                                         │
├─────────────────────────────────────────┤
│ VERIFY EMAIL (OTP)                      │
│  ├─ 6-digit code input                 │
│  ├─ Resend code button                 │
│  └─ Back to login link                 │
│                                         │
└─────────────────────────────────────────┘
```

---

#### **B. Pages Worker Authentifié**

```
WORKER DASHBOARD
├─ Accueil / Vue d'ensemble
│  ├─ Missions recommandées
│  ├─ Statut validations en cours
│  ├─ Derniers messages
│  └─ Prochain RDV (calendrier)
│
├─ MON PROFIL
│  ├─ Infos personnelles
│  ├─ Photo profil + banner
│  ├─ Biographie
│  ├─ Compétences/Tags
│  ├─ Expériences professionnelles
│  └─ Zone géographique (carte + rayon)
│
├─ MES DOCUMENTS
│  ├─ Upload area (drag & drop)
│  ├─ Liste documents uploadés
│  │  ├─ Type document (badge)
│  │  ├─ Status (PENDING, VERIFIED, REJECTED)
│  │  ├─ Date expiration
│  │  └─ Actions (delete, re-upload)
│  └─ Guide "Quels documents ?"
│
├─ MISSIONS
│  ├─ Recherche et filtres
│  │  ├─ Filtre région
│  │  ├─ Filtre secteur
│  │  ├─ Filtre type contrat
│  │  ├─ Filtre salaire
│  │  └─ Filtre proximité (km)
│  ├─ Résultats (grid ou list)
│  │  ├─ Missions blur si BASIC (3+)
│  │  ├─ "Passer Premium" button
│  │  └─ Voir détails (cliquer)
│  └─ Détails mission
│     ├─ Infos establishment
│     ├─ Description complète
│     ├─ Critères requis
│     ├─ Salaire et durée
│     ├─ CTA "Postuler"
│     └─ Avis establishment
│
├─ MES CANDIDATURES
│  ├─ Filtres (pending, accepted, rejected)
│  ├─ Table/Cards candidatures
│  │  ├─ Titre mission
│  │  ├─ Status badge
│  │  ├─ Date candidature
│  │  ├─ Message feedback (si rejeté)
│  │  └─ Actions (view, message, etc.)
│  └─ Détails candidature
│     ├─ Info mission
│     ├─ Timeline événements
│     └─ Messages establishment
│
├─ CALENDRIER
│  ├─ Vue mois/semaine
│  ├─ Événements colorés
│  │  ├─ Vert : en mission
│  │  ├─ Bleu : RDV
│  │  ├─ Rouge : congé
│  │  └─ Gris : indisponible
│  ├─ Cliquer jour → modifier dispo
│  └─ Événements marocains (jours fériés)
│
├─ MESSAGES / MESSAGERIE
│  ├─ Liste conversations
│  ├─ Chat interface
│  │  ├─ Message list
│  │  ├─ Message input
│  │  └─ Attachments (future)
│  └─ Notifications
│
├─ ABONNEMENT
│  ├─ Plan actuel
│  ├─ Infos plan
│  │  ├─ Features disponibles
│  │  ├─ Date expiration
│  │  └─ Renouvellement auto
│  ├─ Autres plans
│  │  ├─ Comparatif features
│  │  └─ CTA "Passer à X"
│  └─ Facturation
│     ├─ Historique paiements
│     ├─ Méthode paiement
│     └─ Download facture
│
└─ PROFIL PUBLIC (Consulté par establishments)
   ├─ Photo profil
   ├─ Nom et titre
   ├─ Badge "Professionnel vérifié"
   ├─ Note moyenne ⭐
   ├─ Bio
   ├─ Compétences
   ├─ Expériences
   ├─ Avis / Reviews
   └─ Contact Establishment
```

---

#### **C. Pages Establishment Authentifié**

```
ESTABLISHMENT DASHBOARD
├─ Accueil / Vue d'ensemble
│  ├─ KPIs (missions actives, candidatures)
│  ├─ Dernières candidatures
│  ├─ Missions en cours
│  └─ Statistiques
│
├─ MON ÉTABLISSEMENT
│  ├─ Infos structure
│  │  ├─ Nom, adresse, logo
│  │  ├─ Type structure (crèche, EHPAD, etc.)
│  │  ├─ Documents légaux (ICE, RC)
│  │  └─ Status vérification
│  ├─ Présentation
│  │  ├─ Description (rich text)
│  │  ├─ Logo upload
│  │  ├─ Banner upload
│  │  └─ Website link
│  └─ Contact responsable
│     ├─ Nom, prénom
│     ├─ Fonction
│     └─ Téléphone
│
├─ MISSIONS
│  ├─ Nouvelles missions (CTA)
│  │  └─ Formulaire création
│  ├─ Mes missions
│  │  ├─ Filtres (draft, published, closed)
│  │  ├─ Table missions
│  │  │  ├─ Titre
│  │  │  ├─ Status badge
│  │  │  ├─ Nb candidatures
│  │  │  └─ Actions (edit, view, close)
│  │  └─ Détails mission
│  │     ├─ Infos générales
│  │     ├─ Candidatures reçues
│  │     └─ Statistiques
│  └─ Archives

│
├─ CANDIDATURES REÇUES
│  ├─ Filtres (pending, accepted, rejected)
│  ├─ Table candidatures
│  │  ├─ Nom worker
│  │  ├─ Titre mission
│  │  ├─ Status badge
│  │  ├─ Note worker (⭐)
│  │  └─ Actions (view, accept, reject)
│  └─ Profil worker
│     ├─ CV et documents
│     ├─ Expériences
│     ├─ Avis antérieurs
│     ├─ Disponibilités (calendrier)
│     └─ Message candidat
│
├─ MESSAGES
│  ├─ Conversations avec workers
│  ├─ Chat interface
│  └─ Notifications
│
├─ ABONNEMENT
│  ├─ Plan actuel
│  ├─ Limites plan
│  │  ├─ Missions actives
│  │  ├─ Candidatures reçues
│  │  └─ Features
│  ├─ Upgrade plans
│  └─ Facturation
│
└─ ANALYSES
   ├─ Statistiques missions
   │  ├─ Total publiées
   │  ├─ Taux candidatures
   │  ├─ Temps moyen remplissage
   │  └─ Coût par recrutement
   └─ Graphiques (ligne, barre)
```

---

#### **D. Pages Admin Authentifié**

```
ADMIN DASHBOARD
├─ Vue d'ensemble
│  ├─ KPIs principaux
│  │  ├─ Total users
│  │  ├─ Missions publiées
│  │  ├─ Transactions
│  │  └─ Support tickets
│  ├─ Graphiques tendances
│  └─ Alertes système
│
├─ GESTION WORKERS
│  ├─ Liste workers
│  │  ├─ Filtres (statut, rôle, dateINS)
│  │  ├─ Search email/nom
│  │  ├─ Table
│  │  │  ├─ Email
│  │  │  ├─ Status badge
│  │  │  ├─ Verification status
│  │  │  ├─ Date création
│  │  │  └─ Actions
│  │  └─ Détails worker
│  │     ├─ Infos personnelles
│  │     ├─ Documents uploadés
│  │     ├─ Historique candidatures
│  │     ├─ Avis reçus
│  │     ├─ Abonnement
│  │     └─ Actions (validate, reject, suspend)
│  └─ Profils à valider
│     └─ Workflow validation
│
├─ GESTION ESTABLISHMENTS
│  ├─ Liste establishments
│  ├─ Profils à vérifier
│  │  ├─ Documents légaux
│  │  ├─ Responsable contact
│  │  └─ Vérification SIRET
│  └─ Actions (verify, reject, suspend)
│
├─ GESTION MISSIONS
│  ├─ Toutes missions
│  │  ├─ Recherche/Filtres
│  │  ├─ Table missions
│  │  └─ Actions (edit, moderate, close)
│  ├─ Modération contenu
│  │  ├─ Signalements
│  │  ├─ Missions douteuses
│  │  └─ Actions (warn, delete)
│  └─ Statistiques
│
├─ GESTION DOCUMENTS
│  ├─ Documents à valider
│  │  ├─ Diplômes
│  │  ├─ Identité
│  │  ├─ Attestations
│  │  └─ Autres
│  ├─ Détail document
│  │  ├─ Image/PDF preview
│  │  ├─ Date expiration
│  │  ├─ Infos worker
│  │  └─ Actions (verify, reject)
│  └─ Historique
│
├─ SUPPORT & DISPUTES
│  ├─ Tickets support
│  │  ├─ Filtres (ouvert, fermé, urgent)
│  │  ├─ Liste tickets
│  │  └─ Détails ticket
│  │     ├─ Messages
│  │     ├─ Attachments
│  │     └─ Actions (resolve, escalate)
│  └─ Disputes
│     ├─ Litiges missions
│     ├─ Arbitrage
│     └─ Résolutions
│
└─ LOGS & AUDIT
   ├─ Logs d'activité
   ├─ Logs authentification
   └─ Logs API (future)
```

---

#### **E. Pages Super Admin**

```
SUPER_ADMIN DASHBOARD (Tout ce que Admin +)
├─ Analytics Avancée
│  ├─ MRR (Monthly Recurring Revenue)
│  ├─ Transaction trends
│  ├─ Acquisition funnel
│  ├─ Retention metrics
│  └─ Cohort analysis
│
├─ GESTION ADMINISTRATEURS
│  ├─ Liste admins
│  │  ├─ Table (email, permissions, dateINS)
│  │  └─ Actions (edit, suspend, delete)
│  ├─ Créer nouvel admin
│  │  ├─ Email input
│  │  ├─ Permissions checkboxes
│  │  │  ├─ CAN_VALIDATE
│  │  ├─ CAN_MODERATE
│  │  ├─ CAN_MANAGE_DISPUTES
│  │  ├─ CAN_VIEW_ANALYTICS
│  │  └─ CAN_MANAGE_ADMINS
│  │  └─ Set password
│  └─ Éditer admin
│     └─ Modifier permissions
│
├─ CONFIGURATION SYSTÈME
│  ├─ Paramètres Worker
│  │  ├─ worker_free_missions_limit (défault: 4)
│  │  ├─ worker_visibility_delay_hours (défault: 48)
│  │  ├─ worker_free_applications_limit (défault: 3)
│  │  ├─ worker_urgent_access_premium_only (défault: true)
│  │  ├─ worker_monetization_mode (SUBSCRIPTION/CREDITS/COMMISSION)
│  │  ├─ worker_credits_per_application
│  │  └─ worker_mission_commission_rate (défault: 5%)
│  ├─ Paramètres Establishment
│  │  ├─ estab_free_missions_limit
│  │  ├─ estab_free_applications_limit
│  │  ├─ estab_urgent_free_allowed
│  │  ├─ estab_monetization_mode
│  │  ├─ estab_credits_per_mission
│  │  └─ estab_recruitment_commission_rate
│  ├─ Upload Settings
│  │  ├─ Max file size (défault: 5MB)
│  │  ├─ Allowed formats
│  │  └─ Storage location
│  └─ Save & Applier
│
├─ GESTION PLANS
│  ├─ Plans Worker
│  │  ├─ BASIC (Free) - Features
│  │  ├─ PREMIUM (99 DH) - Features
│  │  └─ PRO (199 DH) - Features
│  ├─ Plans Establishment
│  │  ├─ STARTER - Features
│  │  ├─ BUSINESS - Features
│  │  └─ ENTERPRISE - Features
│  └─ Éditer features par plan
│
├─ MARKETING
│  ├─ Bannières promotionnelles
│  │  ├─ Créer bannière
│  │  ├─ Image upload
│  │  ├─ Texte/CTA
│  │  ├─ Ciblage (worker/establishment)
│  │  └─ Planification dates
│  ├─ Notifications globales
│  │  ├─ Créer notification
│  │  ├─ Message
│  │  ├─ Type (INFO/WARNING/SUCCESS)
│  │  ├─ Ciblage
│  │  └─ Envoyer
│  └─ Campagnes email (future)
│
├─ DONNÉES & EXPORT
│  ├─ Export users (CSV)
│  ├─ Export missions (CSV)
│  ├─ Export transactions (CSV)
│  ├─ RGPD Data export
│  └─ Rapports périodiques
│
└─ LOGS & AUDIT
   ├─ All admin actions
   ├─ User authentications
   ├─ Sensitive operations
   └── Data access logs
```

---

### 2.5.2 Wireframes et Layouts

#### **Layout Worker (Responsive)**

```
MOBILE (< 768px)
┌──────────────┐
│ ☰ LOGO AVATAR│ (Header)
├──────────────┤
│              │
│  HERO ZONE   │
│              │
├──────────────┤
│ 📌 MISSIONS  │
│    GRID 1    │
├──────────────┤
│ 💼 MES CAND. │
│    CARDS     │
├──────────────┤
│ 📱 NAV BAR   │
│ 🏠 📂 💬 👤  │
└──────────────┘

DESKTOP (≥ 768px)
┌─────────────────────────────────────────┐
│ LOGO  MISSIONS  PROFIL  MSG  ABONNE     │ (Header)
├─────────────────────────────────────────┤
│ SIDEBAR          │  CONTENU PRINCIPAL   │
│ ┌───────────┐    │ ┌──────────────────┐│
│ │ DASHBOARD │    │ │ MISSIONS GRID    ││
│ │ MON PROFIL│    │ │ • Card 1         ││
│ │ DOCUMENTS │    │ │ • Card 2         ││
│ │ MISSIONS  │    │ │ • Card 3         ││
│ │ CANDIDAT. │    │ │                  ││
│ │ CALENDRIER│    │ │ PAGINATION       ││
│ │ MESSAGES  │    │ └──────────────────┘│
│ │ ABONE.    │    │                      │
│ └───────────┘    └──────────────────────┘
└─────────────────────────────────────────┘
```

---

#### **Design System et Couleurs**

| Élément | Couleur | Usage |
|---------|---------|-------|
| **Primaire** | #2563EB (Bleu) | Buttons, links, highlights |
| **Secondaire** | #10B981 (Vert) | Success, positive actions |
| **Danger** | #EF4444 (Rouge) | Delete, reject, errors |
| **Warning** | #F59E0B (Ambre) | Alerts, warnings |
| **Info** | #0EA5E9 (Cyan) | Info messages |
| **Neutral 50** | #F9FAFB | Backgrounds |
| **Neutral 900** | #111827 | Text dark |

---

#### **Typographie et Spacings**

```
Heading 1 (H1) : 32px bold    (titles)
Heading 2 (H2) : 28px semibold (sections)
Heading 3 (H3) : 24px semibold (subsections)
Body Text     : 16px regular   (contenu)
Small Text    : 14px regular   (helpers, dates)
Label         : 12px medium    (inputs)

Spacing:
- xs : 4px
- sm : 8px
- md : 16px
- lg : 24px
- xl : 32px
- 2xl: 48px
```

---

### 2.5.3 Flows et Interactions Clés

#### **Flow 1 : Registration Worker**
```
┌─ Accueil
│
└─► INSCRIPTION WORKER
    ├─ Formulaire email/password
    ├─ Accord conditions
    │
    └─► EMAIL VERIFICATION
        ├─ OTP reçu par email
        ├─ Entrer OTP 6 chiffres
        │
        └─► PROFIL INITIAL
            ├─ Photo, nom, titre
            ├─ Biographie
            │
            └─► DASHBOARD WORKER (PENDING status)
                ├─ Upload documents
                ├─ Ajouter expériences
                └─► SUBMISSION ADMIN
                    └─ Admin valide documents
                        ├─ Accepté → STATUS VALIDATED → Accès missions
                        └─ Rejeté → Can retry
```

---

#### **Flow 2 : Mission Matching**

```
┌─ Worker dans DASHBOARD
│
├─► CHERCHER MISSIONS
│   ├─ Appliquer filtres
│   ├─ Voir 3 missions (BASIC) ou toutes (PREMIUM)
│   │
│   └─► VOIR DÉTAILS MISSION
│       ├─ Infos complet
│       ├─ Establishment profile
│       │
│       └─► POSTULER
│           ├─ Message optionnel
│           └─► APPLICATION CRÉÉE (PENDING)
│               │
│               └─► ESTABLISHMENT reçoit notification
│                   │
│                   ├─► ACCEPTER
│                   │   └─ Worker notifié → STATUS ACCEPTED
│                   │
│                   └─► REFUSER
│                       └─ Worker notifié → STATUS REJECTED
│
├─ Workflow complété
│
└─► POST-MISSION
    ├─ Establishment évalue worker
    └─ Worker peut évaluer establishment
```

---

### 2.5.4 Accessibilité et Inclusivité

| Critère | Implémentation |
|---------|-----------------|
| **Contraste** | WCAG AA (4.5:1 minimum) |
| **Textes alternatifs** | Alt text pour toutes images |
| **Navigation clavier** | Tab navigation complète |
| **Responsive** | Mobile-first design |
| **Langage simple** | Éviter jargon technique |
| **Feedback utilisateur** | Toasters notifications clairs |
| **Formulaires** | Labels explicites + hints |
| **Chargement** | Loading states visibles |

---

## Résumé Partie II

Cette partie a couvert :

✅ **Section 2.1** : Analyse complète du cahier des charges avec objectifs fonctionnels et non-fonctionnels  
✅ **Section 2.2** : Définition détaillée des 4 rôles (Worker, Establishment, Admin, SuperAdmin) avec matrice permissions  
✅ **Section 2.3** : 12 use cases détaillés avec scénarios, préconditions et post-conditions  
✅ **Section 2.4** : Modèle de données complet avec 10+ entités et relations ERD  
✅ **Section 2.5** : Architecture information, UX flows, wireframes et design system  

**Prochaine étape** : Partie III - Réalisation Technique

---

**Document généré** : Février 2026  
**Statut** : ✅ Complet et validé

