/**
 * Clés de permission telles que renvoyées par /auth/me, alignées sur
 * backend/src/common/constants/permissions.ts.
 */
export const P = {
  dashboard: 'dashboard.stats.read',

  partnersRead: 'crm.partners.read',
  partnersCreate: 'crm.partners.create',
  partnersUpdate: 'crm.partners.update',
  partnersDelete: 'crm.partners.delete',

  leadsRead: 'crm.leads.read',
  leadsCreate: 'crm.leads.create',
  leadsUpdate: 'crm.leads.update',
  leadsDelete: 'crm.leads.delete',
  leadsConvert: 'crm.leads.convert',

  opportunitiesRead: 'crm.opportunities.read',
  opportunitiesCreate: 'crm.opportunities.create',
  opportunitiesUpdate: 'crm.opportunities.update',
  opportunitiesDelete: 'crm.opportunities.delete',

  activitiesRead: 'crm.activities.read',
  activitiesCreate: 'crm.activities.create',
  activitiesUpdate: 'crm.activities.update',
  activitiesDelete: 'crm.activities.delete',

  productsRead: 'stock.products.read',
  productsCreate: 'stock.products.create',
  productsUpdate: 'stock.products.update',
  productsDelete: 'stock.products.delete',

  ordersRead: 'sales.orders.read',
  ordersCreate: 'sales.orders.create',
  ordersUpdate: 'sales.orders.update',
  ordersDelete: 'sales.orders.delete',

  invoicesRead: 'sales.invoices.read',
  invoicesCreate: 'sales.invoices.create',
  invoicesDelete: 'sales.invoices.delete',

  usersRead: 'system.users.read',
  usersCreate: 'system.users.create',
  usersUpdate: 'system.users.update',
  usersDelete: 'system.users.delete',

  rolesRead: 'system.roles.read',
  rolesCreate: 'system.roles.create',
  rolesUpdate: 'system.roles.update',
  rolesDelete: 'system.roles.delete',

  companyRead: 'system.companies.read',
  companyUpdate: 'system.companies.update',
} as const;

export type PermissionKey = (typeof P)[keyof typeof P];
