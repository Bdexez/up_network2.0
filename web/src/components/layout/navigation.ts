import {
  Building2,
  Contact,
  FileText,
  Gauge,
  KanbanSquare,
  Package,
  Receipt,
  Shield,
  Target,
  Users,
  CalendarCheck,
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
      { to: '/clients', label: 'Clients', icon: Contact, permission: P.partnersRead },
    ],
  },
  {
    title: 'Ventes',
    items: [
      { to: '/produits', label: 'Catalogue', icon: Package, permission: P.productsRead },
      { to: '/commandes', label: 'Commandes', icon: FileText, permission: P.ordersRead },
      { to: '/factures', label: 'Factures', icon: Receipt, permission: P.invoicesRead },
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
