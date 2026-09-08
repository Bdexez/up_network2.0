/**
 * Catalogue global des permissions de l'application.
 * Source unique pour le seed et pour l'écran d'administration des rôles :
 * toute route protégée par @RequirePermission doit y figurer.
 */
export interface PermissionDefinition {
  moduleName: string;
  resourceName: string;
  actionName: string;
  description: string;
}

export const PERMISSION_CATALOG: PermissionDefinition[] = [
  // --- Tableau de bord ---
  { moduleName: 'dashboard', resourceName: 'stats', actionName: 'read', description: 'Consulter le tableau de bord' },

  // --- Administration ---
  { moduleName: 'system', resourceName: 'users', actionName: 'read', description: 'Consulter les utilisateurs' },
  { moduleName: 'system', resourceName: 'users', actionName: 'create', description: 'Créer un utilisateur' },
  { moduleName: 'system', resourceName: 'users', actionName: 'update', description: 'Modifier un utilisateur' },
  { moduleName: 'system', resourceName: 'users', actionName: 'delete', description: 'Retirer un utilisateur' },
  { moduleName: 'system', resourceName: 'roles', actionName: 'read', description: 'Consulter les rôles' },
  { moduleName: 'system', resourceName: 'roles', actionName: 'create', description: 'Créer un rôle' },
  { moduleName: 'system', resourceName: 'roles', actionName: 'update', description: 'Modifier un rôle' },
  { moduleName: 'system', resourceName: 'roles', actionName: 'delete', description: 'Supprimer un rôle' },
  { moduleName: 'system', resourceName: 'companies', actionName: 'read', description: 'Consulter la société' },
  { moduleName: 'system', resourceName: 'companies', actionName: 'update', description: 'Modifier la société' },

  // --- CRM ---
  { moduleName: 'crm', resourceName: 'partners', actionName: 'read', description: 'Consulter les clients' },
  { moduleName: 'crm', resourceName: 'partners', actionName: 'create', description: 'Créer un client' },
  { moduleName: 'crm', resourceName: 'partners', actionName: 'update', description: 'Modifier un client' },
  { moduleName: 'crm', resourceName: 'partners', actionName: 'delete', description: 'Supprimer un client' },
  { moduleName: 'crm', resourceName: 'leads', actionName: 'read', description: 'Consulter les pistes' },
  { moduleName: 'crm', resourceName: 'leads', actionName: 'create', description: 'Créer une piste' },
  { moduleName: 'crm', resourceName: 'leads', actionName: 'update', description: 'Modifier une piste' },
  { moduleName: 'crm', resourceName: 'leads', actionName: 'delete', description: 'Supprimer une piste' },
  { moduleName: 'crm', resourceName: 'leads', actionName: 'convert', description: 'Convertir une piste en client' },
  { moduleName: 'crm', resourceName: 'opportunities', actionName: 'read', description: 'Consulter le pipeline' },
  { moduleName: 'crm', resourceName: 'opportunities', actionName: 'create', description: 'Créer une opportunité' },
  { moduleName: 'crm', resourceName: 'opportunities', actionName: 'update', description: 'Modifier une opportunité' },
  { moduleName: 'crm', resourceName: 'opportunities', actionName: 'delete', description: 'Supprimer une opportunité' },
  { moduleName: 'crm', resourceName: 'activities', actionName: 'read', description: 'Consulter les activités' },
  { moduleName: 'crm', resourceName: 'activities', actionName: 'create', description: 'Créer une activité' },
  { moduleName: 'crm', resourceName: 'activities', actionName: 'update', description: 'Modifier une activité' },
  { moduleName: 'crm', resourceName: 'activities', actionName: 'delete', description: 'Supprimer une activité' },

  // --- Catalogue ---
  { moduleName: 'stock', resourceName: 'products', actionName: 'read', description: 'Consulter le catalogue' },
  { moduleName: 'stock', resourceName: 'products', actionName: 'create', description: 'Créer un produit' },
  { moduleName: 'stock', resourceName: 'products', actionName: 'update', description: 'Modifier un produit' },
  { moduleName: 'stock', resourceName: 'products', actionName: 'delete', description: 'Supprimer un produit' },

  // --- Ventes ---
  { moduleName: 'sales', resourceName: 'orders', actionName: 'read', description: 'Consulter les commandes' },
  { moduleName: 'sales', resourceName: 'orders', actionName: 'create', description: 'Créer une commande' },
  { moduleName: 'sales', resourceName: 'orders', actionName: 'update', description: 'Modifier une commande' },
  { moduleName: 'sales', resourceName: 'orders', actionName: 'delete', description: 'Supprimer une commande' },
  { moduleName: 'sales', resourceName: 'invoices', actionName: 'read', description: 'Consulter les factures' },
  { moduleName: 'sales', resourceName: 'invoices', actionName: 'create', description: 'Générer une facture' },
  { moduleName: 'sales', resourceName: 'invoices', actionName: 'update', description: 'Modifier une facture' },
  { moduleName: 'sales', resourceName: 'invoices', actionName: 'delete', description: 'Supprimer une facture' },
];

/** Accepte aussi bien une définition du catalogue qu'une ligne Permission. */
export const permissionKey = (p: {
  moduleName: string;
  resourceName: string;
  actionName: string;
}) => `${p.moduleName}.${p.resourceName}.${p.actionName}`;
