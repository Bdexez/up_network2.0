export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'UNQUALIFIED'
  | 'CONVERTED';

export type OpportunityStage =
  | 'QUALIFICATION'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST';

export type ActivityType = 'CALL' | 'MEETING' | 'EMAIL' | 'TASK' | 'NOTE';
export type ActivityStatus = 'PLANNED' | 'DONE' | 'CANCELLED';
export type PartnerType = 'CUSTOMER' | 'SUPPLIER' | 'BOTH';
export type ProductType = 'PRODUCT' | 'SERVICE';

export type QuoteStatus = 'DRAFT' | 'VALIDATED' | 'SIGNED' | 'REFUSED' | 'BILLED';
export type OrderStatus = 'DRAFT' | 'VALIDATED' | 'SHIPPED' | 'BILLED' | 'CANCELLED';
export type InvoiceStatus =
  | 'DRAFT'
  | 'UNPAID'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'CANCELLED';
export type PurchaseOrderStatus = 'DRAFT' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';
export type InvoiceType = 'INVOICE' | 'CREDIT_NOTE';
export type PaymentMethod =
  | 'TRANSFER'
  | 'CARD'
  | 'CHECK'
  | 'CASH'
  | 'DIRECT_DEBIT'
  | 'OTHER';
export type StockMovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER';

/** Ligne telle que renvoyée par l'API, quel que soit le document. */
export interface DocumentLine {
  id: number;
  position: number;
  productId: number | null;
  label: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  vatRate: number;
  totalHT: number;
  totalVat: number;
  totalTTC: number;
}

/** Ligne saisie dans un formulaire, avant envoi. */
export interface DocumentLineInput {
  productId?: number;
  label?: string;
  quantity: number;
  unitPrice?: number;
  discountPercent?: number;
  vatRate?: number;
}

/** Enveloppe renvoyée par toutes les listes paginées de l'API. */
export interface Paginated<T> {
  items: T[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

/** Formes allégées servies par les endpoints `/…/options`, sans pagination. */
export interface PartnerOption {
  id: number;
  name: string;
  type: PartnerType;
}

export interface ProductOption {
  id: number;
  name: string;
  sku: string;
  price: number;
  costPrice: number;
  vatRate: number;
  type: ProductType;
  manageStock: boolean;
}

export interface VatBreakdownEntry {
  rate: number;
  base: number;
  amount: number;
}

/** Champs communs à tous les documents commerciaux. */
export interface DocumentTotals {
  totalHT: number;
  totalVat: number;
  totalTTC: number;
  /** Devise du document ; les totaux ci-dessus y sont exprimés. */
  currency: string;
  /** Taux vers la devise société, figé à l'émission. */
  exchangeRate: number;
  baseTotalHT: number;
  baseTotalTTC: number;
}

/** Devises proposées, alignées sur backend/src/common/documents/currency.ts. */
export const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'CAD', 'MAD', 'XOF'] as const;

export interface Company {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
  paymentTermsDays?: number;
  allowNegativeStock?: boolean;
  /** Devise de tenue de comptes. */
  currency?: string;
  address?: string | null;
  zipCode?: string | null;
  city?: string | null;
  country?: string | null;
  email?: string | null;
  phone?: string | null;
  vatNumber?: string | null;
  defaultVatRate?: number;
}

export interface CompanyDetail extends Company {
  _count: {
    users: number;
    roles: number;
    partners: number;
    products: number;
    orders: number;
    leads: number;
    opportunities: number;
  };
}

export interface Profile {
  id: number;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  userType: string;
  isActive: boolean;
  company: Company | null;
  role: { id: number; name: string } | null;
  permissions: string[];
  companies: {
    id: number;
    name: string;
    code: string;
    isActive: boolean;
    role: string | null;
  }[];
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  user: Profile;
}

export type AttachmentEntity =
  | 'PARTNER'
  | 'QUOTE'
  | 'ORDER'
  | 'INVOICE'
  | 'PURCHASE_ORDER'
  | 'PRODUCT'
  | 'PROJECT';

export interface Attachment {
  id: number;
  entity: AttachmentEntity;
  entityId: number;
  fileName: string;
  mimeType: string;
  size: number;
  description: string | null;
  createdAt: string;
  uploadedBy: { id: number; username: string };
}

/** Réponse de `POST /invoices/:id/send`. */
export interface MailResult {
  delivered: boolean;
  /** `log` quand aucun serveur SMTP n'est configuré. */
  transport: 'smtp' | 'log';
  to: string;
  subject: string;
}

export interface Contact {
  id: number;
  firstName: string | null;
  lastName: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  isPrimary: boolean;
}

export interface Partner {
  id: number;
  name: string;
  type: PartnerType;
  email: string | null;
  phone: string | null;
  address: string | null;
  zipCode: string | null;
  city: string | null;
  country: string | null;
  website: string | null;
  vatNumber: string | null;
  /** Délai de règlement négocié ; null = celui de la société. */
  paymentTermsDays: number | null;
  isActive: boolean;
  createdAt: string;
  contacts?: Contact[];
  _count?: {
    orders: number;
    quotes: number;
    invoices: number;
    opportunities: number;
  };
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string | null;
  type: ProductType;
  price: number;
  costPrice: number;
  vatRate: number;
  manageStock: boolean;
  stockAlert: number;
  createdAt: string;
  stocks?: { quantity: number }[];
}

/** Fiche complète d'un tiers : `GET /partners/:id`. */
export interface PartnerDetail extends Partner {
  contacts: Contact[];
  quotes: Pick<Quote, 'id' | 'ref' | 'status' | 'date' | 'totalTTC'>[];
  orders: Pick<Order, 'id' | 'ref' | 'status' | 'date' | 'totalTTC'>[];
  invoices: Pick<
    Invoice,
    'id' | 'ref' | 'status' | 'date' | 'totalTTC' | 'paidAmount'
  >[];
  opportunities: Pick<Opportunity, 'id' | 'name' | 'stage' | 'amount'>[];
  activities: Pick<Activity, 'id' | 'subject' | 'type' | 'status' | 'dueDate'>[];
}

export interface Quote extends DocumentTotals {
  id: number;
  ref: string;
  status: QuoteStatus;
  date: string;
  validUntil: string | null;
  notes: string | null;
  partnerId: number;
  partner: { id: number; name: string; email: string | null; city: string | null };
  createdBy: { id: number; username: string };
  lines: DocumentLine[];
  orders: { id: number; ref: string; status: OrderStatus }[];
  version: number;
  vatBreakdown?: VatBreakdownEntry[];
  createdAt: string;
}

/** Ligne de commande, enrichie de son avancement. */
export interface OrderLine extends DocumentLine {
  shippedQuantity: number;
  invoicedQuantity: number;
  /** Reliquats calculés par l'API sur la fiche détaillée. */
  remainingToShip?: number;
  remainingToInvoice?: number;
}

export interface Order extends DocumentTotals {
  id: number;
  ref: string;
  status: OrderStatus;
  date: string;
  deliveryDate: string | null;
  shippedAt: string | null;
  notes: string | null;
  partnerId: number;
  partner: { id: number; name: string; email: string | null; city: string | null };
  createdBy: { id: number; username: string };
  lines: OrderLine[];
  quote: { id: number; ref: string } | null;
  invoices: { id: number; ref: string; status: InvoiceStatus; totalTTC: number }[];
  version: number;
  vatBreakdown?: VatBreakdownEntry[];
  createdAt: string;
}

export interface Payment {
  id: number;
  amount: number;
  method: PaymentMethod;
  date: string;
  reference: string | null;
  notes: string | null;
  createdBy: { id: number; username: string };
}

export interface Invoice extends DocumentTotals {
  id: number;
  ref: string;
  type: InvoiceType;
  status: InvoiceStatus;
  date: string;
  dueDate: string | null;
  notes: string | null;
  paidAmount: number;
  /** Présent sur la fiche détaillée uniquement. */
  remainingAmount?: number;
  pdfUrl: string | null;
  partnerId: number;
  partner: Partner | { id: number; name: string };
  createdBy?: { id: number; username: string };
  lines?: DocumentLine[];
  payments?: Payment[];
  order: { id: number; ref: string } | null;
  /** Avoirs corrigeant cette facture. */
  creditNotes?: { id: number; ref: string; status: InvoiceStatus; totalTTC: number }[];
  /** Pour un avoir : la facture corrigée. */
  creditedInvoice?: { id: number; ref: string } | null;
  vatBreakdown?: VatBreakdownEntry[];
  version: number;
  _count?: { payments: number };
  createdAt: string;
}

export interface PurchaseOrder extends DocumentTotals {
  id: number;
  ref: string;
  status: PurchaseOrderStatus;
  date: string;
  expectedDate: string | null;
  receivedAt: string | null;
  notes: string | null;
  supplierId: number;
  supplier: { id: number; name: string; email: string | null; city: string | null };
  warehouseId: number | null;
  warehouse: { id: number; name: string } | null;
  createdBy: { id: number; username: string };
  lines: DocumentLine[];
  vatBreakdown?: VatBreakdownEntry[];
  version: number;
  createdAt: string;
}

export interface Warehouse {
  id: number;
  name: string;
  code: string;
  address: string | null;
  city: string | null;
  description: string | null;
  isDefault: boolean;
  isActive: boolean;
  references?: number;
  totalQuantity?: number;
}

export interface StockLevel {
  productId: number;
  name: string;
  sku: string;
  stockAlert: number;
  costPrice: number;
  quantity: number;
  value: number;
  belowAlert: boolean;
  byWarehouse: { warehouseId: number; warehouse: string; quantity: number }[];
}

export interface StockMovement {
  id: number;
  type: StockMovementType;
  quantity: number;
  resultingQuantity: number;
  reason: string | null;
  documentRef: string | null;
  createdAt: string;
  product: { id: number; name: string; sku: string };
  warehouse: { id: number; name: string };
  createdBy: { id: number; username: string };
}

export interface Owner {
  id: number;
  username: string;
  email?: string;
}

export interface Lead {
  id: number;
  name: string;
  companyName: string | null;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  source: string | null;
  status: LeadStatus;
  estimatedValue: number;
  description: string | null;
  ownerId: number | null;
  owner: Owner | null;
  convertedPartnerId: number | null;
  convertedPartner: { id: number; name: string } | null;
  convertedAt: string | null;
  createdAt: string;
  _count?: { activities: number; opportunities: number };
  activities?: Activity[];
  opportunities?: Opportunity[];
}

export interface Opportunity {
  id: number;
  name: string;
  description: string | null;
  stage: OpportunityStage;
  amount: number;
  probability: number;
  expectedCloseDate: string | null;
  closedAt: string | null;
  lostReason: string | null;
  partnerId: number | null;
  partner: { id: number; name: string; email: string | null } | null;
  leadId: number | null;
  lead: { id: number; name: string } | null;
  ownerId: number | null;
  owner: Owner | null;
  createdAt: string;
  updatedAt: string;
  _count?: { activities: number };
  activities?: Activity[];
}

export interface PipelineColumn {
  stage: OpportunityStage;
  count: number;
  amount: number;
  weightedAmount: number;
  opportunities: Opportunity[];
}

export interface Activity {
  id: number;
  type: ActivityType;
  subject: string;
  description: string | null;
  status: ActivityStatus;
  dueDate: string | null;
  completedAt: string | null;
  ownerId: number | null;
  owner: Owner | null;
  leadId: number | null;
  lead: { id: number; name: string } | null;
  opportunityId: number | null;
  opportunity: { id: number; name: string } | null;
  partnerId: number | null;
  partner: { id: number; name: string } | null;
  createdAt: string;
}

export interface AppUser {
  id: number;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
  createdAt: string;
  role: { id: number; name: string } | null;
}

export interface Role {
  id: number;
  name: string;
  description: string | null;
  isSystemRole: boolean;
  userCount: number;
  permissionIds: number[];
  permissions: string[];
}

export interface PermissionGroup {
  moduleName: string;
  permissions: {
    id: number;
    resourceName: string;
    actionName: string;
    key: string;
    description: string | null;
  }[];
}

/** Balance âgée : `GET /reports/aging`. */
export interface AgingReport {
  rows: {
    partnerId: number;
    partnerName: string;
    total: number;
    buckets: Record<string, number>;
  }[];
  totals: Record<string, number>;
  total: number;
}

export interface OverdueInvoice {
  id: number;
  ref: string;
  partner: { id: number; name: string; email: string | null };
  dueDate: string | null;
  currency: string;
  totalTTC: number;
  remaining: number;
  reminderCount: number;
  lastReminderAt: string | null;
}

export interface VatSummary {
  period: { from: string; to: string };
  collected: { rate: number; base: number; vat: number }[];
  deductible: { rate: number; base: number; vat: number }[];
  totalCollected: number;
  totalDeductible: number;
  /** Positif : TVA à reverser. Négatif : crédit de TVA. */
  balance: number;
}

export type ProjectStatus = 'DRAFT' | 'ACTIVE' | 'ON_HOLD' | 'CLOSED';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';

export interface ProjectMetrics {
  totalHours: number;
  billableHours: number;
  invoicedHours: number;
  pendingHours: number;
  pendingAmount: number;
  budgetHours: number;
  /** Null quand aucun budget n'est fixé. */
  budgetUsedPercent: number | null;
  overBudget: boolean;
}

export interface Project {
  id: number;
  ref: string;
  name: string;
  status: ProjectStatus;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  budgetHours: number;
  hourlyRate: number;
  partnerId: number | null;
  partner: { id: number; name: string } | null;
  owner: { id: number; username: string } | null;
  _count?: { tasks: number; timeEntries: number };
  createdAt: string;
}

export interface Task {
  id: number;
  name: string;
  status: TaskStatus;
  description: string | null;
  dueDate: string | null;
  estimatedHours: number;
  assignee: { id: number; username: string } | null;
  _count?: { timeEntries: number };
}

export interface TimeEntry {
  id: number;
  date: string;
  hours: number;
  description: string | null;
  billable: boolean;
  invoicedHours: number;
  user: { id: number; username: string };
  task: { id: number; name: string } | null;
}

export interface ProjectDetail extends Project {
  tasks: Task[];
  timeEntries: TimeEntry[];
  metrics: ProjectMetrics;
}

export type LeaveType = 'PAID' | 'RTT' | 'SICK' | 'UNPAID' | 'OTHER';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type ExpenseStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REFUSED'
  | 'REIMBURSED';
export type ExpenseCategory =
  | 'TRAVEL'
  | 'MEAL'
  | 'ACCOMMODATION'
  | 'SUPPLIES'
  | 'MILEAGE'
  | 'OTHER';

export interface EmployeeOption {
  id: number;
  name: string;
}

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  department: string | null;
  hireDate: string | null;
  endDate: string | null;
  isActive: boolean;
  /** Solde de congés payés restant, en jours. */
  paidLeaveBalance: number;
  userId: number | null;
  user: { id: number; username: string; email: string } | null;
  _count?: { leaveRequests: number; expenseReports: number };
  createdAt: string;
}

export interface LeaveRequest {
  id: number;
  type: LeaveType;
  status: LeaveStatus;
  startDate: string;
  endDate: string;
  /** Jours ouvrés décomptés, calculés par l'API. */
  days: number;
  reason: string | null;
  employeeId: number;
  employee: {
    id: number;
    firstName: string;
    lastName: string;
    paidLeaveBalance: number;
  };
  decidedBy: { id: number; username: string } | null;
  decidedAt: string | null;
  decisionNote: string | null;
  createdAt: string;
}

export interface LeaveSummary {
  pending: number;
  upcoming: number;
  activeEmployees: number;
  totalPaidLeaveBalance: number;
}

export interface ExpenseLine {
  id: number;
  category: ExpenseCategory;
  date: string;
  description: string;
  amountHT: number;
  vatRate: number;
  amountVat: number;
  amountTTC: number;
}

/** Ligne saisie dans le formulaire, avant envoi. */
export interface ExpenseLineInput {
  category: ExpenseCategory;
  date: string;
  description: string;
  amountHT: number;
  vatRate: number;
}

export interface ExpenseReport {
  id: number;
  ref: string;
  status: ExpenseStatus;
  /** Premier jour du mois concerné. */
  period: string;
  notes: string | null;
  totalHT: number;
  totalVat: number;
  totalTTC: number;
  employeeId: number;
  employee: { id: number; firstName: string; lastName: string };
  decidedBy: { id: number; username: string } | null;
  decidedAt: string | null;
  lines: ExpenseLine[];
  createdAt: string;
}

export interface DashboardOverview {
  partners: number;
  products: number;
  orders: number;
  invoices: number;
  revenue: number;
  monthRevenue: number;
  outstandingAmount: number;
  overdueInvoices: number;
  openQuotes: number;
  openQuotesAmount: number;
  openLeads: number;
  openOpportunities: number;
  openPipelineAmount: number;
  wonOpportunities: number;
  wonAmount: number;
  overdueActivities: number;
  lowStock: number;
}

export interface RevenuePoint {
  month: string;
  total: number;
}

export interface TopPartner {
  partnerId: number;
  name: string;
  invoices: number;
  total: number;
}

export interface RecentEvent {
  type: 'quote' | 'order' | 'invoice' | 'lead' | 'opportunity';
  id: number;
  /** Référence du document (DE…, CO…, FA…) ; null pour une piste. */
  ref: string | null;
  name: string;
  /** Statut du document, en code. */
  stage: string | null;
  amount: number;
  date: string;
}

export interface LeadStatusStat {
  status: LeadStatus;
  count: number;
  estimatedValue: number;
}
