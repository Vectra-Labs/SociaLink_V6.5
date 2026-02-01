# 📜 SociaLink - Système de Contrôle des Privilèges

> Architecture flexible pour la gestion des droits et limitations par type d'utilisateur.  
> Configuration centralisée via Dashboard SuperAdmin.  
> **Dernière mise à jour :** 13 Janvier 2026

---

## 🏗️ Architecture Générale

```
┌─────────────────────────────────────────────────────────────────┐
│                    SUPERADMIN DASHBOARD                         │
│  ┌──────────────────┬──────────────────┬──────────────────┐    │
│  │   TRAVAILLEURS   │  ÉTABLISSEMENTS  │     ADMINS       │    │
│  │   ─────────────  │  ─────────────── │  ─────────────   │    │
│  │ • Abonnements    │ • Abonnements    │ • Rôles/Perms    │    │
│  │ • Crédits/Tokens │ • Crédits/Tokens │ • Quotas         │    │
│  │ • Commissions    │ • Commissions    │ • Accès sections │    │
│  │ • Limites accès  │ • Limites accès  │                  │    │
│  └──────────────────┴──────────────────┴──────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 👷 TRAVAILLEURS - Privilèges

### Statuts

| Code | Nom | Description |
|------|-----|-------------|
| `PENDING` | En attente | Compte créé, non validé |
| `VALIDATED` | Validé | Compte validé, plan gratuit |
| `PREMIUM` | Premium | Abonnement actif |
| `SUSPENDED` | Suspendu | Compte bloqué |

### Options de Monétisation (Configurables)

#### Option A : Abonnement Mensuel
```
Plan GRATUIT:
├── Voir X missions (configurable)
├── Pas de missions urgentes
├── Pas de missions < 48h
└── Max Y candidatures simultanées

Plan PREMIUM (ex: 99 DH/mois):
├── Toutes les missions
├── Missions urgentes ✓
├── Temps réel ✓
└── Candidatures illimitées
```

#### Option B : Système de Crédits/Tokens
```
Chaque postulation = N crédits
├── Crédits gratuits à l'inscription: X
├── Pack 10 crédits: 50 DH
├── Pack 50 crédits: 200 DH
└── Crédits bonus: parrainage, profil complet, etc.
```

#### Option C : Commission sur Mission
```
Aucun frais à la candidature
├── Commission prélevée uniquement si mission acceptée
├── Taux configurable: X% du budget
└── Prélevé sur paiement établissement
```

### Paramètres Configurables SuperAdmin

| Paramètre | Clé | Type | Défaut |
|-----------|-----|------|--------|
| Missions visibles (gratuit) | `worker_free_missions_limit` | Integer | 4 |
| Délai visibilité (heures) | `worker_visibility_delay_hours` | Integer | 48 |
| Candidatures max (gratuit) | `worker_free_applications_limit` | Integer | 3 |
| Accès missions urgentes | `worker_urgent_access_premium_only` | Boolean | true |
| Mode monétisation | `worker_monetization_mode` | Enum | `SUBSCRIPTION` |
| Crédits par candidature | `worker_credits_per_application` | Integer | 1 |
| Commission mission (%) | `worker_mission_commission_rate` | Float | 5.0 |

---

## 🏢 ÉTABLISSEMENTS - Privilèges

### Statuts

| Code | Nom | Description |
|------|-----|-------------|
| `PENDING` | En attente | Compte créé, documents non vérifiés |
| `VERIFIED` | Vérifié | Documents validés |
| `PREMIUM` | Premium | Abonnement établissement actif |
| `SUSPENDED` | Suspendu | Compte bloqué |

### Options de Monétisation

#### Option A : Abonnement Établissement
```
Plan STARTER (Gratuit):
├── Max X missions actives
├── Y candidatures reçues/mois
├── Pas de mise en avant
└── Support standard

Plan BUSINESS (ex: 299 DH/mois):
├── Missions illimitées
├── Candidatures illimitées
├── Mise en avant × 2
└── Support prioritaire

Plan ENTERPRISE (ex: 799 DH/mois):
├── Tout BUSINESS +
├── Badge "Établissement vérifié premium"
├── API Access
└── Account Manager dédié
```

#### Option B : Crédits par Mission
```
Chaque publication = N crédits
├── Crédits à l'inscription: X
├── Pack "5 missions": 100 DH
├── Pack "20 missions": 350 DH
└── Mission urgente: +Y crédits
```

#### Option C : Commission sur Recrutement
```
Publication gratuite
├── Commission prélevée uniquement si candidat accepté
├── Taux: X% du premier salaire ou montant fixe
└── Facturation mensuelle
```

### Paramètres Configurables SuperAdmin

| Paramètre | Clé | Type | Défaut |
|-----------|-----|------|--------|
| Missions actives max (gratuit) | `estab_free_missions_limit` | Integer | 3 |
| Candidatures reçues max/mois | `estab_free_applications_limit` | Integer | 20 |
| Peut publier urgent (gratuit) | `estab_urgent_free_allowed` | Boolean | false |
| Mode monétisation | `estab_monetization_mode` | Enum | `SUBSCRIPTION` |
| Crédits par mission | `estab_credits_per_mission` | Integer | 1 |
| Crédits mission urgente | `estab_credits_urgent_mission` | Integer | 3 |
| Commission recrutement (%) | `estab_recruitment_commission` | Float | 10.0 |

---

## 🛡️ ADMINS - Privilèges

### Rôles

| Rôle | Permissions |
|------|-------------|
| `ADMIN` | Validation comptes, modération, support |
| `SUPER_ADMIN` | ADMIN + Configuration système, finances, tous accès |

### Paramètres Configurables

| Paramètre | Clé | Description |
|-----------|-----|-------------|
| Quotas validation/jour | `admin_daily_validation_quota` | Limite optionnelle |
| Sections accessibles | `admin_accessible_sections` | Array de sections |
| Peut modifier finances | `admin_can_edit_finances` | Boolean |

---

## ⚙️ Interface SuperAdmin - Structure

```
/super-admin/privileges
├── 📁 Travailleurs
│   ├── 💳 Mode de Monétisation [Dropdown: SUBSCRIPTION | CREDITS | COMMISSION]
│   ├── 📊 Limites Compte Gratuit
│   │   ├── Missions visibles: [input]
│   │   ├── Délai visibilité (h): [input]
│   │   ├── Candidatures max: [input]
│   │   └── Accès urgent Premium only: [toggle]
│   └── 💰 Tarification
│       ├── Si SUBSCRIPTION: Plans et prix
│       ├── Si CREDITS: Crédits/postulation, Packs
│       └── Si COMMISSION: Taux %
│
├── 📁 Établissements
│   ├── 💳 Mode de Monétisation [Dropdown]
│   ├── 📊 Limites Compte Gratuit
│   │   ├── Missions actives max: [input]
│   │   ├── Candidatures reçues/mois: [input]
│   │   └── Publication urgent gratuit: [toggle]
│   └── 💰 Tarification
│       └── (Selon mode choisi)
│
└── 📁 Admins
    ├── 👤 Gestion des Admins
    └── 🔐 Permissions par Rôle
```

---

## 🗄️ Structure Base de Données

### Table `privilege_settings`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | Int | PK |
| `category` | Enum | `WORKER`, `ESTABLISHMENT`, `ADMIN` |
| `key` | String | Nom du paramètre |
| `value` | String | Valeur (parsée selon type) |
| `type` | Enum | `INTEGER`, `FLOAT`, `BOOLEAN`, `STRING`, `ENUM` |
| `updated_at` | DateTime | Dernière modification |
| `updated_by` | Int | FK → User (SuperAdmin) |

### Exemple de données

```sql
INSERT INTO privilege_settings VALUES
-- WORKERS
(1, 'WORKER', 'worker_free_missions_limit', '4', 'INTEGER', NOW(), 1),
(2, 'WORKER', 'worker_visibility_delay_hours', '48', 'INTEGER', NOW(), 1),
(3, 'WORKER', 'worker_monetization_mode', 'SUBSCRIPTION', 'ENUM', NOW(), 1),
-- ESTABLISHMENTS
(4, 'ESTABLISHMENT', 'estab_free_missions_limit', '3', 'INTEGER', NOW(), 1),
(5, 'ESTABLISHMENT', 'estab_monetization_mode', 'SUBSCRIPTION', 'ENUM', NOW(), 1);
```

---

## 🔄 Service de Récupération (Backend)

```javascript
// services/privilegeService.js
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getPrivileges(category) {
    const cacheKey = `privileges_${category}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    
    const settings = await prisma.privilegeSettings.findMany({
        where: { category }
    });
    
    const parsed = settings.reduce((acc, s) => {
        acc[s.key] = parseValue(s.value, s.type);
        return acc;
    }, {});
    
    cache.set(cacheKey, { data: parsed, timestamp: Date.now() });
    return parsed;
}
```

---

## ✅ Avantages de cette Architecture

1. **Flexibilité** : Changer de modèle de monétisation sans toucher au code
2. **Séparation** : Règles distinctes pour chaque type d'utilisateur
3. **Évolutivité** : Ajouter de nouveaux paramètres facilement
4. **Traçabilité** : Historique des modifications par SuperAdmin
5. **Performance** : Cache pour éviter requêtes BDD répétées

---

> **Ce document définit l'architecture cible du système de privilèges SociaLink.**
