import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // 1. Créer ou récupérer l’entreprise
  const company = await prisma.company.upsert({
    where: { code: 'DEM001' },
    update: {},
    create: { name: 'DemoCorp', code: 'DEM001' },
  });

  // 2. Créer quelques permissions
  const permissionsData = [
    { moduleName: 'system', resourceName: 'users', actionName: 'read' },
    { moduleName: 'system', resourceName: 'users', actionName: 'create' },
    { moduleName: 'crm', resourceName: 'clients', actionName: 'read' },
    { moduleName: 'crm', resourceName: 'clients', actionName: 'create' },
    { moduleName: 'system', resourceName: 'companies', actionName: 'read' },
    { moduleName: 'system', resourceName: 'companies', actionName: 'create' },
    { moduleName: 'system', resourceName: 'users', actionName: 'manage' },
    { moduleName: 'system', resourceName: 'users', actionName: 'read' },
    { moduleName: 'crm', resourceName: 'partners', actionName: 'read' },
    { moduleName: 'crm', resourceName: 'partners', actionName: 'create' },
    { moduleName: 'crm', resourceName: 'partners', actionName: 'update' },
    { moduleName: 'crm', resourceName: 'partners', actionName: 'delete' },
    { moduleName: 'stock', resourceName: 'products', actionName: 'read' },
    { moduleName: 'stock', resourceName: 'products', actionName: 'create' },
    { moduleName: 'stock', resourceName: 'products', actionName: 'update' },
    { moduleName: 'stock', resourceName: 'products', actionName: 'delete' },
    { moduleName: 'sales', resourceName: 'orders', actionName: 'read' },
    { moduleName: 'sales', resourceName: 'orders', actionName: 'create' },
    { moduleName: 'sales', resourceName: 'orders', actionName: 'update' },
    { moduleName: 'sales', resourceName: 'orders', actionName: 'delete' },
    { moduleName: 'sales', resourceName: 'invoices', actionName: 'read' },
    { moduleName: 'sales', resourceName: 'invoices', actionName: 'create' },
  ];

  for (const perm of permissionsData) {
    await prisma.permission.upsert({
      where: {
        moduleName_resourceName_actionName: {
          moduleName: perm.moduleName,
          resourceName: perm.resourceName,
          actionName: perm.actionName,
        },
      },
      update: {},
      create: perm,
    });
  }

  // 3. Créer un rôle Admin
  const adminRole = await prisma.role.upsert({
    where: { name_companyId: { name: 'Admin', companyId: company.id } },
    update: {},
    create: { name: 'Admin', companyId: company.id },
  });

  // 4. Donner toutes les permissions au rôle Admin
  const allPermissions = await prisma.permission.findMany();
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id },
      },
      update: { granted: true },
      create: { roleId: adminRole.id, permissionId: perm.id, granted: true },
    });
  }

  // 5. Associer ton utilisateur Admin existant à ce rôle
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@demo.com' },
  });

  if (adminUser) {
    await prisma.userCompany.updateMany({
      where: { userId: adminUser.id, companyId: company.id },
      data: { roleId: adminRole.id },
    });
  }

  console.log('🌱 Seed terminé avec succès');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
