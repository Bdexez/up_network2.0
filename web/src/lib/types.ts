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

export interface Company {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
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

export interface Partner {
  id: number;
  name: string;
  type: PartnerType;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  website: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: { orders: number; opportunities: number };
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string | null;
  price: number;
  createdAt: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product: Product;
}

export interface Order {
  id: number;
  total: number;
  createdAt: string;
  partnerId: number;
  partner: Partner;
  items: OrderItem[];
  invoice: Invoice | null;
  createdBy: { id: number; username: string; email: string };
}

export interface Invoice {
  id: number;
  orderId: number;
  total: number;
  pdfUrl: string | null;
  createdAt: string;
  order?: Order;
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
  openLeads: number;
  openOpportunities: number;
  openPipelineAmount: number;
  wonOpportunities: number;
  wonAmount: number;
  overdueActivities: number;
}

export interface RevenuePoint {
  month: string;
  total: number;
}

export interface TopPartner {
  partnerId: number;
  name: string;
  orders: number;
  total: number;
}

export interface RecentEvent {
  type: 'order' | 'lead' | 'opportunity';
  id: number;
  name: string;
  /** Statut de piste ou étape d'opportunité, en code ; null pour une commande. */
  stage: string | null;
  amount: number;
  date: string;
}

export interface LeadStatusStat {
  status: LeadStatus;
  count: number;
  estimatedValue: number;
}
