# Up Network — ERP / CRM

API **NestJS + Prisma + PostgreSQL** et interface web **React + Vite + TypeScript**.

| Dossier | Contenu |
|---|---|
| `backend/` | API REST NestJS, schéma Prisma, migrations, seed |
| `web/` | Interface web React (celle qui est utilisée) |
| `frontend/` | Ancien client Flutter (template « henox »), **conservé mais plus maintenu** — voir la note en bas |

---

## Démarrage

Prérequis : Node 20+, Docker (ou un PostgreSQL déjà installé).

```bash
# 1. Installe les dépendances, lance PostgreSQL, applique les migrations et le seed
npm run setup

# 2. Dans deux terminaux
npm run dev:api    # http://localhost:3000
npm run dev:web    # http://localhost:5173
```

> `npm install` peut bloquer les scripts d'installation selon la version de npm.
> Si Prisma ou bcrypt échouent :
> `npm --prefix backend exec -- npm install-scripts approve @prisma/client @prisma/engines prisma bcrypt`

### Comptes de démonstration

| Compte | Mot de passe | Rôle | Accès |
|---|---|---|---|
| `admin@demo.com` | `admin123` | Admin | tout |
| `commercial@demo.com` | `demo1234` | Commercial | CRM + ventes, pas d'administration |
| `lecteur@demo.com` | `demo1234` | Lecteur | consultation seule |

### Variables d'environnement

`backend/.env` (modèle dans `backend/.env.example`) :

```ini
DATABASE_URL="postgresql://upnet:upnet@localhost:5433/up_network?schema=public"
JWT_SECRET="…"                                   # obligatoire, l'API refuse de démarrer sans
JWT_EXPIRES_IN="7d"
PORT=3000
FRONTEND_URL="http://localhost:5173"             # plusieurs origines séparées par des virgules
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

---

## Modèle de sécurité

Trois règles structurent l'API :

1. **La société active vient du jeton, jamais du client.** Le JWT porte `companyId` ;
   les contrôleurs le lisent via le décorateur `@CompanyId()`. Aucune route
   n'accepte plus de `?companyId=` — un utilisateur ne peut donc pas lire les
   données d'une autre société en changeant un paramètre d'URL.
2. **Chaque route porte sa permission.** `@RequirePermission(module, ressource, action)`
   est vérifié par `PermissionsGuard`, qui résout le rôle **dans la société active**.
   Le catalogue fait foi : `backend/src/common/constants/permissions.ts`.
3. **Le front reflète les permissions, il ne les applique pas.** `/auth/me` renvoie
   la liste des permissions ; menus et boutons s'adaptent, mais l'autorisation
   reste décidée côté serveur.

À l'inscription, `POST /auth/register` crée la société, un rôle **Admin** doté de
toutes les permissions, et rattache le compte. Avec un `companyCode`, le compte
rejoint une société existante **sans rôle** — un admin doit lui en attribuer un.

---

## Modules

**Cœur** — sociétés, utilisateurs, rôles, permissions, multi-société avec bascule.

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
| Commande fournisseur | `CF2026-0001` | brouillon → commandée → réceptionnée |

- **TVA** : chaque ligne porte quantité, prix unitaire HT, remise et taux de TVA ;
  les totaux HT / TVA / TTC sont calculés côté serveur, avec un détail par taux.
- **Documents figés** : chaque document a ses **propres** lignes. Une conversion
  recopie les lignes, elle ne les partage pas — modifier une commande ne change
  jamais une facture déjà émise.
- **Règlements** : partiels ou totaux, plusieurs moyens de paiement ; le statut et
  le reste à payer se déduisent des encaissements, ils ne se saisissent pas.
- **PDF** : facture complète avec en-tête société, coordonnées client, détail des
  lignes, ventilation de TVA et reste à payer.

**Achats & stock** :
- **Entrepôts** multiples, avec un entrepôt par défaut.
- **Niveaux de stock** par produit et par entrepôt, valorisation au prix d'achat,
  seuils d'alerte de réapprovisionnement.
- **Mouvements** : chaque variation est journalisée avec sa quantité signée, le
  stock résultant et son document d'origine. Expédier une commande sort le stock,
  réceptionner une commande fournisseur l'entre — automatiquement et dans la même
  transaction que le changement de statut.
- **Ajustements et transferts** manuels avec motif.

**Pilotage** — chiffre d'affaires facturé, encours client et retards de paiement,
devis en cours, pipeline, meilleurs clients, alertes de stock, activité récente.

---

## Points d'entrée de l'API

```
POST   /auth/register           POST /auth/login       GET  /auth/me
POST   /auth/switch-company

GET    /dashboard/overview | /revenue | /top-partners | /recent

CRM
GET    /crm/leads            POST /crm/leads          GET  /crm/leads/stats
POST   /crm/leads/:id/convert
GET    /crm/opportunities    GET  /crm/opportunities/pipeline
PATCH  /crm/opportunities/:id/stage
GET    /crm/activities       PATCH /crm/activities/:id/toggle
GET    /partners/:id/contacts   POST /partners/:id/contacts

Cycle de vente
GET    /quotes               POST /quotes
PATCH  /quotes/:id/status    POST /quotes/:id/convert       → commande
GET    /orders               POST /orders
PATCH  /orders/:id/status    POST /orders/:id/ship          → sortie de stock
                             POST /orders/:id/invoice       → facture
GET    /invoices             POST /invoices
PATCH  /invoices/:id/status  GET  /invoices/:id/pdf
GET    /invoices/:id/payments   POST /invoices/:id/payments

Achats & stock
GET    /purchases            POST /purchases
PATCH  /purchases/:id/status POST /purchases/:id/receive    → entrée de stock
GET    /stock/levels         GET  /stock/movements
POST   /stock/adjust         POST /stock/transfer
GET    /stock/warehouses     POST /stock/warehouses

Administration
GET    /partners  /products                              (CRUD complet)
GET    /users  /roles  /roles/permissions  /companies/mine  /companies/current
```

---

## Organisation du code

Les quatre documents commerciaux partagent leurs briques plutôt que de les
dupliquer :

| Brique | Rôle |
|---|---|
| `common/documents/totals.ts` | seul endroit où se calculent HT, TVA et TTC |
| `common/documents/lines.service.ts` | complète les lignes depuis le catalogue et fige libellé, prix et TVA |
| `common/documents/numbering.service.ts` | compteur par société / type / année, incrémenté dans la transaction de création |
| `common/documents/workflow.ts` | transitions de statut autorisées et verrouillage des documents figés |
| `modules/*/[…]-status.ts` | le cycle de vie de chaque document, déclaré une fois |

Côté interface, `components/documents/` reprend la même logique : `LineEditor`,
`DocumentTotals`, `StatusBadge`, `StatusActions` et `DocumentFormModal` servent
les quatre écrans de document. Les cycles de vie côté client vivent dans
`lib/documents.ts` — ils ne servent qu'à n'afficher que les boutons utiles,
l'API restant seule juge de ce qui est autorisé.

---

## Le dossier `frontend/` (Flutter)

C'est le template commercial d'origine : environ 200 écrans de démonstration
(chat, kanban, e-mail, cartes…) dont deux seulement étaient reliés à l'API, avec
deux couches d'authentification concurrentes. Il est laissé en place pour
référence mais **n'est plus la cible** : l'interface maintenue est `web/`.
Il n'a pas été mis à jour pour la nouvelle API (le `companyId` n'est plus un
paramètre de requête), donc ses écrans produits ne fonctionneraient plus tels quels.
