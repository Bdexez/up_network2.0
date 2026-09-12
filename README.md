# Up Network — ERP / CRM

Management suite for SMEs: **CRM**, **sales cycle** (quote → order → invoice →
payment), **purchasing & stock**, **projects**, **human resources** and
**accounting reports** — all multi-company, with fine-grained access control.

**NestJS + Prisma + PostgreSQL** API, **React + Vite + TypeScript** web interface.

<p>
  <img alt="NestJS" src="https://img.shields.io/badge/API-NestJS%2011-E0234E">
  <img alt="React" src="https://img.shields.io/badge/Web-React%2019%20%2B%20Vite-61DAFB">
  <img alt="Prisma" src="https://img.shields.io/badge/ORM-Prisma%206-2D3748">
  <img alt="PostgreSQL" src="https://img.shields.io/badge/DB-PostgreSQL%2016-4169E1">
  <img alt="Tests" src="https://img.shields.io/badge/tests-128%20passing-3FB950">
</p>

| Figure | |
|---|---|
| **10** functional modules | CRM, sales, purchasing, stock, projects, HR, accounting, core |
| **84** permissions | single catalogue, enforced server-side |
| **34** Prisma models · **21** migrations | versioned schema |
| **128** unit tests | business logic (totals, VAT, workflow, leave…) |
| **26** web screens · **1** OpenAPI doc | `web/` interface + Swagger on `/docs` |

---

## Contents

- [Getting started](#getting-started)
- [Demo accounts](#demo-accounts)
- [Architecture](#architecture)
- [Security model](#security-model)
- [Modules](#modules)
- [API entry points](#api-entry-points)
- [Data model](#data-model)
- [Code organisation](#code-organisation)
- [Development & tests](#development--tests)
- [The `frontend/` directory (Flutter)](#the-frontend-directory-flutter)

---

## Getting started

Requirements: **Node 20+**, **Docker** (or an existing PostgreSQL install).

```bash
# 1. Install dependencies, start PostgreSQL, apply migrations and seed
npm run setup

# 2. Prepare the API environment
cp backend/.env.example backend/.env   # values aligned with docker-compose

# 3. In two terminals
npm run dev:api    # http://localhost:3000  (API + OpenAPI docs on /docs)
npm run dev:web    # http://localhost:5173  (web interface)
```

> `npm install` may block install scripts depending on your npm version.
> If Prisma or bcrypt fail:
> `npm --prefix backend exec -- npm install-scripts approve @prisma/client @prisma/engines prisma bcrypt`

Once the API is running: the service health probe is on
[`/health`](http://localhost:3000/health) and the interactive route
documentation on [`/docs`](http://localhost:3000/docs).

### Demo accounts

| Account | Password | Role | Access |
|---|---|---|---|
| `admin@demo.com` | `admin123` | Admin | everything |
| `commercial@demo.com` | `demo1234` | Sales | CRM + sales, no administration |
| `lecteur@demo.com` | `demo1234` | Reader | read-only |

The seed fills **every** module with a coherent dataset: partners, catalogue and
stock, quotes / orders / invoices / payments, CRM pipeline, **employees, leave
requests and expense reports**, **projects with tasks and logged time**. Enough
to see every screen alive from the first login.

### Environment variables

`backend/.env` (template in `backend/.env.example`):

```ini
DATABASE_URL="postgresql://upnet:upnet@localhost:5433/up_network?schema=public"
JWT_SECRET="…"                                   # required, the API refuses to start without it
JWT_EXPIRES_IN="7d"
PORT=3000
FRONTEND_URL="http://localhost:5173"             # several origins, comma-separated
# SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD  # optional: without SMTP_HOST, e-mails are logged
SMTP_FROM="facturation@democorp.fr"
```

`web/.env`: `VITE_API_URL=http://localhost:3000`

### Useful scripts

| Command | Effect |
|---|---|
| `npm run db:up` / `db:down` | start / stop PostgreSQL (Docker, port **5433**) |
| `npm run db:migrate` | apply migrations |
| `npm run db:seed` | insert permissions, roles and accounts (demo data if the database is empty) |
| `npm run db:seed:fresh` | replace the demo data with a fresh set (accounts and roles kept) |
| `npm run db:studio` | open Prisma Studio |
| `npm run build` | build the API and the front end |
| `npm run typecheck` | type-check both projects |
| `npm --prefix backend test` | run the API unit tests |

---

## Architecture

```mermaid
flowchart LR
  subgraph Client
    W["web/ — React + Vite<br/>(maintained interface)"]
  end
  subgraph API["backend/ — NestJS"]
    G["JwtAuthGuard<br/>+ PermissionsGuard"]
    M["Business modules<br/>CRM · Sales · Purchasing · Stock<br/>Projects · HR · Accounting"]
    D["common/documents<br/>totals · numbering · workflow"]
  end
  DB[("PostgreSQL<br/>Prisma")]
  SMTP["SMTP<br/>(reminders, document sending)"]

  W -- "JWT Bearer" --> G --> M
  M --> D
  M --> DB
  M -. "e-mails" .-> SMTP
```

Every request passes through `JwtAuthGuard` (identity + active company) and then
`PermissionsGuard` (specific right). The four commercial documents reuse the same
`common/documents` building blocks rather than duplicating VAT computation,
numbering or status transitions.

---

## Security model

Three rules structure the API:

1. **The active company comes from the token, never from the client.** The JWT
   carries `companyId`; controllers read it through the `@CompanyId()` decorator.
   No route accepts a `?companyId=` — so a user cannot read another company's
   data by changing a URL parameter.
2. **Every route carries its permission.** `@RequirePermission(module, resource, action)`
   is checked by `PermissionsGuard`, which resolves the role **within the active
   company**. The catalogue is authoritative:
   `backend/src/common/constants/permissions.ts` (84 permissions).
3. **The front end reflects permissions, it does not enforce them.** `/auth/me`
   returns the permission list; menus and buttons adapt, but authorisation stays
   a server-side decision.

On sign-up, `POST /auth/register` creates the company, an **Admin** role holding
every permission, and attaches the account. With a `companyCode`, the account
joins an existing company **with no role** — an admin has to assign one.

**Sessions.** Login returns a short-lived access token and a persistent **refresh
token** (`POST /auth/refresh` renews it, `POST /auth/logout` revokes it), which
makes it possible to expire access without abruptly logging the user out.

---

## Modules

**Core** — companies, users, roles, permissions, multi-company with switching
(`/auth/switch-company`).

**CRM**:
- **Leads**: statuses (new → contacted → qualified / unqualified), source,
  estimated potential, owner.
- **Conversion**: a lead becomes a partner, and optionally an opportunity; the
  operation is transactional and carries existing activities over.
- **Pipeline**: opportunities by stage (qualification, proposal, negotiation,
  won, lost), amount weighted by probability, drag and drop between columns.
- **Activities**: calls, meetings, e-mails, tasks, notes — attached to a lead, an
  opportunity or a partner, with a due date and overdue tracking.
- **Partners & contacts**: customers, suppliers or both, with contact people,
  full address and VAT number.

**Sales cycle** — quote → order → invoice → payments:

| Document | Reference | Lifecycle |
|---|---|---|
| Quote | `DE2026-0001` | draft → validated → signed / rejected → converted |
| Order | `CO2026-0001` | draft → validated → shipped → invoiced |
| Invoice | `FA2026-0001` | draft → unpaid → partial → paid |
| Credit note | `AV2026-0001` | issued from an invoice, negative amounts |
| Purchase order | `CF2026-0001` | draft → ordered → received |

- **VAT**: each line carries quantity, unit price excl. tax, discount and VAT
  rate; net / VAT / gross totals are computed server-side, with a breakdown per
  rate.
- **Frozen documents**: each document has its **own** lines. A conversion copies
  the lines, it does not share them — editing an order never changes an invoice
  already issued. An optimistic lock prevents two concurrent edits from
  overwriting each other.
- **Multi-currency**: a document can be denominated in another currency; the rate
  and the amounts converted into the company currency are frozen, so that the
  aged balance and the accounting reports stay consistent.
- **Credit notes**: an invoice can generate a credit note, which reduces the
  outstanding amount.
- **Payments**: partial or full, several payment methods; the status and the
  remaining balance are derived from the receipts, they are not entered by hand.
- **PDF & sending**: invoice, quote, order and purchase order are exportable to
  PDF; an invoice can be e-mailed to the customer (`/invoices/:id/send`).
- **Attachments**: any document can carry files (`/attachments`), stored and
  downloadable again.

**Purchasing & stock**:
- Multiple **warehouses**, with a default one.
- **Stock levels** per product and per warehouse, valuation at purchase price,
  reorder alert thresholds.
- **Movements**: every variation is logged with its signed quantity, the
  resulting stock and its source document. Shipping an order takes stock out,
  receiving a purchase order brings it in — automatically and in the same
  transaction as the status change.
- Manual **adjustments and transfers** with a reason.

**Projects**:
- **Projects** attached to a customer, with an owner, a budget in hours and an
  hourly rate; statuses draft → active → paused → closed.
- Ordered **tasks**, with assignee, estimate and due date.
- **Time tracking**: hourly entries per task, distinguishing **billable** time
  from internal time — the basis for future time-and-materials invoicing.

**Human resources**:
- **Employees**: one record per company, linkable to an application account,
  paid-leave balance.
- **Leave**: typed requests (paid leave, RTT, sick leave, unpaid…), counting of
  **working days** excluding French public holidays, approval flow that
  decrements the balance.
- **Expense reports**: categorised lines with VAT, totals computed server-side,
  submission → approval → reimbursement flow.

**Accounting & reporting**:
- **Aged balance** (`/reports/aging`): customer outstandings split by age.
- **Overdue & reminders** (`/reports/overdue`, `+ /:id/reminder`): late invoices
  and reminder sending.
- **VAT** (`/reports/vat`): output and input VAT by rate over a period.
- **FEC export** (`/reports/fec`): accounting entries file in the French
  regulatory format.
- **Dashboard**: invoiced revenue, outstandings and payment delays, open quotes,
  pipeline, top customers, stock alerts, recent activity.

---

## API entry points

Full interactive documentation (schemas derived from the DTOs) on **`/docs`**.

```
GET    /health                         # availability probe (public)

Auth & session
POST   /auth/register    POST /auth/login    POST /auth/refresh    POST /auth/logout
GET    /auth/me          POST /auth/switch-company

Reporting
GET    /dashboard/overview | /revenue | /top-partners | /recent

CRM
GET    /crm/leads            POST /crm/leads          GET  /crm/leads/stats
POST   /crm/leads/:id/convert
GET    /crm/opportunities    GET  /crm/opportunities/pipeline
PATCH  /crm/opportunities/:id/stage
GET    /crm/activities       PATCH /crm/activities/:id/toggle
GET    /partners/:id/contacts   POST /partners/:id/contacts

Sales cycle
GET    /quotes               POST /quotes             GET  /quotes/:id/pdf
PATCH  /quotes/:id/status    POST /quotes/:id/convert       → order
GET    /orders               POST /orders             GET  /orders/:id/pdf
PATCH  /orders/:id/status    POST /orders/:id/ship          → stock out
                             POST /orders/:id/invoice       → invoice
GET    /invoices             POST /invoices           GET  /invoices/:id/pdf
PATCH  /invoices/:id/status  POST /invoices/:id/credit-note → credit note
POST   /invoices/:id/send                                   → e-mail to the customer
GET    /invoices/:id/payments   POST /invoices/:id/payments

Purchasing & stock
GET    /purchases            POST /purchases          GET  /purchases/:id/pdf
PATCH  /purchases/:id/status POST /purchases/:id/receive    → stock in
GET    /stock/levels         GET  /stock/movements
POST   /stock/adjust         POST /stock/transfer
GET    /stock/warehouses     POST /stock/warehouses

Projects
GET    /projects             POST /projects           PATCH /projects/:id/status
POST   /projects/:id/tasks   PATCH /projects/:id/tasks/:taskId
POST   /projects/:id/time    DELETE /projects/:id/time/:entryId

Human resources
GET    /hr/employees         POST /hr/employees       GET  /hr/employees/me
GET    /hr/leave-requests    POST /hr/leave-requests  GET  /hr/leave-requests/summary
PATCH  /hr/leave-requests/:id/status                        → approval
GET    /hr/expense-reports   POST /hr/expense-reports
PATCH  /hr/expense-reports/:id/status                       → approval

Accounting
GET    /reports/aging   /reports/overdue   /reports/vat   /reports/fec
POST   /reports/overdue/:id/reminder

Attachments
GET    /attachments          POST /attachments        GET  /attachments/:id/download

Administration
GET    /partners  /products                              (full CRUD)
GET    /users  /roles  /roles/permissions  /companies/mine  /companies/current
```

---

## Data model

34 Prisma models (`backend/prisma/schema.prisma`), all attached to a company.
The main ones:

| Domain | Models |
|---|---|
| Core & access | `Company`, `User`, `UserCompany`, `Role`, `Permission`, `RolePermission`, `RefreshToken` |
| CRM | `Partner`, `Contact`, `Lead`, `Opportunity`, `Activity` |
| Sales | `Quote`, `QuoteLine`, `Order`, `OrderLine`, `Invoice`, `InvoiceLine`, `Payment`, `DocumentCounter` |
| Purchasing & stock | `PurchaseOrder`, `PurchaseOrderLine`, `Product`, `Warehouse`, `Stock`, `StockMovement` |
| Projects | `Project`, `Task`, `TimeEntry` |
| HR | `Employee`, `LeaveRequest`, `ExpenseReport`, `ExpenseLine` |
| Cross-cutting | `Attachment` |

Lifecycles are Prisma enums (`InvoiceStatus`, `OrderStatus`, `LeaveStatus`,
`ProjectStatus`…), declared once and shared by the back end and the front end.

---

## Code organisation

Commercial documents share their building blocks rather than duplicating them:

| Block | Role |
|---|---|
| `common/documents/totals.ts` | the only place where net, VAT and gross are computed |
| `common/documents/lines.service.ts` | completes lines from the catalogue and freezes label, price and VAT |
| `common/documents/numbering.service.ts` | counter per company / type / year, incremented inside the creation transaction |
| `common/documents/workflow.ts` | allowed status transitions and locking of frozen documents |
| `modules/*/[…]-status.ts` | each document's lifecycle, declared once |
| `modules/hr/expense-totals.ts` · `leave-days.ts` | expense totals and working-day counting (French public holidays) |

On the interface side, `components/documents/` follows the same logic:
`LineEditor`, `DocumentTotals`, `StatusBadge`, `StatusActions` and
`DocumentFormModal` serve all four document screens. Client-side lifecycles live
in `lib/documents.ts` — they only exist to display the useful buttons, the API
remaining the sole judge of what is allowed.

---

## Development & tests

```bash
npm run typecheck                 # types of both projects
npm --prefix backend test         # 128 unit tests (Jest)
npm run build                     # build the API and the front end
```

The tests cover isolated, pure business logic: totals and VAT computation,
optimistic lock, status transitions, partial conversion, credit notes, payment
due dates, multi-currency, working-day counting, expense report totals, aged
balance, attachment storage, pagination.

The **seed** (`backend/prisma/seed.ts`) is idempotent: it creates permissions,
roles and accounts if they are missing, and only rewrites the demo data on
`--fresh`. It reuses the same computation helpers as the application, so the
seeded amounts are exactly the ones the API would produce.

---

## The `frontend/` directory (Flutter)

This is the original commercial template: roughly 200 demo screens (chat, kanban,
e-mail, maps…) of which only two were wired to the API, with two competing
authentication layers. It is kept for reference but is **no longer the target**:
the maintained interface is `web/`.
It has not been updated for the new API (`companyId` is no longer a query
parameter), so its product screens would no longer work as they are.
