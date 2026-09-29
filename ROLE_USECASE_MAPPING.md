# Mapping Rôles → Use Cases - RHopenLabs

**Référence :** Schéma Prisma `user_role` enum

---

## 1. Administrator (Super Admin)

**Description :** Accès total, configuration système, gestion des admins.

### Permissions
| Ressource | GET | POST | PATCH | DELETE |
|-----------|-----|------|-------|--------|
| Users | ✅ Tous | ✅ Tous rôles | ✅ Tous | ✅ Tous |
| Equipment | ✅ Tous | ✅ | ✅ | ✅ |
| Breakdowns | ✅ Tous | ✅ | ✅ | ✅ |
| Requests | ✅ Tous | ✅ | ✅ | ✅ |
| Logistic Services | ✅ Tous | ✅ | - | ✅ |
| Submissions | ✅ Tous | - | - | ✅ |

### Actions spécifiques
- Créer des comptes **Administrator** / **Director** (via `POST /users`)
- Désactiver/réactiver n'importe quel compte (`isActive`)
- Voir toutes les données sans restriction
- Configurer rate limits, CORS, secrets via variables d'env

---

## 2. Director (Direction)

**Description :** Pilotage stratégique, vue globale, validation.

### Permissions
| Ressource | GET | POST | PATCH | DELETE |
|-----------|-----|------|-------|--------|
| Users | ✅ Tous | ✅ (sauf Admin) | ✅ (sauf Admin) | ❌ |
| Equipment | ✅ Tous | ✅ | ✅ | ✅ |
| Breakdowns | ✅ Tous | ✅ | ✅ | ✅ |
| Requests | ✅ Tous | ✅ | ✅ | ✅ |
| Logistic Services | ✅ Tous | ✅ | - | ✅ |
| Submissions | ✅ Tous | - | - | ✅ |

### Actions spécifiques
- Créer des **Manager**, **Logistician**, **Employer** (pas Admin)
- Valider/réaffecter les demandes critiques
- Tableaux de bord : stats globales, SLA, coûts
- Export rapports (PDF/Excel)

### Endpoints recommandés à ajouter
```
GET /api/dashboard/stats           # KPIs globaux
GET /api/dashboard/breakdowns/trends
GET /api/dashboard/equipment/aging
GET /api/reports/export?format=pdf
```

---

## 3. Manager (Responsable)

**Description :** Gestion opérationnelle équipe, affectation ressources.

### Permissions
| Ressource | GET | POST | PATCH | DELETE |
|-----------|-----|------|-------|--------|
| Users | ❌ | ❌ | ❌ | ❌ |
| Equipment | ✅ Tous | ✅ | ✅ | ✅ |
| Breakdowns | ✅ Tous | ✅ | ✅ (statut) | ✅ |
| Requests | ✅ Tous | ✅ | ✅ | ✅ |
| Logistic Services | ✅ Tous | ✅ | - | ✅ |
| Submissions | ✅ Tous | - | - | ✅ |

### Actions spécifiques
- **Créer/modifier/supprimer** équipements
- **Affecter** logisticiens aux demandes (`POST /logistic-services`)
- Valider/Clôturer pannes (`PATCH /breakdowns/:id` status)
- Gérer les demandes de son périmètre
- Voir charge de travail logisticiens

### Endpoints recommandés
```
GET /api/manager/team-workload
GET /api/manager/equipment/status-summary
POST /api/manager/validate-request/:id
```

---

## 4. Logistician (Service Logistique)

**Description :** Terrain, interventions, résolution pannes.

### Permissions
| Ressource | GET | POST | PATCH | DELETE |
|-----------|-----|------|-------|--------|
| Users | ❌ (sauf soi) | ❌ | ❌ | ❌ |
| Equipment | ✅ (dispo/affecté) | ❌ | ❌ | ❌ |
| Breakdowns | ✅ (assignées) | ✅ | ✅ (statut, résolution) | ❌ |
| Requests | ✅ (assignées) | ❌ | ❌ | ❌ |
| Logistic Services | ✅ (siennes) | ❌ | - | ❌ |
| Submissions | ✅ (siennes) | ✅ (propres) | - | ❌ |

### Actions spécifiques
- **Déclarer** pannes (`POST /breakdowns`)
- **Mettre à jour** statut panne : `OPEN → IN_PROGRESS → RESOLVED → CLOSED`
- **Soumettre** ses interventions (`POST /submissions`)
- Voir demandes qui lui sont affectées
- Scanner QR code équipement → voir historique pannes

### Endpoints recommandés
```
GET /api/logistician/my-assignments
GET /api/logistician/my-breakdowns
PATCH /api/breakdowns/:id/resolve   # {resolutionNote, photos[]}
GET /api/equipment/:id/history      # pannes passées
```

---

## 5. Employer (Employé / Demandeur)

**Description :** Utilisateur final, création demandes, suivi propre.

### Permissions
| Ressource | GET | POST | PATCH | DELETE |
|-----------|-----|------|-------|--------|
| Users | ❌ (sauf soi) | ❌ | ❌ (sauf pwd) | ❌ |
| Equipment | ✅ (catalogue) | ❌ | ❌ | ❌ |
| Breakdowns | ✅ (propres) | ✅ | ❌ | ❌ |
| Requests | ✅ (propres) | ✅ | ✅ (propres) | ❌ |
| Logistic Services | ❌ | ❌ | - | ❌ |
| Submissions | ✅ (propres) | ✅ (propres) | - | ❌ |

### Actions spécifiques
- **S'inscrire** seul (`POST /auth/register` role Employer/Logistician)
- **Créer** demandes service (`POST /requests`)
- **Déclarer** pannes sur son équipement (`POST /breakdowns`)
- **Soumettre** ses demandes (`POST /submissions`)
- **Suivre** SES demandes/pannes/soumissions
- **Changer** son mot de passe (`PUT /auth/password`)

### Endpoints recommandés
```
GET /api/employer/my-requests
GET /api/employer/my-breakdowns
GET /api/employer/my-submissions
GET /api/employer/my-equipment      # équipements qui lui sont affectés
POST /api/requests                  # {title, description, equipmentId?}
```

---

## Matrice récapitulative

| Fonctionnalité | Admin | Director | Manager | Logistician | Employer |
|----------------|-------|----------|---------|-------------|----------|
| Gestion users (CRUD) | ✅ | 🟡 (pas Admin) | ❌ | ❌ | ❌ |
| Gestion equipment (CRUD) | ✅ | ✅ | ✅ | ❌ | ❌ |
| Déclarer panne | ✅ | ✅ | ✅ | ✅ | ✅ (propre) |
| Résoudre panne | ✅ | ✅ | ✅ | ✅ (assignée) | ❌ |
| Créer demande | ✅ | ✅ | ✅ | ❌ | ✅ (propre) |
| Affecter logisticien | ✅ | ✅ | ✅ | ❌ | ❌ |
| Soumettre intervention | ✅ | ❌ | ❌ | ✅ (propre) | ✅ (propre) |
| Voir tout (global) | ✅ | ✅ | ❌ | ❌ | ❌ |
| Voir assigné (scope) | ✅ | ✅ | ✅ | ✅ | ✅ (propre) |
| Rapports/Exports | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## Implémentation technique

### 1. Middleware `requireRole` (existant)
```typescript
// src/Middleware/auth.middleware.ts
export const requireRole = (...allowed: user_role[]) => 
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth || !allowed.includes(req.auth.role)) {
      throw new ForbiddenError('Rôle insuffisant');
    }
    next();
  };
```

### 2. Filtrage par scope (existant dans controllers)
```typescript
// Exemple RequestController.getAll
if (req.auth.role === 'Employer' || req.auth.role === 'Logistician') {
  where.idUser = req.auth.idUser; // isolation
}
// Admin/Director/Manager voient tout
```

### 3. Nouveaux middlewares recommandés
```typescript
// src/Middleware/scope.middleware.ts
export const filterByScope = (model: 'request' | 'breakdown' | 'submission') => 
  (req: Request, res: Response, next: NextFunction) => {
    const { role, idUser } = req.auth!;
    const isGlobal = ['Administrator', 'Director', 'Manager'].includes(role);
    
    if (!isGlobal) {
      req.scope = { userId: idUser }; // injecté pour controller
    }
    next();
  };
```

### 4. Endpoints dashboard par rôle
```typescript
// src/routes/dashboard.routes.ts (à créer)
router.get('/stats', authenticate, requireRole('Administrator', 'Director'), DashboardController.globalStats);
router.get('/my-workload', authenticate, requireRole('Logistician'), DashboardController.myWorkload);
router.get('/my-requests', authenticate, requireRole('Employer'), DashboardController.myRequests);
```

---

## Checklist d'adaptation

- [ ] Vérifier middleware `requireRole` sur toutes routes protégées
- [ ] Ajouter `filterByScope` sur GET liste (Requests, Breakdowns, Submissions)
- [ ] Implémenter endpoints Dashboard par rôle
- [ ] Ajouter tags Swagger par rôle (voir `swagger.ts`)
- [ ] Tests Postman par rôle (collection avec variables d'env par rôle)
- [ ] Documentation utilisateur par rôle (guide PDF)

---

## Prochaines étapes

1. **Lire les 5 images** → me décrire les écrans/fonctionnalités attendus
2. **Valider cette matrice** → ajuster permissions si différent
3. **Implémenter endpoints manquants** (dashboard, exports, resolve panne)
4. **Ajouter tests E2E** par rôle avec la collection Postman

---

*Document basé sur le schéma Prisma actuel. À affiner selon vos captures d'écran.*