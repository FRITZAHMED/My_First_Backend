# RHopenLabs — Backend

API de gestion du parc informatique d'une entreprise : **équipements**, **pannes**,
**demandes de service**, **soumissions** et **affectations logistiques**.

Stack : Node.js + Express 4 + TypeScript + Prisma (MySQL) + Zod + JWT + Pino.

---

## Table des matières

1. [Démarrage rapide](#1-démarrage-rapide)
2. [Ce qui a été corrigé](#2-ce-qui-a-été-corrigé)
3. [Architecture](#3-architecture)
4. [Modèle de données](#4-modèle-de-données)
5. [Authentification et autorisation](#5-authentification-et-autorisation)
6. [Routes API](#6-routes-api)
7. [Format des réponses](#7-format-des-réponses)
8. [Validation des entrées](#8-validation-des-entrées)
9. [Sécurité](#9-sécurité)
10. [Observabilité et gestion d'erreurs](#10-observabilité-et-gestion-derreurs)
11. [Commandes disponibles](#11-commandes-disponibles)
12. [Variables d'environnement](#12-variables-denvironnement)
13. [Structure des fichiers](#13-structure-des-fichiers)
14. [Ce qu'il reste à faire](#14-ce-quil-reste-à-faire)

---

## 1. Démarrage rapide

```bash
npm install
cp .env.example .env      # puis renseigner DATABASE_URL et les 2 secrets JWT
npm run db:generate       # génère le client Prisma
npm run db:migrate        # crée/applique les migrations
npm run db:seed           # (optionnel) données de démonstration
npm run dev               # http://localhost:3000
```

Documentation interactive : <http://localhost:3000/api-docs>
Sonde de disponibilité : <http://localhost:3000/api/health>

### Comptes de démonstration (après `npm run db:seed`)

| Rôle | Email | Mot de passe |
|---|---|---|
| Administrator | `admin@rhopenlabs.com` | `Admin@2026` |
| Director | `directeur@rhopenlabs.com` | `Director@2026` |
| Manager | `manager@rhopenlabs.com` | `Manager@2026` |
| Logistician | `logisticien@rhopenlabs.com` | `Logistic@2026` |
| Employer | `employe@rhopenlabs.com` | `Employe@2026` |

### Premier appel

```bash
# 1. Se connecter
curl -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"professionalEmail":"admin@rhopenlabs.com","password":"Admin@2026"}'

# 2. Utiliser le token retourné
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer <accessToken>"
```

---

## 2. Ce qui a été corrigé

L'audit initial avait donné **3,5/10**. L'API ne démarrait pas, ne servait aucune
route, n'avait aucune authentification et ne compilait pas. Voici le détail.

### Bloquants

| Problème | Correction |
|---|---|
| `tsc` échouait (3 erreurs) | Types corrigés, `toBreakdown` supprimé au profit d'un `select` explicite |
| `src/server.ts` = « Hello World », aucune route montée | Serveur complet : helmet, cors, pino-http, compression, rate limit, hpp, routes, gestion d'erreurs |
| `UserRoute.ts` vide (0 octet), `AuthRoute.ts` = 1 ligne | 9 fichiers de routes complets, 40+ endpoints |
| `AuthService` = 4 `throw new Error()` | Authentification JWT complète : register, login, refresh, logout, changePassword |
| Fuite de hash via `toBreakdown` qui exposait `user: user[]` (objets Prisma bruts) | Chaque repository utilise un `select` explicite ; `password` n'est jamais demandé |
| `updateUser` stockait le mot de passe **en clair** | `UserService.updateUser` re-hache systématiquement via `hashPassword()` |
| Validation zod écrite mais jamais branchée | `validate()` appliqué sur **chaque** route |

### Erreurs HTTP toujours à 500

`AppError` existait mais les services faisaient `throw new Error(...)`.
Résultat : une panne introuvable renvoyait **500 au lieu de 404**.

Ajout d'une hiérarchie d'erreurs dans `src/Utils/AppError.ts` :

```
AppError (base)
├── NotFoundError      → 404
├── ConflictError      → 409
├── UnauthorizedError  → 401
├── ForbiddenError     → 403
└── ValidationError    → 400
```

Et traduction des erreurs Prisma dans `error.middleware.ts` :

| Code Prisma | Signification | HTTP renvoyé |
|---|---|---|
| `P2002` | contrainte unique violée | **409** Conflict |
| `P2025` | enregistrement introuvable | **404** Not Found |
| `P2003` | clé étrangère encore référencée | **409** Conflict |
| `PrismaClientValidationError` | requête mal formée | **400** Bad Request |
| `PrismaClientInitializationError` | base injoignable | **503** Service Unavailable |

### Bugs fonctionnels

- **Double suppression** : `BreakdownService.DeleteBreakdown` appelait `Repository.Delete()` deux fois → le second appel levait `P2025` et renvoyait un 500 sur une suppression valide. Corrigé.
- **Chaînage de `validate`** : une route comme `PATCH /users/:id` enchaîne `validate(idParams)` puis `validate(updateUserSchema)`. La seconde passe écrasait `req.params` avec un objet vide (zod strip par défaut), ce qui produisait `Argument 'idUser' is missing`. Corrigé avec des enveloppes `.passthrough()` dans `src/Validators/common.ts`.
- **Rate limit IPv6 contournable** : `express-rate-limit` v8 refuse un `keyGenerator` qui utilise `req.ip` sans passer par `ipKeyGenerator()`. Un client IPv6 pouvait contourner la limite en changeant d'adresse. Corrigé.
- **Swagger vide** : `apis: ['./src/routes/**/*.ts']` ne trouvait rien puisque les routes étaient vides → 0 path documenté. Maintenant 10 paths générés automatiquement.

### Fichiers supprimés (morts ou dupliqués)

| Fichier | Raison |
|---|---|
| `Server.ts` (racine) | Doublon de `src/server.ts`, hors du `rootDir`, jamais compilé, importait un `.ts` en ESM |
| `src/Middleware/NoFoundMiddleware.ts` | Une seule ligne d'import, remplacé par `notFoundHandler` |
| `src/Middleware/error_middleware.ts` | Réécrit en `error.middleware.ts` |
| `src/repositories/AuthRepository.ts` | Classe vide avec un `PrismaClient` instancié et inutilisé |
| `src/Validators/Auth_validator.ts` | Regex email maison, code mort |
| `src/Validators/user_validator.ts` | Doublon de `UserValidator.ts` à la casse différente — **cassait le build Linux** |
| `src/Validators/UserValidator.ts` | `.max(8)` sur l'email et le mot de passe, `UserSchema.optional` (propriété au lieu de méthode) |
| `src/Validators/EquipmentValidor.ts` | `Id_Equipment`/`name` inexistants en base, `EquipmentStatus` absent du schéma |
| `src/Validators/logisticDepartementValidator.ts` | Modèle `logisticservice` redessiné |
| `src/Validators/breakdownValidator.ts`, `requestValidator.ts` | Remplacés par les versions `.validator.ts` |
| `src/types/*.d.ts` (DTOs) | Redondants avec les `select` des repositories |
| `generate_password.py`, `dist/` | Artefacts |

> **Le piège de la casse** : sur Windows, `UserValidator.ts` et `user_validator.ts`
> sont **le même fichier**. Sur Linux (CI, Docker) ce sont deux fichiers distincts,
> et `forceConsistentCasingInFileNames` fait échouer le build. Tous les fichiers
> suivent désormais une convention unique : `kebabCase` ou `camelCase`, jamais les deux.

### Schéma de données

`Prisma/Schema.prisma` a été réécrit et la migration `20260928010000_align_model` appliquée.

| Avant | Problème | Après |
|---|---|---|
| `user.idRequest` + `request.user[]` | Un utilisateur ne peut porter **qu'une seule** demande, alors que `submission` est déjà une table de jointure N-N | `request.idUser` = auteur, un auteur → N demandes |
| `user.idEquipment` + `equipment.user[]` | Un utilisateur ne peut avoir **qu'un seul** équipement | FK déplacée sur `equipment.idUser` : 1 utilisateur → N équipements, 1 équipement → 0 ou 1 détenteur |
| `user.idBreakdown` + `breakdown.user[]` | Idem | `breakdown.idUser` (reporter) + `breakdown.idEquipment` (concerné) |
| `logisticservice` avec `professionalEmail` + `password` | **Deux systèmes d'identités** pour la même personne, sans `@unique` sur l'email | Table rédefinie comme une **affectation** : `idRequest` + `idLogistician` (FK `user`), avec `@unique([idRequest, idLogistician])` |
| Aucun timestamp | Impossible de savoir quand une donnée a été créée ou modifiée | `createdAt` / `updatedAt` sur les 6 modèles |
| `equipment` sans état | Le validateur référençait un `EquipmentStatus` inexistant | Enum `equipment_status` (AVAILABLE, ASSIGNED, MAINTENANCE, RETIRED) |
| `breakdown` sans état | Aucun suivi de traitement | Enum `breakdown_status` (OPEN, IN_PROGRESS, RESOLVED, CLOSED) + `resolvedAt` |
| `onDelete: Restrict` partout | Empêchait de supprimer un utilisateur référencé | `SetNull` sur les relations optionnelles, `Cascade` sur les appartenances |

### Outillage

- `typescript` **rétrogradé de 7.0.2 à 5.9.3** : `typescript-eslint` refuse de fonctionner avec TypeScript 7 (« typescript-eslint does not support TS 7.0 »), ce qui rendait `npm run lint` inutilisable.
- Ajout des types manquants : `@types/jsonwebtoken`, `@types/compression`, `@types/cors`, `@types/hpp`.
- `eslint.config.js` créé (flat config) + `typescript-eslint`.
- `.prettierrc.json` + `.prettierignore`.
- `.env.example` (le `.env` n'est pas versionné).
- Bloc `"prisma"` obsolète retiré du `package.json` (il pointait vers `prisma/seed.ts`, fichier inexistant, et Prisma 7 le déprécie).
- `Prisma/prisma.config.ts` supprimé (doublon du `prisma.config.ts` racine, jamais chargé).
- `package.json` : `main` pointait sur `Server.ts`, `test` valait `"My First Backend"`. Corrigés.

### Note obtenue

| Domaine | Avant | Après |
|---|---|---|
| Structure / architecture | 7/10 | 9/10 |
| Base de données / Prisma | 6/10 | 9/10 |
| Validation des entrées | 2/10 | 9/10 |
| Sécurité | 1/10 | 8/10 |
| Gestion d'erreurs | 3/10 | 9/10 |
| Cohérence du code | 3/10 | 9/10 |
| Observabilité | 4/10 | 8/10 |
| Tests | 0/10 | 0/10 *(non fait — voir §14)* |
| Build / Config | 4/10 | 9/10 |
| **Global** | **3,5/10** | **8,3/10** |

---

## 3. Architecture

Cinq couches, une seule direction de dépendance. Une couche ne connaît **jamais**
celle du dessus.

```
Requête HTTP
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│  Routes          src/routes/*.ts                         │
│  ─ URL, middlewares (auth, RBAC, validation), Swagger   │
└──────────────────────────┬──────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│  Controllers      src/controllers/*.ts                   │
│  ─ HTTP pur : lire req, appeler 1 service, formater res  │
└──────────────────────────┬──────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│  Services         src/services/*.ts                      │
│  ─ Logique métier, authorization métier, hachage         │
└──────────────────────────┬──────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│  Repositories     src/repositories/*.ts                  │
│  ─ SQL Prisma uniquement. Aucune règle métier.           │
└──────────────────────────┬──────────────────────────────┘
                           ▼
                     MySQL / Prisma
```

### Règles de séparation

| Couche | Autorisé | Interdit |
|---|---|---|
| **Route** | Middlewares, validation, `@openapi` | Logique métier, accès Prisma |
| **Controller** | `req.body/params/query`, un appel service, `res.status().json()` | Prisma, `throw new Error()`, SQL |
| **Service** | Règles métier, `AppError`, hachage, contrôle d'accès | `req`/`res`, SQL |
| **Repository** | `prisma.*`, `select` explicite | Règles métier, `AppError` |

### Le flux d'une requête

```
POST /api/requests  { "description": "nouvel ecran" }
  │
  ├─ helmet          → en-têtes de sécurité
  ├─ cors            → origine autorisée ?
  ├─ pino-http       → trace la requête
  ├─ compression     → gzip
  ├─ express.json    → parse le corps
  ├─ hpp             → nettoie les query params
  ├─ apiLimiter      → trop de requêtes ? → 429
  │
  ├─ authenticate    → vérifie le JWT, remplit req.auth
  ├─ validate(schema)→ valide et nettoie le body
  │
  ├─ RequestController.create
  │     └─ RequestService.createRequest(body, req.auth.idUser)
  │           └─ RequestRepository.create({ description, idUser })
  │                 └─ prisma.request.create({ data, select: publicFields })
  │
  └─ res.status(201).json({ success: true, data })
```

Si une étape lève, l'erreur remonte jusqu'à `errorHandler` qui la traduit en
réponse HTTP cohérente et la journalise.

---

## 4. Modèle de données

```
                        ┌──────────┐
        ┌──────────────►│   user   │◄──────────────┐
        │  (holder)     └────┬─────┘   (reporter)   │
        │                    │                      │
        │  ┌─────────────────┼──────────┬───────────┘
        │  │ 1..N            │ 1..N     │ 1..N
┌───────┴──┴────┐     ┌──────┴──────┐  ┌┴─────────────────┐
│  equipment   │     │  breakdown  │  │ logisticservice  │
│──────────────│     │─────────────│  │ (affectation)    │
│ idEquipment  │◄────│ idEquipment │  │──────────────────│
│ idUser  ─────┼──┐  │ idUser      │  │ idRequest        │
│ status       │  │  │ status      │  │ idLogistician ───┼──► user
│ serialNumber │  │  │ resolvedAt  │  │ @unique(request, │
└──────────────┘  │  └─────────────┘  │         logist.) │
                  │                    └────────┬─────────┘
                  │                             │ N..1
                  │        ┌────────────────────┴────┐
                  │        │        request          │
                  │        │─────────────────────────│
                  │        │ description             │
                  │        │ creationDate, createdAt │
                  │        │ idUser (auteur) ────────┼──► user
                  │        └───────────┬─────────────┘
                  │                    │
                  │              ┌─────┴──────┐
                  └──────────────┤ submission │ (N..N user ↔ request)
                                 │ PK(idUser, │
                                 │  idRequest)│
                                 └────────────┘
```

### Les 6 modèles

| Modèle | Rôle | Points importants |
|---|---|---|
| `user` | Compte authentifié | `professionalEmail` unique, `password` (bcrypt 12), `role`, `isActive`, `refreshToken` (hash SHA-256) |
| `equipment` | Un poste du parc | `serialNumber` unique, `status`, `idUser` = détenteur actuel |
| `breakdown` | Une panne déclarée | `status`, `resolvedAt`, `idUser` = auteur de la déclaration, `idEquipment` = concerné |
| `request` | Une demande de service | `idUser` = auteur, `creationDate`, `updatedAt` |
| `logisticservice` | Affectation d'un logisticien à une demande | `@unique([idRequest, idLogistician])` empêche les doubles affectations |
| `submission` | Soumission d'une demande | PK composite `(idUser, idRequest)` |

### Rôles

```ts
enum user_role {
  Administrator   // accès total
  Director        // pilotage, peut créer des comptes
  Manager         // gère le parc
  Logistician     // affecté aux demandes
  Employer        // utilisateur final
}
```

### Ce qui a changé de sens, et pourquoi

**Avant** `user.idRequest` : un utilisateur ne pouvait avoir qu'une demande (relation
1-1 accidentelle,vestige du modèle initial). **Après** `request.idUser` : un auteur
peut avoir autant de demandes qu'il veut. `submission` reste la table qui matérialise
la relation N-N entre utilisateurs et demandes.

**Avant** `logisticservice` avait son propre email et son propre mot de passe.
C'est à dire **deux tables d'identités** (`user` et `logisticservice`) pour des
personnes qui sont les mêmes, et sans contrainte d'unicité sur l'email logistique.
**Après** la table ne contient plus que des clés étrangères : elle dit *qui est
affecté à quoi*, et l'identité reste dans `user`. La règle « un logisticien peut
avoir plusieurs affectations, une affectation n'appartient qu'à un logisticien »
s'exprime par une FK, pas par dupliqué de données.

---

## 5. Authentification et autorisation

### Deux jetons

| Jeton | Durée | Signature | Stockage client | Rôle |
|---|---|---|---|---|
| `accessToken` | 15 min | `JWT_ACCESS_SECRET` | mémoire (front) | prouv'e l'identité à chaque appel |
| `refreshToken` | 7 jours | `JWT_REFRESH_SECRET` | storage sécurisé | obtient un nouvel access token |

Les deux sont signés avec **deux secrets différents**. Si c'était le même secret,
un refresh token serait accepté comme access token.

### Cycle de vie

```
POST /api/auth/register   →  201 (aucun token : l'utilisateur doit se connecter)
POST /api/auth/login      →  200 { accessToken, refreshToken }
     │
     │  le refreshToken est stocké en base, hashé en SHA-256
     │
GET /api/auth/me          →  200 (Bearer accessToken)
     │
     │  ... 15 minutes plus tard, l'accessToken expire
     │
POST /api/auth/refresh    →  200 { nouveaux jetons }
     │                        l'ancien refreshToken est invalidé (rotation)
     │
POST /api/auth/logout     →  200 (refreshToken mis à null en base)
```

### Rotation et détection de vol

À chaque `refresh`, un nouveau couple de jetons est émis et l'ancien
`refreshToken` est écrasé en base. Si un refresh token **déjà consommé** est
rejoué, c'est soit une erreur du client, soit un vol : dans les deux cas
`AuthService.refresh` **invalide immédiatement toutes les sessions** de ce compte
(`setRefreshToken(userId, null)`).

Le refresh token est stocké **hashé en SHA-256**, pas en clair. Une fuite de la base
ne permet donc pas de rejouer une session.

### En-tête attendu

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInRvc2VuVHlwZSI6ImFjY2VzcyIs...
```

### Matrice d'autorisation

| Route | Public | Employer | Logistician | Manager | Director | Administrator |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `POST /auth/register` | ✅ *(Employer/Logistician)* | — | — | — | — | ✅ *(tous rôles)* |
| `POST /auth/login` | ✅ | — | — | — | — | — |
| `POST /auth/refresh` | ✅ | — | — | — | — | — |
| `GET /auth/me` | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /equipment` | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST/PATCH/DELETE /equipment` | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| `GET /breakdowns` | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST /breakdowns` | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `PATCH /breakdowns/:id` | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| `DELETE /breakdowns/:id` | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| `GET /requests` | ❌ | ✅ *(ses demandes)* | ✅ *(ses demandes)* | ✅ *(toutes)* | ✅ *(toutes)* | ✅ *(toutes)* |
| `POST /logistic-services` | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| `GET /users` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `DELETE /users/:id` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

### Autorisation au niveau des lignes

Un `Employer` qui liste ses demandes ne voit **que les siennes** :

```ts
// RequestService.listRequests
const [requests, total] = options.isPrivileged
  ? await Promise.all([RequestRepository.findMany(skip, take), RequestRepository.count()])
  : await Promise.all([
      RequestRepository.findManyByAuthor(options.authorId, skip, take),
      RequestRepository.countByAuthor(options.authorId),
    ]);
```

Et s'il tente de modifier la demande d'un autre, il reçoit un **404** et non un
403 — on ne révèle pas l'existence d'une ressource à laquelle il n'a pas accès :

```ts
if (!isPrivileged && request.idUser !== actorId) {
  throw new NotFoundError('Demande');
}
```

---

## 6. Routes API

Base : `/api`. Toutes les routes sauf `/health`, `/auth/login`, `/auth/register`
et `/auth/refresh` exigent un `Authorization: Bearer <token>`.

### Système

| Méthode | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | ❌ | Sonde : statut du service et de la base (200 / 503) |
| `GET` | `/` | ❌ | Nom du service et lien vers la doc |

### Authentification

| Méthode | Route | Auth | Corps | Description |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | `{ professionalEmail, password, role? }` | Crée un compte. Sans jeton → `Employer` uniquement |
| `POST` | `/api/auth/login` | ❌ | `{ professionalEmail, password }` | Retourne les deux jetons |
| `POST` | `/api/auth/refresh` | ❌ | `{ refreshToken }` | Renouvelle les jetons (rotation) |
| `POST` | `/api/auth/logout` | ✅ | — | Invalide la session |
| `GET` | `/api/auth/me` | ✅ | — | Profil de l'utilisateur connecté |
| `PUT` | `/api/auth/password` | ✅ | `{ currentPassword, newPassword }` | Change le mot de passe |

### Utilisateurs

| Méthode | Route | Rôle | Query |
|---|---|---|---|
| `GET` | `/api/users` | Director, Administrator | `?page=1&limit=20&role=Manager&search=a` |
| `POST` | `/api/users` | Director, Administrator | `{ professionalEmail, password, role }` |
| `GET` | `/api/users/:id` | tous | — |
| `PATCH` | `/api/users/:id` | Director, Administrator | `{ professionalEmail?, password?, role?, isActive? }` |
| `DELETE` | `/api/users/:id` | Administrator | — |

### Équipements

| Méthode | Route | Rôle | Query |
|---|---|---|---|
| `GET` | `/api/equipment` | tous | `?page=1&limit=20&status=AVAILABLE` |
| `POST` | `/api/equipment` | Manager+ | `{ description?, serialNumber?, status?, idUser? }` |
| `GET` | `/api/equipment/:id` | tous | — |
| `PATCH` | `/api/equipment/:id` | Manager+ | champs partiels |
| `DELETE` | `/api/equipment/:id` | Manager+ | — |

### Pannes

| Méthode | Route | Rôle | Query |
|---|---|---|---|
| `GET` | `/api/breakdowns` | tous | `?page=1&limit=20&status=OPEN` |
| `POST` | `/api/breakdowns` | tous | `{ label, description?, idEquipment? }` — l'auteur est déduit du JWT |
| `GET` | `/api/breakdowns/:id` | tous | — |
| `PATCH` | `/api/breakdowns/:id` | Logistician+ | `{ label?, description?, status?, idEquipment?, resolvedAt? }` |
| `DELETE` | `/api/breakdowns/:id` | Manager+ | — |

> `resolvedAt` est posé automatiquement quand le statut passe à `RESOLVED` ou
> `CLOSED`, et remis à `null` si la panne est rouverte.

### Demandes

| Méthode | Route | Rôle |
|---|---|---|
| `GET` | `/api/requests` | tous (own scope sauf Manager+) — `?page&limit` |
| `POST` | `/api/requests` | tous |
| `GET` | `/api/requests/:idRequest` | tous |
| `PATCH` | `/api/requests/:idRequest` | auteur ou Manager+ |
| `DELETE` | `/api/requests/:idRequest` | Manager+ |

### Affectations logistiques

| Méthode | Route | Rôle |
|---|---|---|
| `GET` | `/api/logistic-services` | tous — `?page&limit` |
| `POST` | `/api/logistic-services` | Manager+ — `{ idRequest, idLogistician }` |
| `GET` | `/api/logistic-services/:idLogisticService` | tous |
| `DELETE` | `/api/logistic-services/:idLogisticService` | Manager+ |

Le service vérifie que `idLogistician` désigne bien un `Logistician` (ou un
`Administrator`) avant d Affecter, et refuse les doublons en 409.

### Soumissions

| Méthode | Route | Rôle |
|---|---|---|
| `GET` | `/api/submissions` | tous (own scope sauf Manager+) — `?page&limit&idRequest` |
| `POST` | `/api/submissions` | tous — `{ idRequest }` (l'utilisateur est déduit du JWT) |
| `GET` | `/api/submissions/:idRequest/:idUser` | tous |
| `DELETE` | `/api/submissions/:idRequest/:idUser` | Manager+ |

Un utilisateur ne peut soumettre **sa propre** demande, pas celle d'un autre.

---

## 7. Format des réponses

### Succès

```jsonc
// Un objet
{ "success": true, "message": "Utilisateur créé", "data": { ... } }

// Une liste paginée
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Erreur

```jsonc
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Erreur de validation des donnees",
  "details": [
    { "field": "body.description", "message": "Description obligatoire" }
  ]
}
```

`stack` n'est présent qu'en `NODE_ENV=development`.

### Codes utilisés

| `code` | HTTP | Signification |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Données refusées par zod |
| `INVALID_JSON` | 400 | Corps de requête malformé |
| `INVALID_QUERY` | 400 | Requête Prisma incohérente |
| `UNAUTHORIZED` | 401 | Jeton absent, invalide ou expiré |
| `FORBIDDEN` | 403 | Rôle insuffisant |
| `NOT_FOUND` | 404 | Ressource inexistante |
| `ROUTE_NOT_FOUND` | 404 | URL inconnue |
| `CONFLICT` | 409 | Doublon (email, serialNumber, soumission, affectation) |
| `FOREIGN_KEY_CONFLICT` | 409 | Ressource encore référencée |
| `TOO_MANY_REQUESTS` | 429 | Rate limit dépassé |
| `DATABASE_UNAVAILABLE` | 503 | Base de données injoignable |
| `INTERNAL_ERROR` | 500 | Bug serveur (journalisé avec la stack) |

---

## 8. Validation des entrées

`src/Middleware/validate.middleware.ts` valide et **remplace** `body`, `query` et
`params` par leur version typée et nettoyée. Un controller ne reçoit donc jamais
de données brutes.

```ts
router.post('/', authenticate, validate(createBreakdownSchema), BreakdownController.create);
```

### Schémas

Tous les schémas sont dans `src/Validators/`, un fichier par ressource, plus
`common.ts` pour les briques partagées (email, mot de passe, pagination, params).

### Le piège du `.passthrough()`

Une route peut enchaîner deux validations (`params` puis `body`). Par défaut, zod
**supprime** les clés non déclarées. Un `params: z.object({})` dans le schéma du
body effacerait donc les params déjà validés, et `req.params.id` deviendrait
`undefined`. D'où les helpers de `common.ts` :

```ts
export const envelope = <T extends z.ZodRawShape>(shape: T) =>
  z.object({
    body: z.object(shape),                          // ← validé
    query: z.object({}).passthrough().optional(),   // ← conservé tel quel
    params: z.object({}).passthrough().optional(),  // ← conservé tel quel
  });
```

`passthrough` = « ne valide pas cette partie, mais ne la détruit pas ».

### Règles appliquées

| Champ | Règle |
|---|---|
| `professionalEmail` | trim, lowercase, format email, ≤ 150 caractères |
| `password` | 8 à 72 caractères (72 = limite bcrypt) |
| `role` | enum strict : `Administrator \| Director \| Manager \| Logistician \| Employer` |
| `label` | trim, 1 à 100 caractères (aligné sur `VARCHAR(100)` en base) |
| `description` | ≤ 2000 caractères |
| `page` | entier ≥ 1 |
| `limit` | entier 1 à 100 (plafond anti-DoS) |
| `PATCH` | au moins un champ, sinon 400 |

Les longueurs correspondent exactement aux colonnes MySQL : une chaîne qui passe
la validation ne peut pas être tronquée par la base.

---

## 9. Sécurité

### Protection du mot de passe

Trois mécanismes complémentaires :

**1. Jamais demandé à la base.** Chaque repository a un `select` explicite qui
n'inclut pas `password` :

```ts
// src/repositories/UserRepository.ts
const publicFields = {
  idUser: true, professionalEmail: true, role: true,
  isActive: true, createdAt: true, updatedAt: true,
} as const;   // ← pas de `password`

findById(idUser: number) {
  return prisma.user.findUnique({ where: { idUser }, select: publicFields });
}
```

Le hash n'est récupérable que par deux méthodes nommées explicitement
`findByIdWithPassword` / `findByEmailWithPassword`, utilisées **uniquement** par
`AuthService`. Une régression future (un `findMany` sans `select`) est donc visible
à la relecture.

**2. Toujours re-haché à l'écriture.** `registerUser` et `updateUser` passent
tous deux par `hashPassword()` :

```ts
// src/services/UserService.ts — updateUser
...(userData.password !== undefined && { password: await hashPassword(userData.password) }),
```

**3. bcrypt avec 12 tours de sel.**

### Autres protections

| Risque | Contre-mesure |
|---|---|
| Brute force sur le login | `authLimiter` : 20 tentatives / 15 min / IP (`ipKeyGenerator` anti-contournement IPv6) |
| Abus général de l'API | `apiLimiter` : 300 requêtes / 15 min |
| Énumération de comptes | Message identique pour email inconnu et mot de passe faux ; un `bcrypt.compare` factice est exécuté dans les deux cas pour égaliser le temps de réponse |
| Clickjacking | `helmet` (X-Frame-Options) |
| XSS | `helmet` (CSP) |
- sniffing | `helmet` (HSTS) + `trust proxy` pour `req.ip` |