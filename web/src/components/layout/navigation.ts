import {
  Boxes,
  Building2,
  CalendarCheck,
  CalendarDays,
  Contact,
  FileSignature,
  FileText,
  FolderKanban,
  Gauge,
  KanbanSquare,
  Package,
  Receipt,
  ReceiptText,
  Scale,
  Shield,
  ShoppingCart,
  Target,
  UserRound,
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
    title: 'Projets',
    items: [
      { to: '/projets', label: 'Projets', icon: FolderKanban, permission: P.projectsRead },
    ],
  },
  {
    title: 'Ressources humaines',
    items: [
      { to: '/rh/employes', label: 'Employés', icon: UserRound, permission: P.employeesRead },
      { to: '/rh/conges', label: 'Congés', icon: CalendarDays, permission: P.leaveRead },
      {
        to: '/rh/notes-de-frais',
        label: 'Notes de frais',
        icon: ReceiptText,
        permission: P.expensesRead,
      },
    ],
  },
  {
    title: 'Comptabilité',
    items: [
      { to: '/etats', label: 'États comptables', icon: Scale, permission: P.reportsRead },
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
