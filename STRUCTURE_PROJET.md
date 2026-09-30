# Structure du projet — RHopenLabs

Ce document explique, fichier par fichier, **à quoi sert chaque fichier et pourquoi il existe**.
Toutes les affirmations ci-dessous correspondent au code réellement présent dans le dépôt.

---

## 1. Vue d'ensemble

L'API suit une architecture en couches (pattern *layered architecture*) stricte, où chaque couche
n'a le droit de parler qu'à celle du dessous. C'est la raison d'être de la majorité des fichiers :
un fichier = une responsabilité = une seule raison de changer.

```
Requête HTTP
   │
   ▼
[ Routes ]        urls, middlewares, documentation OpenAPI
   ▼
[ Middleware ]    authentification, rôles, validation, rate limit, erreurs
   ▼
[ Controllers ]   lecture de req, choix du code HTTP, construction du JSON
   ▼
[ Services ]      règles métier (404, 409, transitions de statut, pagination)
   ▼
[ Repositories ]  requêtes Prisma, projection des colonnes exposées
   ▼
[ Prisma ]        MySQL
```

**Règle de dépendance** : une flèche ne remonte jamais. Un repository n'appelle jamais un service,
un service n'appelle jamais un controller. C'est ce qui permet de tester chaque couche isolément.

| Couche | Dossier | Nombre de fichiers |
| --- | --- | --- |
| Point d'entrée | `src/server.ts` | 1 |
| Configuration | `src/Config/` | 3 |
| Utilitaires transverses | `src/Utils/` | 5 |
| Middleware | `src/Middleware/` | 4 |
| Validation | `src/Validators/` | 9 |
| Contrôleurs | `src/controllers/` | 8 |
| Services | `src/services/` | 8 |
| Repositories | `src/repositories/` | 7 |
| Routage | `src/routes/` | 10 |
| Types | `src/types/` | 1 |
| Documentation API | `src/Docs/` | 1 |
| Schéma & migrations | `Prisma/` | 4 |
| Scripts d'exploitation | `scripts/` | 1 |
| Configuration d'outillage | racine | 6 |

---

## 2. Racine du projet

| Fichier | Nécessité |
| --- | --- |
| `package.json` | Déclare les dépendances de production et d'outillage, et surtout les scripts npm (`dev`, `build`, `typecheck`, `lint`, `db:*`). C'est le point d'entrée de toute commande du projet. Le champ `"type": "module"` force le mode ESM, cohérent avec les imports `.js` obligatoires en TypeScript ESM. |
| `package-lock.json` | Fige les versions exactes des dépendances. Sans lui, deux installations peuvent produire deux arbres différents et un bug non reproductible. |
| `tsconfig.json` | Définit la compilation : ESM, `strict`, `noUncheckedIndexedAccess`, `sourceMap`. `rootDir: ./src` + `include: ["src/**/*"]` signifie que **seul `src` est type-checké** : `scripts/checkDb.mjs` et `eslint.config.js` échappent au compilateur. |
| `eslint.config.js` | Qualité statique : impose `import type` pour les types, interdit `console`. Une exception ciblée est faite pour `src/Config/env.ts`, car la validation des variables d'environnement doit pouvoir rapporter une erreur avant que pino ne soit configurable. |
| `.prettierrc.json` | Contrat de formatage : tabulations, 110 colonnes, guillemets simples, virgules finales. Explique l'indentation par tabulations utilisée dans tout `src`. |
| `.prettierignore` | Empêche Prettier de formater les fichiers générés ou sensibles : `node_modules/`, `dist/`, `.venv/`, `.kilo/`, `.env`, `*.log`. |
| `.gitignore` | Empêche de committer des secrets et des artefacts de build : `.env`, `/node_modules`, `/dist`, `/.venv`, `/.kilo`, `*.log`. |
| `.env` | **Non versionné.** Valeurs réelles au poste de développement. |
| `.env.example` | Versionné. Modèle documenté des variables attendues, avec des valeurs factices. Sert de référence lors d'un nouveau onboarding. |
| `prisma.config.ts` | Configuration du CLI Prisma 6 (chemin du schéma, chemin des migrations, URL de datasource). Nécessaire car le schéma vit dans `Prisma/` et non à la racine. |

---

## 3. Point d'entrée — `src/server.ts`

| Fichier | Nécessité |
| --- | --- |
| `src/server.ts` | **Le seul point d'entrée.** Assure trois choses : (1) la construction de l'application Express via `createApp()`, (2) le démarrage du serveur et la connexion à la base, (3) la gestion du cycle de vie du processus (`SIGTERM`, `SIGINT`, `unhandledRejection`, `uncaughtException`). Il fixe l'ordre exact des middlewares globaux, qui est déterminant pour la sécurité. |

Chaîne globale, dans cet ordre :

```
helmet → cors → pinoHttp → compression → json/urlencoded → hpp
→ /api : apiLimiter → /api-docs → /api : routes
→ notFoundHandler → errorHandler
```

`helmet` avant `cors`, et `errorHandler` en dernier : c'est intentionnel. Un middleware d'erreur ne
fonctionne que s'il est enregistré **après** tous les `app.use` qu'il doit intercepter.

---

## 4. `src/Config/` — configuration et ressources globales

| Fichier | Nécessité |
| --- | --- |
| `env.ts` | Valide `process.env` avec un schéma Zod **au démarrage**, avant tout le reste. Si `PORT`, `DATABASE_URL` ou les secrets JWT manquent, le processus s'arrête immédiatement avec un message clair, au lieu de planter plus tard au milieu d'une requête. Derivé aussi `env.isProduction` et `env.corsOrigins` (découpage de la liste séparée par virgules). |
| `logger.ts` | Instance Pino unique partagée par toute l'application. Configure le niveau selon l'environnement, active `pino-pretty` en développement, et surtout déclare les **chemins à redacter** (`req.headers.authorization`, `req.body.password`, `*.password`, `*.refreshToken`). Sans ce fichier, un log de requête fuiterait les mots de passe et les tokens en clair. |
| `Database.ts` | Instancie le `PrismaClient` unique et exporte `connectDB` / `disconnectDB`. Centraliser l'instance évite d'ouvrir un pool de connexions par fichier, et donne un point unique où brancher la déconnexion propre lors de l'arrêt. |

---

## 5. `src/Utils/` — briques transverses sans dépendance métier

Ces fichiers n'appartiennent à aucune couche en particulier : ils sont utilisés par plusieurs
couches à la fois. C'est ce qui justifie leur dossier séparé.

| Fichier | Nécessité |
| --- | --- |
| `AppError.ts` | Hiérarchie d'erreurs opérationnelles (`NotFoundError`, `ConflictError`, `UnauthorizedError`, `ForbiddenError`, `ValidationError`). Chaque classe porte un couple statut/code fixe. **Pourquoi :** pour qu'un service exprime une règle métier par `throw new ConflictError(...)` sans connaître HTTP, et que le middleware d'erreur sache traduire sans deviner. Sans ce fichier, chaque couche réinventerait son format d'erreur. |
| `asyncHandler.ts` | Enveloppe un handler `async` pour que toute promesse rejetée soit transmise à `next(error)`. **Pourquoi :** supprime le `try/catch` dans les 8 contrôleurs, et garantit qu'aucune rejetion non gérée ne s'échappe. |
| `jwt.ts` | Signature et vérification des access/refresh tokens, avec **deux secrets distincts** et une claim `tokenType` obligatoire. **Pourquoi :** la vérification du type empêche un refresh token d'être rejoué comme access token. |
| `password.ts` | `hashPassword` / `comparePassword` (bcrypt) plus `hashToken` (SHA-256) et `createTokenId`. **Pourquoi :** seul le hash du refresh token est stocké en base — une fuite de la base de données ne permet donc pas de rejouer une session. |
| `pagination.ts` | Contrat unique de pagination : `toSkipTake` convertit une page en `skip`/`take` Prisma, `buildMeta` construit le bloc `meta` de chaque réponse listée. **Pourquoi :** évite que chaque endpoint recalcule `totalPages` à sa façon, donc évite que les réponses divergent. |
| `api.ts` | Déclare le contrat d'enveloppe `ApiResponse<T>` et trois constructeurs (`ok`, `created`, `paginated`). **Note :** ce fichier n'est actuellement importé par aucun contrôleur, qui construisent tous leur JSON en ligne. Il sert de spécification de format, ou de point de factorisation future. |

---

## 6. `src/Middleware/` — ce qui s'exécute autour des routes

| Fichier | Nécessité |
| --- | --- |
| `auth.middleware.ts` | `authenticate` extrait le token Bearer, le vérifie et renseigne `req.auth` (`idUser`, `email`, `role`). `requireRole(...roles)` est une fabrique qui n'autorise qu'une liste de rôles. **Pourquoi deux exports :** l'identité et l'habilitation sont deux décisions distinctes ; certaines routes (lecture) exigent seulement la première. |
| `error.middleware.ts` | Traducteur d'erreurs final. `normalise()` convertit les `AppError` **et** les erreurs Prisma (P2002 → 409, P2025 → 404, P2003 → 409, erreur d'init → 503, JSON malformé → 400) vers une forme unique `{statusCode, code, message, details}`. **Pourquoi :** le client ne doit jamais recevoir une erreur brute du driver MySQL, qui exposerait des noms de colonnes internes. Exporte aussi `notFoundHandler`, pour transformer un 404 en réponse structurée plutôt qu'en page HTML par défaut d'Express. |
| `rateLimit.middleware.ts` | Deux limiteurs `express-rate-limit` : `apiLimiter` (global, monté sur `/api`) et `authLimiter` (plus strict, `skipSuccessfulRequests`, monté sur `/auth/login` et `/auth/refresh`). Le `keyGenerator` privilégie `req.auth.email` puis `ipKeyGenerator(req.ip)`. **Pourquoi :** empêche le bourrage d'identifiants sans penaliser un utilisateur derrière un NAT partagé, ni être contourné par rotation IPv6. |
| `validate.middleware.ts` | Adaptateur Zod pour Express. Parse l'enveloppe `{body, query, params}` et **réécrit le résultat typé et coercé sur `req`**, de sorte qu'un contrôleur reçoit un vrai nombre (`"7"` → `7`) et non une chaîne. Convertit `ZodError` en `ValidationError` avec message par champ. **Pourquoi l'écriture sur `req` :** sans cela, chaque contrôleur devrait refaire le `Number()`/`Boolean()` lui-même, source classique de bugs. |

---

## 7. `src/Validators/` — schémas Zod, un par entité

Chaque fichier décrit la forme **et les contraintes** des données entrantes. Ils existent pour que la
validation soit déclarative, versionnée, et réutilisée comme source de vérité des types d'entrée.

| Fichier | Nécessité |
| --- | --- |
| `common.ts` | Fabriques d'enveloppe (`envelope`, `paramsOnly`, `queryOnly`) et schémas de params partagés (`idParams`, `idRequestParams`, `idLogisticServiceParams`, `idRequestAndUserParams`), plus `pageQuery`, `passwordSchema`, `trimmedEmail`. **Pourquoi `.passthrough()` :** une route enchaîne deux validations (params puis body) ; un `z.object({})` strict effacerait les params déjà validés par la première passe. |
| `auth.validator.ts` | Corps de `register` / `login` / `refresh` / `change-password`. `role` y est optionnel avec défaut `Employer` — la vérification réelle du droit à s'inscrire se fait dans `AuthService`, pas dans le schéma. |
| `user.validator.ts` | Schémas d'administration des utilisateurs : création, mise à jour, liste avec recherche par fragment d'email. Séparé de `auth.validator.ts` car la route est authentifiée et ajoute `isActive` et le filtre `search`. |
| `equipment.validator.ts` | Création, mise à jour (avec `.refine()` interdisant l'objet vide), et liste avec filtre `status`. |
| `breakdown.validator.ts` | Idem pour les pannes. Les enums `status` et `severity` reflètent exactement les enums Prisma, ce qui empêche la dérive entre la validation et la base. |
| `request.validator.ts` | Demandes de service des employés. Seul `description` est modifiable, donc un `PATCH` remplace en pratique le texte. |
| `submission.validator.ts` | Soumissions. La clé est composite `(idUser, idRequest)` : la liste filtre donc par `idRequest`, et il n'y a **pas** de schéma d/update. Le propriétaire est déduit du JWT, jamais du body. |
| `logisticService.validator.ts` | Affectations demande → logisticien. **Pas de schéma d'update :** une affectation est immuable, on ne fait que créer et supprimer. |
| `license.validator.ts` | Licences : création, mise à jour, liste. |

---

## 8. `src/services/` — les règles métier

C'est ici que vivent les décisions qui n'appartiennent ni au HTTP ni au SQL : 404 sur ressource
absente, 409 sur doublon, cohérence entre entités, cycle de vie d'un statut, assemblage de la
pagination. Chaque service exporte une **instance unique** (singleton), donc aucun état partagé.

| Fichier | Nécessité |
| --- | --- |
| `AuthService.ts` | Émission, rotation et révocation des tokens. Deux durcissements notables : lors d'un login sur un e-mail inconnu, un `comparePassword` factice est exécuté contre un hash fixe, afin que le temps de réponse ne révèle pas quels e-mails existent ; lors d'un refresh dont le hash stocké ne correspond pas, le token stocké est mis à `null`, ce qui invalide toute la session (détection de réutilisation). |
| `UserService.ts` | Gestion des utilisateurs côté administration. `updateUser` re-hache le mot de passe à chaque changement et ne laisse jamais transiter un hash par l'API ; `deleteUser` efface d'abord le refresh token, pour que les sessions meurent avant la disparition de la ligne. |
| `EquipmentService.ts` | CRUD du parc informatique, avec vérification d'existence du détenteur (`idUser`), plus l'assemblage pagination. |
| `BreakdownService.ts` | Gère le cycle de vie de `resolvedAt` : positionné à `now` au passage en `RESOLVED`/`CLOSED`, remis à `null` à la réouverture, **laissé intact** si `status` ne fait pas partie de la mise à jour. Vérifie aussi que l'équipement existe. |
| `RequestService.ts` | Décision de propriété au niveau de la ligne. `listRequests` bascule sur `findManyByAuthor`/`countByAuthor` pour un acteur non privilégié ; `updateRequest`/`deleteRequest` lèvent `NotFoundError` (et non 403) si la ligne n'est pas celle de l'acteur, afin que l'API ne confirme pas l'existence des demandes des autres. |
| `SubmissionService.ts` | Applique « on ne soumet que sa propre demande » et bloque la double soumission via la clé composite. `listSubmissions` filtre par `idRequest` pour un acteur privilégié mais par `idUser` pour un acteur ordinaire. |
| `LogisticService.ts` | Règles d'affectation : la demande doit exister, l'affecté doit exister, son rôle doit être `Logistician` ou `Administrator`, et le couple doit être inédit. Seul service qui lève un `ForbiddenError` sur un champ de la ressource plutôt que sur l'acteur. |
| `LicenseService.ts` | Fait correspondre les deux invariants déclarés par les `@unique` du schéma (un numéro par licence, une licence par équipement) et traduit l'erreur brute P2002 en `ConflictError` lisible. Sur mise à jour, exclut l'enregistrement courant du test de doublon. |

---

## 9. `src/repositories/` — le seul accès à Prisma

Règle absolue : **aucun autre dossier n'importe `@prisma/client`**. Centraliser les requêtes SQL
permet de changer de base ou d'optimiser une requête sans toucher à la logique métier.

| Fichier | Nécessité |
| --- | --- |
| `UserRepository.ts` | Accès à `user`. Suit une politique de `select` explicite (`userPublicFields`) pour que `password` et `refreshToken` ne puissent **jamais** atteindre une réponse HTTP. Les deux méthodes `findByEmailWithPassword` / `findByIdWithPassword` sont des exceptions documentées, réservées à l'authentification. `buildWhere` met `search` en minuscules, les e-mails stockés étant déjà normalisés. |
| `EquipmentRepository.ts` | Accès à `equipment`, avec le même `select` explicite, trié par `idEquipment`. |
| `BreakdownRepository.ts` | Accès à `breakdown`, même `select`, tri par `createdAt`. |
| `RequestRepository.ts` | Accès à `request`. Distingue `findMany`/`count` (tout, pour un privilégié) de `findManyByAuthor`/`countByAuthor` (ses seules lignes). |
| `SubmissionRepository.ts` | Accès à `submission`. Toutes les recherches passent par la clé composite ; les filtres sont construits par étalement conditionnel pour qu'une valeur `undefined` ne devienne jamais un filtre littéral. |
| `LogisticServiceRepository.ts` | Accès à `logisticservice`. `findByPair` utilise l'unique composé `idRequest_idLogistician`, qui fonde le contrôle d'affectation en double. |
| `LicenseRepository.ts` | Accès à `license`, toujours avec `include: { equipment: true }`. Diffère du reste : pas de `select`, et il calcule lui-même `skip`/`take`/`totalPages` pour renvoyer directement `{data, meta}`. |

---

## 10. `src/controllers/` — la couche HTTP

Un contrôleur ne contient **aucune règle métier** et **aucune requête SQL**. Il lit `req`, délègue
au service, choisit le code de statut, écrit le JSON. Toutes les méthodes sont enveloppées par
`asyncHandler`, et chaque fichier exporte une instance unique par défaut.

| Fichier | Nécessité |
| --- | --- |
| `auth.controller.ts` | `register` applique un garde de rôle : si un acteur est présent, il doit être `Administrator` ou `Director`. `me` renvoie l'identité dérivée du JWT **sans aller en base**. |
| `user.controller.ts` | CRUD d'administration. Aucune logique de propriété par ligne, car `requireRole` filtre déjà tout sauf `getById`. |
| `equipment.controller.ts` | CRUD parc informatique, forme identique à celle des pannes. |
| `breakdown.controller.ts` | CRUD pannes. Le `reporterId` est pris depuis `req.auth.idUser` et **jamais** depuis le body : un client ne peut donc pas déclarer une panne au nom d'un autre. |
| `request.controller.ts` | Définit `PRIVILEGED_ROLES = ['Administrator','Director','Manager']` et transmet `{authorId, isPrivileged}` au service. C'est le point de décision d'appartenance de toute la fonctionnalité. |
| `submission.controller.ts` | Reprend le même schéma, avec `PRIVILEGED_ROLES`. `getById` et `delete` reçoivent la paire composite `(idRequest, idUser)` des params. |
| `logisticService.controller.ts` | Cycle de vie d'affectation uniquement, puisqu'il n'y a pas d'update. |
| `license.controller.ts` | CRUD licences plus `getStats`. `getAll` étale directement le résultat du repository (`{success: true, ...result}`) au lieu de la forme `{data, meta}` habituelle. |

---

## 11. `src/routes/` — la surface HTTP

Un routeur = un dossier métier. C'est le **seul** endroit où les middlewares sont combinés par
endpoint, selon un motif constant :

```
authenticate → [requireRole] → [validate(params)] → [validate(body)] → contrôleur
```

| Fichier | Nécessité |
| --- | --- |
| `index.ts` | Point d'agrégation. Crée un unique `Router` et monte les 9 routeurs sous des préfixes fixes. Il ne définit aucune route ni middleware : changer un préfixe se fait à un seul endroit. |
| `health.routes.ts` | Seul routeur sans authentification ni validation, et seul à avoir un handler en ligne au lieu d'un contrôleur. Exécute `SELECT 1` et renvoie 200/503, ce qui permet à un orchestrateur de distinguer « appli up » de « base down ». |
| `auth.routes.ts` | `register`, `login` et `refresh` sont ouvertes ; `logout`, `me` et `password` exigent `authenticate`. Porte les blocs JSDoc `@openapi` consommés par `swagger.ts`. |
| `user.routes.ts` | Portes de rôle : `ADMIN = ['Administrator','Director']`, restreint à `Administrator` pour la suppression. |
| `equipment.routes.ts` | Porte `MANAGER = ['Administrator','Director','Manager']` sur toutes les écritures ; lectures ouvertes à tout utilisateur authentifié. |
| `breakdown.routes.ts` | Deux portes distinctes : `LOGISTIC` (ajoute `Logistician`) peut clôturer ou modifier une panne, `MANAGER` seul peut la supprimer. Un employé peut donc **déclarer** une panne, mais ni la résoudre ni la supprimer. |
| `request.routes.ts` | Porte `MANAGER` uniquement sur la suppression. L'autorisation de mise à jour est déléguée à `RequestService`, qui lève un `NotFoundError` plutôt qu'un 403. |
| `logisticService.routes.ts` | Aucune route d'update, les affectations étant immuables. |
| `submission.routes.ts` | Routes à clé composite. La création est ouverte, mais le service force `idUser = actorId` : un utilisateur ne peut soumettre que sa propre demande. |
| `license.routes.ts` | Porte `MANAGER` sur les écritures, plus une route de statistiques. |

---

## 12. Fichiers transverses restants

| Fichier | Nécessité |
| --- | --- |
| `src/types/express.d.ts` | Augmentation globale d'`Express.Request` ajoutant `req.auth?: { idUser; email; role }`. **Pourquoi un `.d.ts` :** c'est le contrat qui permet à `authenticate` et à tous les contrôleurs aval de lire l'utilisateur authentifié avec un typage complet, sans cast. |
| `src/Docs/swagger.ts` | Construit le document OpenAPI 3.0.3 au chargement, via `swagger-jsdoc`, en analysant les blocs `@openapi` de `src/routes/**/*.ts`. Centralise les schémas réutilisables (`Tokens`, `User`, `Equipment`, `Breakdown`, `Request`, `Assignment`, `Submission`, `License`, `Error`) et le schéma de sécurité `bearerAuth`. Monté par `server.ts` sur `/api-docs`. **Pourquoi le générer depuis le code :** la documentation ne peut pas diverger des routes, puisqu'elle en est extraite. |

---

## 13. `Prisma/` — le modèle de données

| Fichier | Nécessité |
| --- | --- |
| `Schema.prisma` | Source de vérité du modèle. Chaque modèle porte ses index nommés (`@@index([...], map: "...")`) et ses contraintes de clé étrangère nommées, pour que le SQL généré soit stable et lisible. Déclare aussi le modèle `prisma_migrations` aligné sur la table interne `_prisma_migrations`. |
| `migrations/migration_lock.toml` | Verrouille le fournisseur `mysql` pour toutes les migrations du dossier. |
| `migrations/20260923111836_rhopen_park/migration.sql` | Migration initiale : crée 6 tables (`breakdown`, `equipment`, `logisticservice`, `request`, `submission`, `user`), l'index unique sur `equipment.serialNumber` et `user.professionalEmail`, la clé primaire composite `(idUser, idRequest)` sur `submission`, l'enum `user.role`, et 6 clés étrangères. |
| `migrations/20260928010000_align_model/migration.sql` | Réaligne le modèle sur le code : **alterne les 6 tables, n'en crée aucune**. Supprime les 6 clés étrangères d'origine, ajoute `createdAt`/`updatedAt` partout, ajoute `breakdown.status`/`severity`/`resolvedAt`/`idUser`/`idEquipment`, `equipment.status`/`idUser`, `request.idUser`, remplace les colonnes dénormalisées `logisticservice.professionalEmail`/`.password` par une vraie relation `idLogistician`, et crée 8 nouveaux index dont `UQ_Assignment_Request_Logistician`. |

---

## 14. `scripts/`

| Fichier | Nécessité |
| --- | --- |
| `checkDb.mjs` | Test de fumée opérationnel, exécutable hors de l'application. Il lit `DATABASE_URL` directement dans `.env`, puis affiche la base résolue, la version du serveur, la liste des tables et le nombre d'utilisateurs. **Pourquoi :** pendant l'installation, il faut pouvoir distinguer « la base est injoignable » de « l'application est cassée » sans démarrer le serveur. |

---

## 15. Points de vigilance relevés dans le code

Ces anomalies n'ont pas été corrigées : elles sont signalées pour arbitrage.

| Emplacement | Constat |
| --- | --- |
| `src/routes/license.routes.ts` | `GET /licenses/stats` est déclarée **après** `GET /licenses/:id`, donc masquée par elle. `getStats` est inatteignable. |
| `src/controllers/license.controller.ts` | Lit `req.params.idLicense` alors que la route déclare `:id` et que `idParams` valide `id` : `Number(undefined)` vaut `NaN` sur les opérations par identifiant. |
| `src/routes/user.routes.ts` | `GET /users/:id` a `authenticate` mais **pas** `requireRole` : tout utilisateur authentifié peut lire n'importe quel utilisateur. |
| `Prisma/migrations/` | **Aucune migration ne crée la table `license`**, alors que le modèle est complet dans le schéma et entièrement implémenté. Un `migrate deploy` sur une base neuve ne la créera pas. |
| `src/services/LogisticService.ts` | Entité réellement nommée « affectation demande → logisticien ». Le fichier conserve `LogisticService` alors que ses frères sont `<Entité>Service`, et il est le seul service avec une majuscule au nom de fichier. Deux vocabulaires coexistent : `assignmentPublicFields` dans le repository, `LogisticService` dans le service. |
| `src/Utils/api.ts` | `ok()` et `created()` sont identiques, et le fichier n'est importé nulle part. |
| `src/Utils/pagination.ts` | `paginationQuerySchema` n'est utilisé nulle part : les routes utilisent le `pageQuery` plus faible de `Validators/common.ts`, qui n'a ni `.min(1)`, ni `.max(100)`, ni `.default()` — les valeurs par défaut documentées ne sont donc jamais appliquées. |
| `src/Validators/license.validator.ts` | `updateLicenseSchema` rend ses trois champs obligatoires, ce qui rend le `.refine()` « au moins un champ » inatteignable et oblige un `PATCH` à renvoyer le formulaire complet. |
| `src/Docs/swagger.ts` | `License.licenseNumber` est typé `integer` alors que le modèle est un `VarChar(100)` ; le tag `Systeme` utilisé par `health.routes.ts` n'est pas déclaré ; plusieurs champs documentés contredisent les validateurs (`equipmentId`/`requestId`/`logisticianId` au lieu de `idEquipment`/`idRequest`/`idLogistician`). |
| `src/repositories/LicenseRepository.ts` | Importe `ConflictError` et `NotFoundError` sans les utiliser. |
| `.env` | `JWT_REFRESH_SECRET` est déclaré **deux fois** avec deux valeurs différentes. `dotenv` conserve la première ; la seconde est silencieusement ignorée. |
| `eslint.config.js` | Le motif `ignores` utilise `Prisma/**` (majuscule), qui ne correspondrait pas au chemin réel sur un système de fichiers sensible à la casse. |
