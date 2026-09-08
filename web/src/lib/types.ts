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
}

export interface Company {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
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
  user: Profile;
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
  vatBreakdown?: VatBreakdownEntry[];
  createdAt: string;
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
  lines: DocumentLine[];
  quote: { id: number; ref: string } | null;
  invoices: { id: number; ref: string; status: InvoiceStatus; totalTTC: number }[];
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
  vatBreakdown?: VatBreakdownEntry[];
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
