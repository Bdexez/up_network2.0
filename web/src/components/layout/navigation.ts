import {
  Boxes,
  Building2,
  CalendarCheck,
  Contact,
  FileSignature,
  FileText,
  Gauge,
  KanbanSquare,
  Package,
  Receipt,
  Shield,
  ShoppingCart,
  Target,
  Users,
  Warehouse,
  type LucideIcon,
} from 'lucide-react';
import { P } from '../../lib/permissions';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Permission minimale pour voir l'entrée. */
  permission: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Pilotage',
    items: [
      { to: '/', label: 'Tableau de bord', icon: Gauge, permission: P.dashboard },
    ],
  },
  {
    title: 'CRM',
    items: [
      { to: '/crm/pistes', label: 'Pistes', icon: Target, permission: P.leadsRead },
      {
        to: '/crm/pipeline',
        label: 'Pipeline',
        icon: KanbanSquare,
        permission: P.opportunitiesRead,
      },
      {
        to: '/crm/activites',
        label: 'Activités',
        icon: CalendarCheck,
        permission: P.activitiesRead,
      },
      { to: '/clients', label: 'Tiers', icon: Contact, permission: P.partnersRead },
    ],
  },
  {
    title: 'Ventes',
    items: [
      { to: '/devis', label: 'Devis', icon: FileSignature, permission: P.quotesRead },
      { to: '/commandes', label: 'Commandes', icon: FileText, permission: P.ordersRead },
      { to: '/factures', label: 'Factures', icon: Receipt, permission: P.invoicesRead },
    ],
  },
  {
    title: 'Achats & stock',
    items: [
      { to: '/achats', label: 'Commandes fournisseur', icon: ShoppingCart, permission: P.purchasesRead },
      { to: '/produits', label: 'Catalogue', icon: Package, permission: P.productsRead },
      { to: '/stock', label: 'Stock', icon: Boxes, permission: P.stockRead },
      { to: '/entrepots', label: 'Entrepôts', icon: Warehouse, permission: P.warehousesRead },
    ],
  },
  {
    title: 'Administration',
    items: [
      { to: '/reglages/utilisateurs', label: 'Utilisateurs', icon: Users, permission: P.usersRead },
      { to: '/reglages/roles', label: 'Rôles', icon: Shield, permission: P.rolesRead },
      { to: '/reglages/societe', label: 'Société', icon: Building2, permission: P.companyRead },
    ],
  },
];
