# Développement Full-Stack - Projet 2025
## Réseau de travailleurs sociaux indépendants

### 1. Contexte
Ce projet consiste à concevoir et développer une plateforme numérique innovante dédiée à la création d’un réseau sélectif de travailleurs sociaux indépendants.
**Mission** : Connecter des établissements en quête de renforts avec des professionnels hautement qualifiés.
**Objectif** : Garantir une qualité de service supérieure via un système de labellisation et limiter la multiplication des intervenants.

---

### 2. Objectifs Pédagogiques
- [x] **Front-end (React)** : Gestion de formulaires, tableaux de bord différenciés, gestion d'état.
- [x] **Back-end (Node.js/Express)** : Architecture REST, authentification JWT, gestion des rôles.
- [x] **Base de données (SQL)** : Modélisation de relations et requêtes de filtrage avancées.

---

### 3. Parcours Utilisateurs (User Stories)

#### A. Le Travailleur Social (Indépendant)
- [x] **Créer un profil enrichi** : Diplômes (upload PDF), expériences, spécialités.
- [x] **Disponibilités** : Indiquer ses disponibilités via un calendrier.
- [x] **Candidature** : Postuler à des missions proposées par des établissements.

#### B. L'Établissement (Client)
- [x] **Publier des offres** : Préciser le besoin (public, durée, urgence).
- [x] **Rechercher des professionnels** : Filtres (compétences, labels, proximité).
- [x] **Valider & Noter** : Valider une prestation et noter/commenter l'intervention.

#### C. L'Administrateur (Le Réseau)
- [x] **Modération** : "Labelliser" les nouveaux inscrits (vérification diplômes).
- [x] **Vue d'ensemble** : Suivi des mises en relation en cours.

---

### 4. Spécifications Fonctionnelles

#### A. Gestion des comptes et profils
- [x] **Authentification sécurisée** : Inscription/Connexion email & mdp, Gestion des rôles (Professionnel, Établissement, Admin).
- [x] **Profil Travailleur enrichi** : Expériences, Diplômes (PDF), Domaines d'intervention.
- [x] **Validation** : Admin approuve le profil après vérification.

#### B. Mise en relation (Matching)
- [x] **Dépôt d'offres** : Titre, dates, descriptif, compétences.
- [x] **Moteur de recherche** : Filtrage par spécialités, expérience, label.
- [x] **Candidature** : Postulation et notification (Acceptation/Refus par l'établissement).

#### C. Suivi et Qualité
- [x] **Tableau de bord** : Missions en cours, à venir, terminées.
- [x] **Évaluation** : Feedback après mission.

---

### 5. Spécifications Non Fonctionnelles

#### A. Sécurité et Conformité
- [x] **RGPD & Chiffrement** : Données cryptées et stockées de manière sécurisée (Local avec chiffrement AES-256).
- [x] **Sécurité Mots de passe** : Hachage robuste (Bcrypt).
- [x] **Protection API** : Utilisation de JWT et gestion des rôles.

#### B. Performance et Disponibilité
- [x] **Réactivité (SPA)** : Expérience fluide, temps de réponse < 500ms.
- [x] **Scalabilité** : Architecture modulaire (MVC).

#### C. Utilisabilité (UX/UI)
- [x] **Responsive Design** : Compatible tablette et ordinateur.
- [x] **Accessibilité** : Respect des standards de navigation.
