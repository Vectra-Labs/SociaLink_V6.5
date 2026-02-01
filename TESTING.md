# 🧪 Testing Guide - SociaLink V6

Ce guide documente l'infrastructure de tests complète mise en place pour SociaLink V6.

## 📋 Vue d'ensemble

| Type de Test | Framework | Commande | Couverture |
|--------------|-----------|----------|------------|
| **Backend API** | Vitest + Supertest | `npm test` (backend) | Auth, Worker, Establishment, Mission, Admin |
| **Frontend Components** | Vitest + RTL | `npm test` (frontend) | Login, MissionCard, Navbar, Footer |
| **E2E Browser** | Playwright | `npm run test:e2e` | Auth flows, User journeys |

---

## 🚀 Lancer les tests

### Backend API Tests

```bash
cd backend

# Lancer tous les tests
npm test

# Mode watch (développement)
npm run test:watch

# Avec couverture de code
npm run test:coverage
```

### Frontend Component Tests

```bash
cd frontend

# Lancer tous les tests
npm test

# Avec interface UI
npm run test:ui

# Avec couverture
npm run coverage
```

### E2E Tests (Playwright)

```bash
cd frontend

# ⚠️ Important: Installer les navigateurs d'abord (une seule fois)
npx playwright install

# Lancer les tests E2E (nécessite frontend + backend en cours d'exécution)
npm run test:e2e

# Mode UI interactif
npm run test:e2e:ui

# Mode visible (headed)
npm run test:e2e:headed

# Voir le rapport
npm run test:e2e:report
```

---

## 📁 Structure des fichiers

### Backend

```
backend/
├── vitest.config.js           # Configuration Vitest
├── src/
│   ├── app.js                 # Express app exportable (pour tests)
│   └── tests/
│       ├── setup.js           # Setup global (mocks email)
│       ├── helpers.js         # Utilitaires (testUsers, loginAs)
│       ├── auth.test.js       # Tests API Auth
│       ├── worker.test.js     # Tests API Worker
│       ├── establishment.test.js # Tests API Establishment
│       ├── mission.test.js    # Tests API Mission
│       └── admin.test.js      # Tests API Admin/SuperAdmin
```

### Frontend

```
frontend/
├── vitest.config.js           # Configuration Vitest
├── playwright.config.js       # Configuration Playwright
├── src/test/
│   ├── setup.js               # Setup global
│   ├── helpers.jsx            # Render avec providers
│   ├── components.test.jsx    # Tests basiques
│   ├── auth/
│   │   └── Login.test.jsx     # Tests Login
│   ├── missions/
│   │   └── MissionCard.test.jsx # Tests MissionCard
│   └── layout/
│       ├── Navbar.test.jsx    # Tests Navbar
│       └── Footer.test.jsx    # Tests Footer
├── e2e/
│   ├── fixtures/
│   │   └── auth.fixture.js    # Fixtures d'authentification
│   ├── auth.spec.js           # E2E auth flows
│   ├── worker.spec.js         # E2E worker journey
│   ├── establishment.spec.js  # E2E establishment journey
│   └── admin.spec.js          # E2E admin workflow
```

---

## 🔑 Comptes de test utilisés

| Rôle | Email | Mot de passe | Status |
|------|-------|--------------|--------|
| SuperAdmin | `superadmin@socialink.ma` | `superadmin123` | Actif |
| Admin | `admin@socialink.ma` | `admin123` | Actif |
| Worker Premium | `worker.premium@test.ma` | `test123` | Validé + Abonné |
| Worker Validé | `worker.nosub@test.ma` | `test123` | Validé |
| Worker Pending | `worker.pending@test.ma` | `test123` | En attente |
| Establishment Pro | `etab.pro@test.ma` | `test123` | Validé + Abonné |
| Establishment Validé | `etab.nosub@test.ma` | `test123` | Validé |
| Establishment Pending | `etab.pending@test.ma` | `test123` | En attente |

---

## 📝 Ajouter de nouveaux tests

### Nouveau test API Backend

```javascript
// backend/src/tests/example.test.js
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { testUsers, loginAs } from './helpers.js';

describe('Example API', () => {
    let token;
    
    beforeAll(async () => {
        const login = await loginAs(request, app, testUsers.workerPremium);
        token = login.cookies;
    });

    it('should do something', async () => {
        const response = await request(app)
            .get('/api/example')
            .set('Cookie', token);
        
        expect(response.status).toBe(200);
    });
});
```

### Nouveau test composant Frontend

```jsx
// frontend/src/test/example/Component.test.jsx
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders, mockAuthContextWorker } from '../helpers.jsx';
import MyComponent from '../../components/MyComponent.jsx';

describe('MyComponent', () => {
    it('renders correctly', () => {
        renderWithProviders(<MyComponent />, {
            authContext: mockAuthContextWorker
        });
        
        expect(screen.getByText('Expected text')).toBeInTheDocument();
    });
});
```

### Nouveau test E2E

```javascript
// frontend/e2e/example.spec.js
import { test, expect, TEST_USERS, loginUser } from './fixtures/auth.fixture.js';

test.describe('Example Flow', () => {
    test('should complete user action', async ({ page }) => {
        await loginUser(page, TEST_USERS.workerPremium);
        
        await page.goto('/example');
        await page.click('button:has-text("Action")');
        
        await expect(page).toHaveURL(/success/);
    });
});
```

---

## ✅ Bonnes pratiques

1. **Isolation** - Chaque test doit être indépendant
2. **Mocking** - Mocker les services externes (email, paiement)
3. **Données de test** - Utiliser les comptes de test existants
4. **Cleanup** - Nettoyer les données créées pendant les tests
5. **Assertions claires** - Un test = une vérification principale

---

## 🐛 Dépannage

### Les tests backend échouent

```bash
# Vérifier que la DB est accessible
npx prisma db push

# Recréer les comptes de test
npm run db:seed
```

### Les tests E2E échouent

```bash
# Vérifier que les serveurs tournent
# Terminal 1: cd backend && npm run dev
# Terminal 2: cd frontend && npm run dev

# Installer les navigateurs
npx playwright install

# Faire un test en mode debug
npx playwright test --debug
```

### Problèmes de timeout

```javascript
// Augmenter le timeout dans playwright.config.js
timeout: 60000,
```
