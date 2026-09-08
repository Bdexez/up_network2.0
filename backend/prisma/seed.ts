import {
  ActivityStatus,
  ActivityType,
  LeadStatus,
  OpportunityStage,
  PartnerType,
  PrismaClient,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  PERMISSION_CATALOG,
  permissionKey,
} from '../src/common/constants/permissions';

const prisma = new PrismaClient();

/** Rôles fournis d'origine, décrits par préfixe de permission. */
const ROLE_TEMPLATES = [
  {
    name: 'Admin',
    description: 'Accès complet à la société',
    isSystemRole: true,
    matches: () => true,
  },
  {
    name: 'Commercial',
    description: 'CRM et ventes, sans administration',
    isSystemRole: false,
    matches: (key: string) =>
      key.startsWith('crm.') ||
      key.startsWith('sales.') ||
      key === 'stock.products.read' ||
      key === 'dashboard.stats.read',
  },
  {
    name: 'Lecteur',
    description: 'Consultation seule',
    isSystemRole: false,
    matches: (key: string) => key.endsWith('.read'),
  },
];

async function main() {
  // 1. Permissions (catalogue global, partagé par toutes les sociétés)
  for (const permission of PERMISSION_CATALOG) {
    await prisma.permission.upsert({
      where: {
        moduleName_resourceName_actionName: {
          moduleName: permission.moduleName,
          resourceName: permission.resourceName,
          actionName: permission.actionName,
        },
      },
      update: { description: permission.description, isSystem: true },
      create: { ...permission, isSystem: true },
    });
  }
  const allPermissions = await prisma.permission.findMany();
  console.log(`✅ ${allPermissions.length} permissions`);

  // 2. Société de démonstration
  const company = await prisma.company.upsert({
    where: { code: 'DEM001' },
    update: {},
    create: { name: 'DemoCorp', code: 'DEM001' },
  });

  // 3. Rôles
  const roles: Record<string, number> = {};
  for (const template of ROLE_TEMPLATES) {
    const role = await prisma.role.upsert({
      where: { name_companyId: { name: template.name, companyId: company.id } },
      update: { description: template.description },
      create: {
        name: template.name,
        description: template.description,
        companyId: company.id,
        isSystemRole: template.isSystemRole,
      },
    });
    roles[template.name] = role.id;

    const granted = allPermissions.filter((p) =>
      template.matches(permissionKey(p)),
    );
    for (const permission of granted) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: role.id, permissionId: permission.id },
        },
        update: { granted: true },
        create: {
          roleId: role.id,
          permissionId: permission.id,
          granted: true,
        },
      });
    }
    console.log(`✅ Rôle ${template.name} (${granted.length} permissions)`);
  }

  // 4. Utilisateurs
  const users = [
    {
      email: 'admin@demo.com',
      username: 'admin',
      password: 'admin123',
      firstName: 'Alice',
      lastName: 'Martin',
      role: 'Admin',
    },
    {
      email: 'commercial@demo.com',
      username: 'commercial',
      password: 'demo1234',
      firstName: 'Karim',
      lastName: 'Benali',
      role: 'Commercial',
    },
    {
      email: 'lecteur@demo.com',
      username: 'lecteur',
      password: 'demo1234',
      firstName: 'Chloé',
      lastName: 'Dubois',
      role: 'Lecteur',
    },
  ];

  const userIds: Record<string, number> = {};
  for (const entry of users) {
    const passwordHash = await bcrypt.hash(entry.password, 10);
    const user = await prisma.user.upsert({
      where: { email: entry.email },
      update: { passwordHash, firstName: entry.firstName, lastName: entry.lastName },
      create: {
        email: entry.email,
        username: entry.username,
        passwordHash,
        firstName: entry.firstName,
        lastName: entry.lastName,
        userType: entry.role === 'Admin' ? 'admin' : 'internal',
      },
    });
    userIds[entry.username] = user.id;

    await prisma.userCompany.upsert({
      where: {
        userId_companyId: { userId: user.id, companyId: company.id },
      },
      update: { roleId: roles[entry.role], isDefault: true },
      create: {
        userId: user.id,
        companyId: company.id,
        roleId: roles[entry.role],
        isDefault: true,
      },
    });
  }
  console.log(`✅ ${users.length} utilisateurs`);

  // À partir d'ici : données de démonstration.
  // Par défaut on ne recrée rien si elles existent déjà ; `--fresh` les remplace.
  const fresh = process.argv.includes('--fresh');
  const existingPartners = await prisma.partner.count({
    where: { companyId: company.id },
  });

  if (existingPartners > 0 && !fresh) {
    console.log('ℹ️  Données de démo déjà présentes (relancez avec --fresh pour les remplacer).');
    console.log('\n🌱 Seed terminé.\n');
    printCredentials(users);
    return;
  }

  if (fresh) {
    // Ordre imposé par les clés étrangères. Seule la société de démo est touchée ;
    // les comptes, rôles et permissions sont conservés.
    await prisma.activity.deleteMany({ where: { companyId: company.id } });
    await prisma.opportunity.deleteMany({ where: { companyId: company.id } });
    await prisma.lead.deleteMany({ where: { companyId: company.id } });
    await prisma.invoice.deleteMany({ where: { order: { companyId: company.id } } });
    await prisma.orderItem.deleteMany({ where: { order: { companyId: company.id } } });
    await prisma.order.deleteMany({ where: { companyId: company.id } });
    await prisma.product.deleteMany({ where: { companyId: company.id } });
    await prisma.partner.deleteMany({ where: { companyId: company.id } });
    console.log('🧹 Anciennes données de démo supprimées');
  }

  // 5. Clients
  const partnerSeeds = [
    { name: 'Boulangerie Lefèvre', email: 'contact@lefevre.fr', phone: '01 42 88 12 03', city: 'Paris', country: 'France', type: PartnerType.CUSTOMER },
    { name: 'Atelier Novak', email: 'hello@novak-atelier.fr', phone: '04 78 55 21 90', city: 'Lyon', country: 'France', type: PartnerType.CUSTOMER },
    { name: 'Groupe Vartex', email: 'achats@vartex.com', phone: '05 61 22 04 77', city: 'Toulouse', country: 'France', type: PartnerType.BOTH },
    { name: 'Studio Kanto', email: 'team@kanto.studio', phone: '02 40 19 63 12', city: 'Nantes', country: 'France', type: PartnerType.CUSTOMER },
    { name: 'Fournitures Bréval', email: 'ventes@breval.fr', phone: '03 20 45 78 01', city: 'Lille', country: 'France', type: PartnerType.SUPPLIER },
  ];
  const partners: { id: number }[] = [];
  for (const seed of partnerSeeds) {
    partners.push(
      await prisma.partner.create({ data: { ...seed, companyId: company.id } }),
    );
  }
  console.log(`✅ ${partners.length} clients`);

  // 6. Catalogue
  const productSeeds = [
    { name: 'Licence ERP — Starter', sku: 'ERP-START', price: 490, description: 'Abonnement annuel, 5 utilisateurs' },
    { name: 'Licence ERP — Business', sku: 'ERP-BIZ', price: 1290, description: 'Abonnement annuel, 25 utilisateurs' },
    { name: 'Module CRM avancé', sku: 'MOD-CRM', price: 350, description: 'Pipeline, scoring, relances' },
    { name: 'Journée de formation', sku: 'SRV-FORM', price: 890, description: 'Sur site, 7 heures' },
    { name: 'Reprise de données', sku: 'SRV-MIGR', price: 1450, description: 'Import et contrôle qualité' },
    { name: 'Support premium', sku: 'SRV-SUP', price: 240, description: 'Astreinte 24/7, par mois' },
  ];
  const products: { id: number; price: number }[] = [];
  for (const seed of productSeeds) {
    products.push(
      await prisma.product.create({ data: { ...seed, companyId: company.id } }),
    );
  }
  console.log(`✅ ${products.length} produits`);

  // 7. Commandes réparties sur les derniers mois
  const orderPlans = [
    { partner: 0, monthsAgo: 5, lines: [[0, 2], [3, 1]] },
    { partner: 1, monthsAgo: 4, lines: [[1, 1], [2, 2]] },
    { partner: 2, monthsAgo: 3, lines: [[1, 3], [4, 1], [5, 6]] },
    { partner: 3, monthsAgo: 2, lines: [[0, 1], [2, 1]] },
    { partner: 0, monthsAgo: 1, lines: [[5, 12]] },
    { partner: 2, monthsAgo: 0, lines: [[1, 2], [3, 2]] },
  ];

  const createdOrders: { id: number }[] = [];
  for (const plan of orderPlans) {
    const createdAt = monthsBefore(plan.monthsAgo);
    const items = plan.lines.map(([productIndex, quantity]) => ({
      productId: products[productIndex].id,
      quantity,
      price: products[productIndex].price,
    }));
    const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0);

    createdOrders.push(
      await prisma.order.create({
        data: {
          companyId: company.id,
          partnerId: partners[plan.partner].id,
          createdById: userIds.commercial,
          total,
          createdAt,
          updatedAt: createdAt,
          items: { create: items },
        },
      }),
    );
  }
  console.log(`✅ ${createdOrders.length} commandes`);

  // 8. Pistes
  const leadSeeds = [
    { name: 'Refonte parc logiciel', companyName: 'Menuiserie Ravel', contactName: 'Julien Ravel', email: 'j.ravel@ravel-bois.fr', phone: '02 99 31 44 08', source: 'Site web', status: LeadStatus.NEW, estimatedValue: 4200 },
    { name: 'Migration depuis Excel', companyName: 'Cabinet Aurel', contactName: 'Sofia Aurel', email: 's.aurel@cabinet-aurel.fr', source: 'Recommandation', status: LeadStatus.CONTACTED, estimatedValue: 2800 },
    { name: 'Déploiement 3 agences', companyName: 'Transports Merci', contactName: 'Paul Merci', email: 'p.merci@merci-transport.fr', phone: '04 91 20 87 33', source: 'Salon', status: LeadStatus.QUALIFIED, estimatedValue: 11500 },
    { name: 'Besoin CRM simple', companyName: 'Fleuriste Iris', contactName: 'Nina Iris', email: 'bonjour@iris-fleurs.fr', source: 'Appel entrant', status: LeadStatus.CONTACTED, estimatedValue: 1200 },
    { name: 'Audit process achats', companyName: 'Vartex Industrie', contactName: 'Hugo Lemoine', email: 'h.lemoine@vartex.com', source: 'Salon', status: LeadStatus.UNQUALIFIED, estimatedValue: 0 },
  ];
  const leads: { id: number }[] = [];
  for (const seed of leadSeeds) {
    leads.push(
      await prisma.lead.create({
        data: { ...seed, companyId: company.id, ownerId: userIds.commercial },
      }),
    );
  }
  console.log(`✅ ${leads.length} pistes`);

  // 9. Opportunités réparties sur le pipeline
  const opportunitySeeds = [
    { name: 'Transports Merci — 3 agences', stage: OpportunityStage.NEGOTIATION, amount: 11500, probability: 70, partner: 2, lead: 2, inDays: 21 },
    { name: 'Boulangerie Lefèvre — renouvellement', stage: OpportunityStage.PROPOSAL, amount: 1780, probability: 40, partner: 0, inDays: 14 },
    { name: 'Studio Kanto — module CRM', stage: OpportunityStage.QUALIFICATION, amount: 840, probability: 10, partner: 3, inDays: 45 },
    { name: 'Atelier Novak — extension', stage: OpportunityStage.PROPOSAL, amount: 2340, probability: 40, partner: 1, inDays: 30 },
    { name: 'Groupe Vartex — support premium', stage: OpportunityStage.WON, amount: 2880, probability: 100, partner: 2, inDays: -10 },
    { name: 'Cabinet Aurel — pack starter', stage: OpportunityStage.LOST, amount: 490, probability: 0, partner: 1, inDays: -25, lostReason: 'Budget reporté à l’exercice suivant' },
  ];
  const opportunities: { id: number }[] = [];
  for (const seed of opportunitySeeds) {
    const closed =
      seed.stage === OpportunityStage.WON || seed.stage === OpportunityStage.LOST;
    opportunities.push(
      await prisma.opportunity.create({
        data: {
          companyId: company.id,
          name: seed.name,
          stage: seed.stage,
          amount: seed.amount,
          probability: seed.probability,
          partnerId: partners[seed.partner].id,
          leadId: seed.lead !== undefined ? leads[seed.lead].id : null,
          ownerId: userIds.commercial,
          expectedCloseDate: daysFromNow(seed.inDays),
          closedAt: closed ? daysFromNow(seed.inDays) : null,
          lostReason: seed.lostReason ?? null,
        },
      }),
    );
  }
  console.log(`✅ ${opportunities.length} opportunités`);

  // 10. Activités
  const activitySeeds = [
    { subject: 'Rappeler Julien Ravel', type: ActivityType.CALL, status: ActivityStatus.PLANNED, inDays: 1, lead: 0 },
    { subject: 'Envoyer la proposition commerciale', type: ActivityType.EMAIL, status: ActivityStatus.PLANNED, inDays: 2, opportunity: 1 },
    { subject: 'Réunion de cadrage — 3 agences', type: ActivityType.MEETING, status: ActivityStatus.PLANNED, inDays: 5, opportunity: 0 },
    { subject: 'Relance devis Studio Kanto', type: ActivityType.TASK, status: ActivityStatus.PLANNED, inDays: -3, opportunity: 2 },
    { subject: 'Compte rendu du salon', type: ActivityType.NOTE, status: ActivityStatus.DONE, inDays: -12, lead: 2 },
    { subject: 'Signature du contrat Vartex', type: ActivityType.TASK, status: ActivityStatus.DONE, inDays: -10, opportunity: 4 },
    { subject: 'Point trimestriel client', type: ActivityType.MEETING, status: ActivityStatus.PLANNED, inDays: 9, partner: 0 },
  ];
  for (const seed of activitySeeds) {
    await prisma.activity.create({
      data: {
        companyId: company.id,
        subject: seed.subject,
        type: seed.type,
        status: seed.status,
        dueDate: daysFromNow(seed.inDays),
        completedAt:
          seed.status === ActivityStatus.DONE ? daysFromNow(seed.inDays) : null,
        ownerId: userIds.commercial,
        leadId: seed.lead !== undefined ? leads[seed.lead].id : null,
        opportunityId:
          seed.opportunity !== undefined
            ? opportunities[seed.opportunity].id
            : null,
        partnerId:
          seed.partner !== undefined ? partners[seed.partner].id : null,
      },
    });
  }
  console.log(`✅ ${activitySeeds.length} activités`);

  console.log('\n🌱 Seed terminé.\n');
  printCredentials(users);
}

function printCredentials(users: { email: string; password: string; role: string }[]) {
  console.log('Comptes de démonstration :');
  for (const user of users) {
    console.log(`  • ${user.email.padEnd(22)} / ${user.password.padEnd(10)} (${user.role})`);
  }
  console.log('');
}

function daysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function monthsBefore(months: number) {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  date.setDate(Math.min(date.getDate(), 27));
  return date;
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
