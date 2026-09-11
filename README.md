# Up Network — ERP / CRM

Suite de gestion pour PME : **CRM**, **cycle de vente** (devis → commande →
facture → règlement), **achats & stock**, **projets**, **ressources humaines**
et **états comptables** — le tout multi-société, avec un contrôle d'accès fin.

API **NestJS + Prisma + PostgreSQL**, interface web **React + Vite + TypeScript**.

<p>
  <img alt="NestJS" src="https://img.shields.io/badge/API-NestJS%2011-E0234E">
  <img alt="React" src="https://img.shields.io/badge/Web-React%2019%20%2B%20Vite-61DAFB">
  <img alt="Prisma" src="https://img.shields.io/badge/ORM-Prisma%206-2D3748">
  <img alt="PostgreSQL" src="https://img.shields.io/badge/DB-PostgreSQL%2016-4169E1">
  <img alt="Tests" src="https://img.shields.io/badge/tests-128%20passing-3FB950">
</p>

| Chiffre | |
|---|---|
| **10** modules fonctionnels | CRM, ventes, achats, stock, projets, RH, comptabilité, cœur |
| **84** permissions | catalogue unique, appliqué côté serveur |
| **34** modèles Prisma · **21** migrations | schéma versionné |
| **128** tests unitaires | logique métier (totaux, TVA, workflow, congés…) |
| **26** écrans web · **1** doc OpenAPI | interface `web/` + Swagger sur `/docs` |

---

## Sommaire

- [Démarrage](#démarrage)
- [Comptes de démonstration](#comptes-de-démonstration)
- [Architecture](#architecture)
- [Modèle de sécurité](#modèle-de-sécurité)
- [Modules](#modules)
- [Points d'entrée de l'API](#points-dentrée-de-lapi)
- [Modèle de données](#modèle-de-données)
- [Organisation du code](#organisation-du-code)
- [Développement & tests](#développement--tests)
- [Le dossier `frontend/` (Flutter)](#le-dossier-frontend-flutter)

---

## Démarrage

Prérequis : **Node 20+**, **Docker** (ou un PostgreSQL déjà installé).

```bash
# 1. Installe les dépendances, lance PostgreSQL, applique les migrations et le seed
npm run setup

# 2. Prépare l'environnement de l'API
cp backend/.env.example backend/.env   # valeurs alignées sur docker-compose

# 3. Dans deux terminaux
npm run dev:api    # http://localhost:3000  (API + doc OpenAPI sur /docs)
npm run dev:web    # http://localhost:5173  (interface web)
```

> `npm install` peut bloquer les scripts d'installation selon la version de npm.
> Si Prisma ou bcrypt échouent :
> `npm --prefix backend exec -- npm install-scripts approve @prisma/client @prisma/engines prisma bcrypt`

Une fois l'API lancée : la santé du service est sur
[`/health`](http://localhost:3000/health) et la documentation interactive des
routes sur [`/docs`](http://localhost:3000/docs).

### Comptes de démonstration

| Compte | Mot de passe | Rôle | Accès |
|---|---|---|---|
| `admin@demo.com` | `admin123` | Admin | tout |
| `commercial@demo.com` | `demo1234` | Commercial | CRM + ventes, pas d'administration |
| `lecteur@demo.com` | `demo1234` | Lecteur | consultation seule |

Le seed remplit **tous** les modules avec un jeu cohérent : tiers, catalogue et
stock, devis / commandes / factures / règlements, pipeline CRM, **employés,
congés et notes de frais**, **projets avec tâches et temps saisis**. De quoi
voir chaque écran vivant dès la première connexion.

### Variables d'environnement

`backend/.env` (modèle dans `backend/.env.example`) :

```ini
DATABASE_URL="postgresql://upnet:upnet@localhost:5433/up_network?schema=public"
JWT_SECRET="…"                                   # obligatoire, l'API refuse de démarrer sans
JWT_EXPIRES_IN="7d"
PORT=3000
FRONTEND_URL="http://localhost:5173"             # plusieurs origines séparées par des virgules
# SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD  # facultatif : sans SMTP_HOST, les e-mails sont journalisés
SMTP_FROM="facturation@democorp.fr"
```

`web/.env` : `VITE_API_URL=http://localhost:3000`

### Scripts utiles

| Commande | Effet |
|---|---|
| `npm run db:up` / `db:down` | démarre / arrête PostgreSQL (Docker, port **5433**) |
| `npm run db:migrate` | applique les migrations |
| `npm run db:seed` | injecte permissions, rôles et comptes (données de démo si la base est vide) |
| `npm run db:seed:fresh` | remplace les données de démo par un jeu neuf (comptes et rôles conservés) |
| `npm run db:studio` | ouvre Prisma Studio |
| `npm run build` | compile l'API et le front |
| `npm run typecheck` | vérifie les types des deux projets |
| `npm --prefix backend test` | lance les tests unitaires de l'API |

---

## Architecture

```mermaid
flowchart LR
  subgraph Client
    W["web/ — React + Vite<br/>(interface maintenue)"]
  end
  subgraph API["backend/ — NestJS"]
    G["JwtAuthGuard<br/>+ PermissionsGuard"]
    M["Modules métier<br/>CRM · Ventes · Achats · Stock<br/>Projets · RH · Comptabilité"]
    D["common/documents<br/>totaux · numérotation · workflow"]
  end
  DB[("PostgreSQL<br/>Prisma")]
  SMTP["SMTP<br/>(rappels, envoi de docs)"]

  W -- "JWT Bearer" --> G --> M
  M --> D
  M --> DB
  M -. "e-mails" .-> SMTP
```

Chaque requête traverse `JwtAuthGuard` (identité + société active) puis
`PermissionsGuard` (droit précis). Les quatre documents commerciaux réutilisent
les mêmes briques `common/documents` plutôt que de dupliquer le calcul de TVA,
la numérotation ou les transitions de statut.

---

## Modèle de sécurité

Trois règles structurent l'API :

1. **La société active vient du jeton, jamais du client.** Le JWT porte `companyId` ;
   les contrôleurs le lisent via le décorateur `@CompanyId()`. Aucune route
   n'accepte de `?companyId=` — un utilisateur ne peut donc pas lire les
   données d'une autre société en changeant un paramètre d'URL.
2. **Chaque route porte sa permission.** `@RequirePermission(module, ressource, action)`
   est vérifié par `PermissionsGuard`, qui résout le rôle **dans la société active**.
   Le catalogue fait foi : `backend/src/common/constants/permissions.ts` (84 permissions).
3. **Le front reflète les permissions, il ne les applique pas.** `/auth/me` renvoie
   la liste des permissions ; menus et boutons s'adaptent, mais l'autorisation
   reste décidée côté serveur.

À l'inscription, `POST /auth/register` crée la société, un rôle **Admin** doté de
toutes les permissions, et rattache le compte. Avec un `companyCode`, le compte
rejoint une société existante **sans rôle** — un admin doit lui en attribuer un.

**Sessions.** Le login renvoie un jeton d'accès court et un **refresh token**
persistant (`POST /auth/refresh` le renouvelle, `POST /auth/logout` le révoque),
ce qui permet d'expirer les accès sans déconnecter brutalement l'utilisateur.

---

## Modules

**Cœur** — sociétés, utilisateurs, rôles, permissions, multi-société avec bascule
(`/auth/switch-company`).

**CRM** :
- **Pistes** : statuts (nouvelle → contactée → qualifiée / non qualifiée), source,
  potentiel estimé, responsable.
- **Conversion** : une piste devient un tiers, et facultativement une opportunité ;
  l'opération est transactionnelle et rattache les activités existantes.
- **Pipeline** : opportunités par étape (qualification, proposition, négociation,
  gagnée, perdue), montant pondéré par la probabilité, glisser-déposer entre colonnes.
- **Activités** : appels, réunions, e-mails, tâches, notes — rattachées à une piste,
  une opportunité ou un tiers, avec échéance et repérage des retards.
- **Tiers & contacts** : clients, fournisseurs ou les deux, avec interlocuteurs,
  adresse complète et n° de TVA.

**Cycle de vente** — devis → commande → facture → règlements :

| Document | Référence | Cycle de vie |
|---|---|---|
| Devis | `DE2026-0001` | brouillon → validé → signé / refusé → converti |
| Commande | `CO2026-0001` | brouillon → validée → expédiée → facturée |
| Facture | `FA2026-0001` | brouillon → impayée → partielle → réglée |
| Avoir | `AV2026-0001` | émis depuis une facture, montants négatifs |
| Commande fournisseur | `CF2026-0001` | brouillon → commandée → réceptionnée |

- **TVA** : chaque ligne porte quantité, prix unitaire HT, remise et taux de TVA ;
  les totaux HT / TVA / TTC sont calculés côté serveur, avec un détail par taux.
- **Documents figés** : chaque document a ses **propres** lignes. Une conversion
  recopie les lignes, elle ne les partage pas — modifier une commande ne change
  jamais une facture déjà émise. Un verrou optimiste empêche deux modifications
  concurrentes de s'écraser.
- **Multi-devises** : un document peut être libellé dans une autre devise ; le
  taux et les montants convertis dans la devise société sont figés, pour que la
  balance âgée et les états comptables restent cohérents.
- **Avoirs** : une facture peut générer un avoir (note de crédit) qui vient
  diminuer l'encours.
- **Règlements** : partiels ou totaux, plusieurs moyens de paiement ; le statut et
  le reste à payer se déduisent des encaissements, ils ne se saisissent pas.
- **PDF & envoi** : facture, devis, commande et commande fournisseur exportables
  en PDF ; une facture s'envoie par e-mail au client (`/invoices/:id/send`).
- **Pièces jointes** : n'importe quel document peut porter des fichiers
  (`/attachments`), stockés et re-téléchargeables.

**Achats & stock** :
- **Entrepôts** multiples, avec un entrepôt par défaut.
- **Niveaux de stock** par produit et par entrepôt, valorisation au prix d'achat,
  seuils d'alerte de réapprovisionnement.
- **Mouvements** : chaque variation est journalisée avec sa quantité signée, le
  stock résultant et son document d'origine. Expédier une commande sort le stock,
  réceptionner une commande fournisseur l'entre — automatiquement et dans la même
  transaction que le changement de statut.
- **Ajustements et transferts** manuels avec motif.

**Projets** :
- **Projets** rattachés à un client, avec responsable, budget en heures et taux
  horaire ; statuts brouillon → actif → en pause → clôturé.
- **Tâches** ordonnées, avec assigné, estimation et échéance.
- **Suivi du temps** : saisies horaires par tâche, distinguant le temps
  **refacturable** du temps interne — base d'une future facturation au temps passé.

**Ressources humaines** :
- **Employés** : fiche par société, rattachable à un compte applicatif, solde de
  congés payés.
- **Congés** : demandes typées (CP, RTT, maladie, sans solde…), décompte des
  **jours ouvrés** en excluant les jours fériés français, circuit d'approbation
  qui décrémente le solde.
- **Notes de frais** : lignes catégorisées avec TVA, totaux calculés côté serveur,
  circuit soumission → approbation → remboursement.

**Comptabilité & pilotage** :
- **Balance âgée** (`/reports/aging`) : encours client ventilé par ancienneté.
- **Impayés & relances** (`/reports/overdue`, `+ /:id/reminder`) : factures en
  retard et envoi de rappels.
- **TVA** (`/reports/vat`) : TVA collectée et déductible par taux sur une période.
- **Export FEC** (`/reports/fec`) : fichier des écritures comptables au format
  réglementaire français.
- **Tableau de bord** : chiffre d'affaires facturé, encours et retards de paiement,
  devis en cours, pipeline, meilleurs clients, alertes de stock, activité récente.

---

## Points d'entrée de l'API

Documentation interactive complète (schémas déduits des DTO) sur **`/docs`**.

```
GET    /health                         # sonde de disponibilité (public)

Auth & session
POST   /auth/register    POST /auth/login    POST /auth/refresh    POST /auth/logout
GET    /auth/me          POST /auth/switch-company

Pilotage
GET    /dashboard/overview | /revenue | /top-partners | /recent

CRM
GET    /crm/leads            POST /crm/leads          GET  /crm/leads/stats
POST   /crm/leads/:id/convert
GET    /crm/opportunities    GET  /crm/opportunities/pipeline
PATCH  /crm/opportunities/:id/stage
GET    /crm/activities       PATCH /crm/activities/:id/toggle
GET    /partners/:id/contacts   POST /partners/:id/contacts

Cycle de vente
GET    /quotes               POST /quotes             GET  /quotes/:id/pdf
PATCH  /quotes/:id/status    POST /quotes/:id/convert       → commande
GET    /orders               POST /orders             GET  /orders/:id/pdf
PATCH  /orders/:id/status    POST /orders/:id/ship          → sortie de stock
                             POST /orders/:id/invoice       → facture
GET    /invoices             POST /invoices           GET  /invoices/:id/pdf
PATCH  /invoices/:id/status  POST /invoices/:id/credit-note → avoir
POST   /invoices/:id/send                                   → e-mail au client
GET    /invoices/:id/payments   POST /invoices/:id/payments

Achats & stock
GET    /purchases            POST /purchases          GET  /purchases/:id/pdf
PATCH  /purchases/:id/status POST /purchases/:id/receive    → entrée de stock
GET    /stock/levels         GET  /stock/movements
POST   /stock/adjust         POST /stock/transfer
GET    /stock/warehouses     POST /stock/warehouses

Projets
GET    /projects             POST /projects           PATCH /projects/:id/status
POST   /projects/:id/tasks   PATCH /projects/:id/tasks/:taskId
POST   /projects/:id/time    DELETE /projects/:id/time/:entryId

Ressources humaines
GET    /hr/employees         POST /hr/employees       GET  /hr/employees/me
GET    /hr/leave-requests    POST /hr/leave-requests  GET  /hr/leave-requests/summary
PATCH  /hr/leave-requests/:id/status                        → approbation
GET    /hr/expense-reports   POST /hr/expense-reports
PATCH  /hr/expense-reports/:id/status                       → approbation

Comptabilité
GET    /reports/aging   /reports/overdue   /reports/vat   /reports/fec
POST   /reports/overdue/:id/reminder

Pièces jointes
GET    /attachments          POST /attachments        GET  /attachments/:id/download

Administration
GET    /partners  /products                              (CRUD complet)
GET    /users  /roles  /roles/permissions  /companies/mine  /companies/current
```

---

## Modèle de données

34 modèles Prisma (`backend/prisma/schema.prisma`), tous rattachés à une société.
Les principaux :

| Domaine | Modèles |
|---|---|
| Cœur & accès | `Company`, `User`, `UserCompany`, `Role`, `Permission`, `RolePermission`, `RefreshToken` |
| CRM | `Partner`, `Contact`, `Lead`, `Opportunity`, `Activity` |
| Ventes | `Quote`, `QuoteLine`, `Order`, `OrderLine`, `Invoice`, `InvoiceLine`, `Payment`, `DocumentCounter` |
| Achats & stock | `PurchaseOrder`, `PurchaseOrderLine`, `Product`, `Warehouse`, `Stock`, `StockMovement` |
| Projets | `Project`, `Task`, `TimeEntry` |
| RH | `Employee`, `LeaveRequest`, `ExpenseReport`, `ExpenseLine` |
| Transverse | `Attachment` |

Les cycles de vie sont des énumérations Prisma (`InvoiceStatus`, `OrderStatus`,
`LeaveStatus`, `ProjectStatus`…), déclarées une seule fois et partagées par le
back et le front.

---

## Organisation du code

Les documents commerciaux partagent leurs briques plutôt que de les dupliquer :

| Brique | Rôle |
|---|---|
| `common/documents/totals.ts` | seul endroit où se calculent HT, TVA et TTC |
| `common/documents/lines.service.ts` | complète les lignes depuis le catalogue et fige libellé, prix et TVA |
| `common/documents/numbering.service.ts` | compteur par société / type / année, incrémenté dans la transaction de création |
| `common/documents/workflow.ts` | transitions de statut autorisées et verrouillage des documents figés |
| `modules/*/[…]-status.ts` | le cycle de vie de chaque document, déclaré une fois |
| `modules/hr/expense-totals.ts` · `leave-days.ts` | totaux de frais et décompte des jours ouvrés (jours fériés français) |

Côté interface, `components/documents/` reprend la même logique : `LineEditor`,
`DocumentTotals`, `StatusBadge`, `StatusActions` et `DocumentFormModal` servent
les quatre écrans de document. Les cycles de vie côté client vivent dans
`lib/documents.ts` — ils ne servent qu'à n'afficher que les boutons utiles,
l'API restant seule juge de ce qui est autorisé.

---

## Développement & tests

```bash
npm run typecheck                 # types des deux projets
npm --prefix backend test         # 128 tests unitaires (Jest)
npm run build                     # compile l'API et le front
```

Les tests couvrent la logique métier isolée et pure : calcul des totaux et de la
TVA, verrou optimiste, transitions de statut, conversion partielle, avoirs,
échéances de paiement, multi-devises, décompte des jours ouvrés, totaux de notes
de frais, balance âgée, stockage des pièces jointes, pagination.

Le **seed** (`backend/prisma/seed.ts`) est idempotent : il crée permissions,
rôles et comptes s'ils manquent, et ne réécrit les données de démonstration que
sur `--fresh`. Il réutilise les mêmes helpers de calcul que l'application, si
bien que les montants seedés sont exactement ceux que produirait l'API.

---

## Le dossier `frontend/` (Flutter)

C'est le template commercial d'origine : environ 200 écrans de démonstration
(chat, kanban, e-mail, cartes…) dont deux seulement étaient reliés à l'API, avec
deux couches d'authentification concurrentes. Il est laissé en place pour
référence mais **n'est plus la cible** : l'interface maintenue est `web/`.
Il n'a pas été mis à jour pour la nouvelle API (le `companyId` n'est plus un
paramètre de requête), donc ses écrans produits ne fonctionneraient plus tels quels.
