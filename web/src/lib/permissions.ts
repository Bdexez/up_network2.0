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

  quotesRead: 'sales.quotes.read',
  quotesCreate: 'sales.quotes.create',
  quotesUpdate: 'sales.quotes.update',
  quotesDelete: 'sales.quotes.delete',

  paymentsRead: 'sales.payments.read',
  paymentsCreate: 'sales.payments.create',
  paymentsDelete: 'sales.payments.delete',

  purchasesRead: 'purchases.orders.read',
  purchasesCreate: 'purchases.orders.create',
  purchasesUpdate: 'purchases.orders.update',
  purchasesDelete: 'purchases.orders.delete',

  stockRead: 'stock.stock.read',
  stockUpdate: 'stock.stock.update',
  warehousesRead: 'stock.warehouses.read',
  warehousesCreate: 'stock.warehouses.create',
  warehousesUpdate: 'stock.warehouses.update',
  warehousesDelete: 'stock.warehouses.delete',

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
  invoicesUpdate: 'sales.invoices.update',
  invoicesDelete: 'sales.invoices.delete',

  usersRead: 'system.users.read',
  usersCreate: 'system.users.create',
  usersUpdate: 'system.users.update',
  usersDelete: 'system.users.delete',

  rolesRead: 'system.roles.read',
  rolesCreate: 'system.roles.create',
  rolesUpdate: 'system.roles.update',
  rolesDelete: 'system.roles.delete',

  projectsRead: 'projects.projects.read',
  projectsCreate: 'projects.projects.create',
  projectsUpdate: 'projects.projects.update',
  projectsDelete: 'projects.projects.delete',
  tasksCreate: 'projects.tasks.create',
  tasksUpdate: 'projects.tasks.update',
  tasksDelete: 'projects.tasks.delete',
  timeCreate: 'projects.time.create',
  timeDelete: 'projects.time.delete',

  employeesRead: 'hr.employees.read',
  employeesCreate: 'hr.employees.create',
  employeesUpdate: 'hr.employees.update',
  employeesDelete: 'hr.employees.delete',

  leaveRead: 'hr.leave.read',
  leaveCreate: 'hr.leave.create',
  leaveApprove: 'hr.leave.approve',
  leaveDelete: 'hr.leave.delete',

  expensesRead: 'hr.expenses.read',
  expensesCreate: 'hr.expenses.create',
  expensesUpdate: 'hr.expenses.update',
  expensesApprove: 'hr.expenses.approve',
  expensesDelete: 'hr.expenses.delete',

  attachmentsRead: 'documents.attachments.read',
  attachmentsCreate: 'documents.attachments.create',
  attachmentsDelete: 'documents.attachments.delete',

  reportsRead: 'reports.accounting.read',
  reportsExport: 'reports.accounting.export',

  companyRead: 'system.companies.read',
  companyUpdate: 'system.companies.update',
} as const;

export type PermissionKey = (typeof P)[keyof typeof P];
