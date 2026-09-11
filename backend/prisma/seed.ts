// Charge backend/.env pour que `ts-node prisma/seed.ts` dispose de DATABASE_URL
// (Prisma Client, contrairement à la CLI Prisma, ne lit pas .env tout seul).
import 'dotenv/config';
import {
  ActivityStatus,
  ActivityType,
  DocumentType,
  ExpenseCategory,
  ExpenseStatus,
  InvoiceStatus,
  LeadStatus,
  LeaveStatus,
  LeaveType,
  OpportunityStage,
  OrderStatus,
  PartnerType,
  PaymentMethod,
  PrismaClient,
  ProductType,
  ProjectStatus,
  PurchaseOrderStatus,
  QuoteStatus,
  StockMovementType,
  TaskStatus,
} from '@prisma/client';
import {
  computeDocumentTotals,
  computeLineTotals,
} from '../src/common/documents/totals';
import {
  computeExpenseLine,
  sumExpenseLines,
} from '../src/modules/hr/expense-totals';
import { countWorkingDays } from '../src/modules/hr/leave-days';
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
    description: 'CRM, ventes, achats et stock — sans administration',
    isSystemRole: false,
    matches: (key: string) =>
      key.startsWith('crm.') ||
      key.startsWith('sales.') ||
      key.startsWith('purchases.') ||
      key.startsWith('stock.') ||
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

  // 1 bis. Rattrapage des rôles système déjà en base.
  // Le rôle « Admin » d'une société créée à l'inscription fige les permissions
  // existantes ce jour-là. Sans ce rattrapage, un module ajouté ensuite
  // resterait invisible pour l'administrateur de cette société — le menu
  // n'apparaîtrait tout simplement pas.
  const systemRoles = await prisma.role.findMany({
    where: { isSystemRole: true },
    select: { id: true, permissions: { select: { permissionId: true } } },
  });

  let added = 0;
  for (const role of systemRoles) {
    const held = new Set(role.permissions.map((p) => p.permissionId));
    const missing = allPermissions.filter((p) => !held.has(p.id));
    if (missing.length === 0) continue;

    await prisma.rolePermission.createMany({
      data: missing.map((permission) => ({
        roleId: role.id,
        permissionId: permission.id,
        granted: true,
      })),
      skipDuplicates: true,
    });
    added += missing.length;
  }
  console.log(
    `✅ ${systemRoles.length} rôle(s) système à jour (${added} permission(s) ajoutée(s))`,
  );

  // 2. Société de démonstration
  const company = await prisma.company.upsert({
    where: { code: 'DEM001' },
    update: {},
    create: {
      name: 'DemoCorp',
      code: 'DEM001',
      address: '12 rue des Lilas',
      zipCode: '75011',
      city: 'Paris',
      country: 'France',
      email: 'contact@democorp.fr',
      phone: '01 45 22 18 90',
      vatNumber: 'FR40123456789',
      defaultVatRate: 20,
    },
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
      update: {
        passwordHash,
        firstName: entry.firstName,
        lastName: entry.lastName,
      },
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
    console.log(
      'ℹ️  Données de démo déjà présentes (relancez avec --fresh pour les remplacer).',
    );
    console.log('\n🌱 Seed terminé.\n');
    printCredentials(users);
    return;
  }

  if (fresh) {
    // Ordre imposé par les clés étrangères. Seule la société de démo est
    // touchée : comptes, rôles et permissions sont conservés.
    // Projets : temps → tâches → projets (avant les tiers, qu'ils référencent).
    await prisma.timeEntry.deleteMany({
      where: { project: { companyId: company.id } },
    });
    await prisma.task.deleteMany({
      where: { project: { companyId: company.id } },
    });
    await prisma.project.deleteMany({ where: { companyId: company.id } });
    // RH : les congés et notes de frais tombent en cascade avec l'employé.
    await prisma.expenseReport.deleteMany({ where: { companyId: company.id } });
    await prisma.leaveRequest.deleteMany({
      where: { employee: { companyId: company.id } },
    });
    await prisma.employee.deleteMany({ where: { companyId: company.id } });
    await prisma.activity.deleteMany({ where: { companyId: company.id } });
    await prisma.opportunity.deleteMany({ where: { companyId: company.id } });
    await prisma.lead.deleteMany({ where: { companyId: company.id } });
    await prisma.payment.deleteMany({
      where: { invoice: { companyId: company.id } },
    });
    await prisma.invoice.deleteMany({ where: { companyId: company.id } });
    await prisma.order.deleteMany({ where: { companyId: company.id } });
    await prisma.quote.deleteMany({ where: { companyId: company.id } });
    await prisma.purchaseOrder.deleteMany({ where: { companyId: company.id } });
    await prisma.stockMovement.deleteMany({ where: { companyId: company.id } });
    await prisma.stock.deleteMany({
      where: { warehouse: { companyId: company.id } },
    });
    await prisma.warehouse.deleteMany({ where: { companyId: company.id } });
    await prisma.product.deleteMany({ where: { companyId: company.id } });
    await prisma.contact.deleteMany({
      where: { partner: { companyId: company.id } },
    });
    await prisma.partner.deleteMany({ where: { companyId: company.id } });
    await prisma.documentCounter.deleteMany({
      where: { companyId: company.id },
    });
    console.log('🧹 Anciennes données de démo supprimées');
  }

  // --- 5. Entrepôts ---------------------------------------------------------
  const mainWarehouse = await prisma.warehouse.create({
    data: {
      companyId: company.id,
      name: 'Entrepôt principal',
      code: 'PRINC',
      city: 'Paris',
      isDefault: true,
    },
  });
  const secondaryWarehouse = await prisma.warehouse.create({
    data: {
      companyId: company.id,
      name: 'Dépôt Lyon',
      code: 'LYON',
      city: 'Lyon',
    },
  });
  console.log('✅ 2 entrepôts');

  // --- 6. Catalogue ---------------------------------------------------------
  const productSeeds = [
    {
      name: 'Licence ERP — Starter',
      sku: 'ERP-START',
      price: 490,
      costPrice: 120,
      type: ProductType.SERVICE,
      manageStock: false,
      description: 'Abonnement annuel, 5 utilisateurs',
    },
    {
      name: 'Licence ERP — Business',
      sku: 'ERP-BIZ',
      price: 1290,
      costPrice: 320,
      type: ProductType.SERVICE,
      manageStock: false,
      description: 'Abonnement annuel, 25 utilisateurs',
    },
    {
      name: 'Module CRM avancé',
      sku: 'MOD-CRM',
      price: 350,
      costPrice: 90,
      type: ProductType.SERVICE,
      manageStock: false,
      description: 'Pipeline, scoring, relances',
    },
    {
      name: 'Journée de formation',
      sku: 'SRV-FORM',
      price: 890,
      costPrice: 400,
      type: ProductType.SERVICE,
      manageStock: false,
      description: 'Sur site, 7 heures',
    },
    {
      name: 'Terminal code-barres',
      sku: 'MAT-TERM',
      price: 640,
      costPrice: 380,
      type: ProductType.PRODUCT,
      manageStock: true,
      stockAlert: 5,
      description: 'Douchette sans fil, socle inclus',
    },
    {
      name: 'Imprimante étiquettes',
      sku: 'MAT-IMPR',
      price: 320,
      costPrice: 175,
      type: ProductType.PRODUCT,
      manageStock: true,
      stockAlert: 4,
      description: 'Thermique 203 dpi',
    },
    {
      name: 'Rouleau étiquettes (x10)',
      sku: 'CON-ETIQ',
      price: 45,
      costPrice: 18,
      type: ProductType.PRODUCT,
      manageStock: true,
      stockAlert: 20,
      description: 'Boîte de 10 rouleaux',
    },
    {
      name: 'Support premium',
      sku: 'SRV-SUP',
      price: 240,
      costPrice: 60,
      type: ProductType.SERVICE,
      manageStock: false,
      description: 'Astreinte 24/7, par mois',
    },
  ];

  const products: Record<
    string,
    {
      id: number;
      price: number;
      costPrice: number;
      vatRate: number;
      name: string;
    }
  > = {};
  for (const seed of productSeeds) {
    const product = await prisma.product.create({
      data: { ...seed, companyId: company.id, vatRate: 20 },
    });
    products[seed.sku] = product;
  }
  console.log(`✅ ${productSeeds.length} produits`);

  // --- 7. Stock initial -----------------------------------------------------
  const initialStock = [
    { sku: 'MAT-TERM', warehouse: mainWarehouse.id, quantity: 14 },
    { sku: 'MAT-IMPR', warehouse: mainWarehouse.id, quantity: 9 },
    { sku: 'CON-ETIQ', warehouse: mainWarehouse.id, quantity: 60 },
    { sku: 'MAT-TERM', warehouse: secondaryWarehouse.id, quantity: 3 },
    { sku: 'CON-ETIQ', warehouse: secondaryWarehouse.id, quantity: 12 },
  ];
  for (const entry of initialStock) {
    const product = products[entry.sku];
    await prisma.stock.create({
      data: {
        productId: product.id,
        warehouseId: entry.warehouse,
        quantity: entry.quantity,
      },
    });
    await prisma.stockMovement.create({
      data: {
        companyId: company.id,
        createdById: userIds.admin,
        productId: product.id,
        warehouseId: entry.warehouse,
        type: StockMovementType.IN,
        quantity: entry.quantity,
        resultingQuantity: entry.quantity,
        reason: 'Stock initial',
        createdAt: monthsBefore(6),
      },
    });
  }
  console.log(`✅ stock initial sur ${initialStock.length} emplacements`);

  // --- 8. Tiers et contacts -------------------------------------------------
  const partnerSeeds = [
    {
      name: 'Boulangerie Lefèvre',
      email: 'contact@lefevre.fr',
      phone: '01 42 88 12 03',
      zipCode: '75012',
      city: 'Paris',
      country: 'France',
      type: PartnerType.CUSTOMER,
      vatNumber: 'FR11223344556',
      contact: {
        firstName: 'Marc',
        lastName: 'Lefèvre',
        role: 'Gérant',
        email: 'm.lefevre@lefevre.fr',
      },
    },
    {
      name: 'Atelier Novak',
      email: 'hello@novak-atelier.fr',
      phone: '04 78 55 21 90',
      zipCode: '69003',
      city: 'Lyon',
      country: 'France',
      type: PartnerType.CUSTOMER,
      contact: {
        firstName: 'Ivana',
        lastName: 'Novak',
        role: 'Directrice',
        email: 'i.novak@novak-atelier.fr',
      },
    },
    {
      name: 'Groupe Vartex',
      email: 'achats@vartex.com',
      phone: '05 61 22 04 77',
      zipCode: '31000',
      city: 'Toulouse',
      country: 'France',
      type: PartnerType.BOTH,
      vatNumber: 'FR99887766554',
      contact: {
        firstName: 'Hugo',
        lastName: 'Lemoine',
        role: 'Responsable achats',
        email: 'h.lemoine@vartex.com',
      },
    },
    {
      name: 'Studio Kanto',
      email: 'team@kanto.studio',
      phone: '02 40 19 63 12',
      zipCode: '44000',
      city: 'Nantes',
      country: 'France',
      type: PartnerType.CUSTOMER,
      contact: {
        firstName: 'Lise',
        lastName: 'Marchand',
        role: 'Office manager',
      },
    },
    {
      name: 'Fournitures Bréval',
      email: 'ventes@breval.fr',
      phone: '03 20 45 78 01',
      zipCode: '59000',
      city: 'Lille',
      country: 'France',
      type: PartnerType.SUPPLIER,
      contact: { firstName: 'Serge', lastName: 'Bréval', role: 'Commercial' },
    },
    {
      name: 'Nordic Hardware AB',
      email: 'sales@nordic-hw.se',
      phone: '+46 8 555 010',
      zipCode: '11122',
      city: 'Stockholm',
      country: 'Suède',
      type: PartnerType.SUPPLIER,
    },
  ];

  const partners: Record<string, { id: number; name: string }> = {};
  for (const { contact, ...seed } of partnerSeeds) {
    const partner = await prisma.partner.create({
      data: { ...seed, companyId: company.id },
    });
    partners[seed.name] = partner;

    if (contact) {
      await prisma.contact.create({
        data: { ...contact, partnerId: partner.id, isPrimary: true },
      });
    }
  }
  console.log(`✅ ${partnerSeeds.length} tiers et leurs contacts`);

  // --- 9. Devis -------------------------------------------------------------
  const quoteSeeds = [
    {
      partner: 'Studio Kanto',
      status: QuoteStatus.VALIDATED,
      monthsAgo: 0,
      validityDays: 30,
      lines: [
        ['ERP-START', 1],
        ['SRV-FORM', 1],
      ] as [string, number][],
    },
    {
      partner: 'Atelier Novak',
      status: QuoteStatus.SIGNED,
      monthsAgo: 1,
      validityDays: 30,
      lines: [
        ['ERP-BIZ', 1],
        ['MOD-CRM', 2],
      ] as [string, number][],
    },
    {
      partner: 'Boulangerie Lefèvre',
      status: QuoteStatus.DRAFT,
      monthsAgo: 0,
      validityDays: 45,
      lines: [
        ['MAT-IMPR', 2],
        ['CON-ETIQ', 6],
      ] as [string, number][],
    },
    {
      partner: 'Groupe Vartex',
      status: QuoteStatus.REFUSED,
      monthsAgo: 2,
      validityDays: 30,
      lines: [['ERP-BIZ', 3]] as [string, number][],
    },
  ];

  for (const seed of quoteSeeds) {
    const date = monthsBefore(seed.monthsAgo);
    const { lines, totals } = buildLines(products, seed.lines);
    const ref = await nextRef(company.id, DocumentType.QUOTE, date);

    await prisma.quote.create({
      data: {
        ref,
        companyId: company.id,
        partnerId: partners[seed.partner].id,
        createdById: userIds.commercial,
        status: seed.status,
        date,
        validUntil: daysFrom(date, seed.validityDays),
        createdAt: date,
        updatedAt: date,
        ...totals,
        lines: { create: lines },
      },
    });
  }
  console.log(`✅ ${quoteSeeds.length} devis`);

  // --- 10. Commandes, factures et règlements --------------------------------
  const orderSeeds = [
    {
      partner: 'Boulangerie Lefèvre',
      monthsAgo: 5,
      status: OrderStatus.BILLED,
      lines: [
        ['ERP-START', 2],
        ['SRV-FORM', 1],
      ] as [string, number][],
      invoice: 'PAID',
    },
    {
      partner: 'Atelier Novak',
      monthsAgo: 4,
      status: OrderStatus.BILLED,
      lines: [
        ['ERP-BIZ', 1],
        ['MOD-CRM', 2],
      ] as [string, number][],
      invoice: 'PAID',
    },
    {
      partner: 'Groupe Vartex',
      monthsAgo: 3,
      status: OrderStatus.BILLED,
      lines: [
        ['ERP-BIZ', 3],
        ['SRV-FORM', 1],
        ['SRV-SUP', 6],
      ] as [string, number][],
      invoice: 'PARTIAL',
    },
    {
      partner: 'Studio Kanto',
      monthsAgo: 2,
      status: OrderStatus.BILLED,
      lines: [
        ['MAT-TERM', 2],
        ['CON-ETIQ', 4],
      ] as [string, number][],
      invoice: 'OVERDUE',
      ship: true,
    },
    {
      partner: 'Boulangerie Lefèvre',
      monthsAgo: 1,
      status: OrderStatus.SHIPPED,
      lines: [
        ['MAT-IMPR', 1],
        ['CON-ETIQ', 8],
      ] as [string, number][],
      ship: true,
    },
    {
      partner: 'Groupe Vartex',
      monthsAgo: 0,
      status: OrderStatus.VALIDATED,
      lines: [
        ['ERP-BIZ', 2],
        ['SRV-FORM', 2],
      ] as [string, number][],
    },
    {
      partner: 'Atelier Novak',
      monthsAgo: 0,
      status: OrderStatus.DRAFT,
      lines: [['SRV-SUP', 3]] as [string, number][],
    },
  ];

  let invoiceCount = 0;
  let paymentCount = 0;

  for (const seed of orderSeeds) {
    const date = monthsBefore(seed.monthsAgo);
    const { lines, totals } = buildLines(products, seed.lines);
    const ref = await nextRef(company.id, DocumentType.ORDER, date);

    const order = await prisma.order.create({
      data: {
        ref,
        companyId: company.id,
        partnerId: partners[seed.partner].id,
        createdById: userIds.commercial,
        status: seed.status,
        date,
        createdAt: date,
        updatedAt: date,
        shippedAt: seed.ship ? daysFrom(date, 3) : null,
        ...totals,
        lines: { create: lines },
      },
    });

    // Une commande expédiée a bien sorti son stock.
    if (seed.ship) {
      for (const [sku, quantity] of seed.lines) {
        const product = products[sku];
        const stock = await prisma.stock.findUnique({
          where: {
            productId_warehouseId: {
              productId: product.id,
              warehouseId: mainWarehouse.id,
            },
          },
        });
        if (!stock) continue;

        const resulting = stock.quantity - quantity;
        await prisma.stock.update({
          where: { id: stock.id },
          data: { quantity: resulting },
        });
        await prisma.stockMovement.create({
          data: {
            companyId: company.id,
            createdById: userIds.commercial,
            productId: product.id,
            warehouseId: mainWarehouse.id,
            type: StockMovementType.OUT,
            quantity: -quantity,
            resultingQuantity: resulting,
            documentRef: order.ref,
            createdAt: daysFrom(date, 3),
          },
        });
      }
    }

    if (!seed.invoice) continue;

    const invoiceDate = daysFrom(date, 5);
    const invoiceRef = await nextRef(
      company.id,
      DocumentType.INVOICE,
      invoiceDate,
    );
    const dueDate = daysFrom(invoiceDate, 30);

    const paidAmount =
      seed.invoice === 'PAID'
        ? totals.totalTTC
        : seed.invoice === 'PARTIAL'
          ? round2(totals.totalTTC * 0.4)
          : 0;

    const status =
      seed.invoice === 'PAID'
        ? InvoiceStatus.PAID
        : seed.invoice === 'PARTIAL'
          ? InvoiceStatus.PARTIALLY_PAID
          : InvoiceStatus.UNPAID;

    const invoice = await prisma.invoice.create({
      data: {
        ref: invoiceRef,
        companyId: company.id,
        partnerId: partners[seed.partner].id,
        createdById: userIds.commercial,
        orderId: order.id,
        status,
        date: invoiceDate,
        // La facture « OVERDUE » a une échéance volontairement dépassée.
        dueDate:
          seed.invoice === 'OVERDUE' ? daysFrom(new Date(), -12) : dueDate,
        createdAt: invoiceDate,
        updatedAt: invoiceDate,
        paidAmount,
        ...totals,
        lines: { create: lines },
      },
    });
    invoiceCount++;

    if (paidAmount > 0) {
      await prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          createdById: userIds.admin,
          amount: paidAmount,
          method: PaymentMethod.TRANSFER,
          date: daysFrom(invoiceDate, 12),
          reference: `VIR-${invoice.ref}`,
          createdAt: daysFrom(invoiceDate, 12),
        },
      });
      paymentCount++;
    }
  }
  console.log(
    `✅ ${orderSeeds.length} commandes, ${invoiceCount} factures, ${paymentCount} règlements`,
  );

  // --- 11. Commandes fournisseur -------------------------------------------
  const purchaseSeeds = [
    {
      supplier: 'Fournitures Bréval',
      monthsAgo: 2,
      status: PurchaseOrderStatus.RECEIVED,
      lines: [
        ['CON-ETIQ', 40],
        ['MAT-IMPR', 4],
      ] as [string, number][],
    },
    {
      supplier: 'Nordic Hardware AB',
      monthsAgo: 0,
      status: PurchaseOrderStatus.ORDERED,
      lines: [['MAT-TERM', 10]] as [string, number][],
    },
    {
      supplier: 'Fournitures Bréval',
      monthsAgo: 0,
      status: PurchaseOrderStatus.DRAFT,
      lines: [['CON-ETIQ', 25]] as [string, number][],
    },
  ];

  for (const seed of purchaseSeeds) {
    const date = monthsBefore(seed.monthsAgo);
    const { lines, totals } = buildLines(products, seed.lines, {
      useCostPrice: true,
    });
    const ref = await nextRef(company.id, DocumentType.PURCHASE_ORDER, date);

    await prisma.purchaseOrder.create({
      data: {
        ref,
        companyId: company.id,
        supplierId: partners[seed.supplier].id,
        createdById: userIds.admin,
        warehouseId: mainWarehouse.id,
        status: seed.status,
        date,
        expectedDate: daysFrom(date, 14),
        receivedAt:
          seed.status === PurchaseOrderStatus.RECEIVED
            ? daysFrom(date, 10)
            : null,
        createdAt: date,
        updatedAt: date,
        ...totals,
        lines: { create: lines },
      },
    });
  }
  console.log(`✅ ${purchaseSeeds.length} commandes fournisseur`);

  // --- 12. Pistes -----------------------------------------------------------
  const leadSeeds = [
    {
      name: 'Refonte parc logiciel',
      companyName: 'Menuiserie Ravel',
      contactName: 'Julien Ravel',
      email: 'j.ravel@ravel-bois.fr',
      phone: '02 99 31 44 08',
      source: 'Site web',
      status: LeadStatus.NEW,
      estimatedValue: 4200,
    },
    {
      name: 'Migration depuis Excel',
      companyName: 'Cabinet Aurel',
      contactName: 'Sofia Aurel',
      email: 's.aurel@cabinet-aurel.fr',
      source: 'Recommandation',
      status: LeadStatus.CONTACTED,
      estimatedValue: 2800,
    },
    {
      name: 'Déploiement 3 agences',
      companyName: 'Transports Merci',
      contactName: 'Paul Merci',
      email: 'p.merci@merci-transport.fr',
      phone: '04 91 20 87 33',
      source: 'Salon',
      status: LeadStatus.QUALIFIED,
      estimatedValue: 11500,
    },
    {
      name: 'Besoin CRM simple',
      companyName: 'Fleuriste Iris',
      contactName: 'Nina Iris',
      email: 'bonjour@iris-fleurs.fr',
      source: 'Appel entrant',
      status: LeadStatus.CONTACTED,
      estimatedValue: 1200,
    },
    {
      name: 'Audit process achats',
      companyName: 'Vartex Industrie',
      contactName: 'Hugo Lemoine',
      email: 'h.lemoine@vartex.com',
      source: 'Salon',
      status: LeadStatus.UNQUALIFIED,
      estimatedValue: 0,
    },
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

  // --- 13. Opportunités -----------------------------------------------------
  const opportunitySeeds = [
    {
      name: 'Transports Merci — 3 agences',
      stage: OpportunityStage.NEGOTIATION,
      amount: 11500,
      probability: 70,
      partner: 'Groupe Vartex',
      lead: 2,
      inDays: 21,
    },
    {
      name: 'Boulangerie Lefèvre — renouvellement',
      stage: OpportunityStage.PROPOSAL,
      amount: 1780,
      probability: 40,
      partner: 'Boulangerie Lefèvre',
      inDays: 14,
    },
    {
      name: 'Studio Kanto — module CRM',
      stage: OpportunityStage.QUALIFICATION,
      amount: 840,
      probability: 10,
      partner: 'Studio Kanto',
      inDays: 45,
    },
    {
      name: 'Atelier Novak — extension',
      stage: OpportunityStage.PROPOSAL,
      amount: 2340,
      probability: 40,
      partner: 'Atelier Novak',
      inDays: 30,
    },
    {
      name: 'Groupe Vartex — support premium',
      stage: OpportunityStage.WON,
      amount: 2880,
      probability: 100,
      partner: 'Groupe Vartex',
      inDays: -10,
    },
    {
      name: 'Cabinet Aurel — pack starter',
      stage: OpportunityStage.LOST,
      amount: 490,
      probability: 0,
      partner: 'Atelier Novak',
      inDays: -25,
      lostReason: 'Budget reporté à l’exercice suivant',
    },
  ];
  const opportunities: { id: number }[] = [];
  for (const seed of opportunitySeeds) {
    const closed =
      seed.stage === OpportunityStage.WON ||
      seed.stage === OpportunityStage.LOST;
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
          expectedCloseDate: daysFrom(new Date(), seed.inDays),
          closedAt: closed ? daysFrom(new Date(), seed.inDays) : null,
          lostReason: seed.lostReason ?? null,
        },
      }),
    );
  }
  console.log(`✅ ${opportunities.length} opportunités`);

  // --- 14. Activités --------------------------------------------------------
  const activitySeeds = [
    {
      subject: 'Rappeler Julien Ravel',
      type: ActivityType.CALL,
      status: ActivityStatus.PLANNED,
      inDays: 1,
      lead: 0,
    },
    {
      subject: 'Envoyer la proposition commerciale',
      type: ActivityType.EMAIL,
      status: ActivityStatus.PLANNED,
      inDays: 2,
      opportunity: 1,
    },
    {
      subject: 'Réunion de cadrage — 3 agences',
      type: ActivityType.MEETING,
      status: ActivityStatus.PLANNED,
      inDays: 5,
      opportunity: 0,
    },
    {
      subject: 'Relance devis Studio Kanto',
      type: ActivityType.TASK,
      status: ActivityStatus.PLANNED,
      inDays: -3,
      opportunity: 2,
    },
    {
      subject: 'Compte rendu du salon',
      type: ActivityType.NOTE,
      status: ActivityStatus.DONE,
      inDays: -12,
      lead: 2,
    },
    {
      subject: 'Signature du contrat Vartex',
      type: ActivityType.TASK,
      status: ActivityStatus.DONE,
      inDays: -10,
      opportunity: 4,
    },
    {
      subject: 'Point trimestriel client',
      type: ActivityType.MEETING,
      status: ActivityStatus.PLANNED,
      inDays: 9,
      partner: 'Boulangerie Lefèvre',
    },
  ];
  for (const seed of activitySeeds) {
    await prisma.activity.create({
      data: {
        companyId: company.id,
        subject: seed.subject,
        type: seed.type,
        status: seed.status,
        dueDate: daysFrom(new Date(), seed.inDays),
        completedAt:
          seed.status === ActivityStatus.DONE
            ? daysFrom(new Date(), seed.inDays)
            : null,
        ownerId: userIds.commercial,
        leadId: seed.lead !== undefined ? leads[seed.lead].id : null,
        opportunityId:
          seed.opportunity !== undefined
            ? opportunities[seed.opportunity].id
            : null,
        partnerId: seed.partner ? partners[seed.partner].id : null,
      },
    });
  }
  console.log(`✅ ${activitySeeds.length} activités`);

  // --- 14. Ressources humaines ---------------------------------------------
  // Les trois comptes de démo ont leur fiche salarié ; deux collègues
  // supplémentaires n'ont pas d'accès applicatif (cas courant en PME).
  const employeeSeeds = [
    {
      key: 'alice',
      firstName: 'Alice',
      lastName: 'Martin',
      email: 'admin@demo.com',
      position: 'Directrice générale',
      department: 'Direction',
      username: 'admin',
      monthsHired: 48,
      paidLeaveBalance: 25,
    },
    {
      key: 'karim',
      firstName: 'Karim',
      lastName: 'Benali',
      email: 'commercial@demo.com',
      position: 'Responsable commercial',
      department: 'Ventes',
      username: 'commercial',
      monthsHired: 30,
      paidLeaveBalance: 18,
    },
    {
      key: 'chloe',
      firstName: 'Chloé',
      lastName: 'Dubois',
      email: 'lecteur@demo.com',
      position: 'Comptable',
      department: 'Administration',
      username: 'lecteur',
      monthsHired: 20,
      paidLeaveBalance: 22,
    },
    {
      key: 'julien',
      firstName: 'Julien',
      lastName: 'Faure',
      email: 'j.faure@democorp.fr',
      position: 'Développeur',
      department: 'Production',
      username: null,
      monthsHired: 14,
      paidLeaveBalance: 24,
    },
    {
      key: 'sophie',
      firstName: 'Sophie',
      lastName: 'Nguyen',
      email: 's.nguyen@democorp.fr',
      position: 'Cheffe de projet',
      department: 'Production',
      username: null,
      monthsHired: 9,
      paidLeaveBalance: 25,
    },
  ];

  const employees: Record<string, { id: number }> = {};
  for (const seed of employeeSeeds) {
    const hireDate = monthsBefore(seed.monthsHired);
    const employee = await prisma.employee.create({
      data: {
        companyId: company.id,
        firstName: seed.firstName,
        lastName: seed.lastName,
        email: seed.email,
        position: seed.position,
        department: seed.department,
        hireDate,
        paidLeaveBalance: seed.paidLeaveBalance,
        userId: seed.username ? userIds[seed.username] : null,
      },
    });
    employees[seed.key] = employee;
  }
  console.log(`✅ ${employeeSeeds.length} employés`);

  // Congés : un mix de types et de statuts, avec le nombre de jours ouvrés
  // calculé comme le fait le service (jours fériés français exclus).
  const leaveSeeds = [
    {
      employee: 'karim',
      type: LeaveType.PAID,
      status: LeaveStatus.APPROVED,
      start: daysFrom(new Date(), -30),
      end: daysFrom(new Date(), -24),
      reason: 'Congés d’été',
      decided: 'admin',
    },
    {
      employee: 'julien',
      type: LeaveType.RTT,
      status: LeaveStatus.APPROVED,
      start: daysFrom(new Date(), -10),
      end: daysFrom(new Date(), -10),
      reason: 'RTT',
      decided: 'admin',
    },
    {
      employee: 'sophie',
      type: LeaveType.PAID,
      status: LeaveStatus.PENDING,
      start: daysFrom(new Date(), 20),
      end: daysFrom(new Date(), 31),
      reason: 'Vacances scolaires',
      decided: null,
    },
    {
      employee: 'chloe',
      type: LeaveType.SICK,
      status: LeaveStatus.APPROVED,
      start: daysFrom(new Date(), -5),
      end: daysFrom(new Date(), -3),
      reason: 'Arrêt maladie',
      decided: 'admin',
    },
  ];

  for (const seed of leaveSeeds) {
    const decided = seed.status !== LeaveStatus.PENDING;
    await prisma.leaveRequest.create({
      data: {
        employeeId: employees[seed.employee].id,
        type: seed.type,
        status: seed.status,
        startDate: seed.start,
        endDate: seed.end,
        days: countWorkingDays(seed.start, seed.end),
        reason: seed.reason,
        decidedById: decided && seed.decided ? userIds[seed.decided] : null,
        decidedAt: decided ? daysFrom(seed.start, -3) : null,
      },
    });
  }
  console.log(`✅ ${leaveSeeds.length} demandes de congé`);

  // Notes de frais : totaux HT / TVA / TTC calculés par les helpers du domaine.
  const year = new Date().getFullYear();
  let expenseCounter = 0;
  const expenseSeeds = [
    {
      employee: 'karim',
      status: ExpenseStatus.SUBMITTED,
      monthsAgo: 1,
      notes: 'Salon professionnel + déplacements clients',
      decided: null,
      lines: [
        {
          category: ExpenseCategory.TRAVEL,
          description: 'Billet de train Paris–Lyon',
          amountHT: 92,
          vatRate: 10,
        },
        {
          category: ExpenseCategory.ACCOMMODATION,
          description: 'Hôtel 2 nuits',
          amountHT: 210,
          vatRate: 10,
        },
        {
          category: ExpenseCategory.MEAL,
          description: 'Repas clients',
          amountHT: 68,
          vatRate: 10,
        },
      ],
    },
    {
      employee: 'julien',
      status: ExpenseStatus.REIMBURSED,
      monthsAgo: 2,
      notes: 'Matériel et fournitures',
      decided: 'admin',
      lines: [
        {
          category: ExpenseCategory.SUPPLIES,
          description: 'Adaptateurs et câbles',
          amountHT: 45,
          vatRate: 20,
        },
        {
          category: ExpenseCategory.MEAL,
          description: 'Déjeuner équipe',
          amountHT: 54,
          vatRate: 10,
        },
      ],
    },
  ];

  for (const seed of expenseSeeds) {
    expenseCounter += 1;
    const ref = `NF${year}-${String(expenseCounter).padStart(4, '0')}`;
    const period = monthsBefore(seed.monthsAgo);
    period.setDate(1);
    const lineTotals = seed.lines.map((line) => computeExpenseLine(line));
    const totals = sumExpenseLines(lineTotals);
    // Seules les notes remboursées portent une décision dans ce jeu de démo.
    const decided = seed.status === ExpenseStatus.REIMBURSED;

    await prisma.expenseReport.create({
      data: {
        companyId: company.id,
        employeeId: employees[seed.employee].id,
        ref,
        status: seed.status,
        period,
        notes: seed.notes,
        totalHT: totals.totalHT,
        totalVat: totals.totalVat,
        totalTTC: totals.totalTTC,
        decidedById: decided && seed.decided ? userIds[seed.decided] : null,
        decidedAt: decided ? daysFrom(period, 25) : null,
        lines: {
          create: seed.lines.map((line, index) => ({
            category: line.category,
            date: daysFrom(period, index * 3 + 2),
            description: line.description,
            amountHT: lineTotals[index].amountHT,
            vatRate: line.vatRate,
            amountVat: lineTotals[index].amountVat,
            amountTTC: lineTotals[index].amountTTC,
          })),
        },
      },
    });
  }
  console.log(`✅ ${expenseSeeds.length} notes de frais`);

  // --- 15. Projets ----------------------------------------------------------
  // Chaque projet porte ses tâches et des temps saisis, dont certains sont
  // refacturables au client : de quoi alimenter le suivi et une future
  // facturation au temps passé.
  let projectCounter = 0;
  const projectSeeds = [
    {
      name: 'Refonte du site vitrine',
      status: ProjectStatus.ACTIVE,
      partner: 'Studio Kanto',
      owner: 'admin',
      description: 'Nouveau site et intégration au CRM.',
      monthsAgo: 2,
      budgetHours: 120,
      hourlyRate: 85,
      tasks: [
        { name: 'Cadrage et maquettes', status: TaskStatus.DONE, estimated: 24, assignee: 'admin' },
        { name: 'Intégration front', status: TaskStatus.IN_PROGRESS, estimated: 48, assignee: 'commercial' },
        { name: 'Recette et mise en ligne', status: TaskStatus.TODO, estimated: 16, assignee: null },
      ],
      time: [
        { task: 0, user: 'admin', hours: 18, billable: true, description: 'Ateliers de cadrage' },
        { task: 1, user: 'commercial', hours: 22, billable: true, description: 'Intégration des pages' },
        { task: 1, user: 'admin', hours: 4, billable: false, description: 'Revue interne' },
      ],
    },
    {
      name: 'Déploiement ERP — Groupe Vartex',
      status: ProjectStatus.ACTIVE,
      partner: 'Groupe Vartex',
      owner: 'commercial',
      description: 'Paramétrage multi-entrepôt et reprise de données.',
      monthsAgo: 1,
      budgetHours: 200,
      hourlyRate: 95,
      tasks: [
        { name: 'Reprise des données', status: TaskStatus.IN_PROGRESS, estimated: 60, assignee: 'admin' },
        { name: 'Formation des utilisateurs', status: TaskStatus.TODO, estimated: 24, assignee: 'commercial' },
      ],
      time: [
        { task: 0, user: 'admin', hours: 26, billable: true, description: 'Import du catalogue et des tiers' },
        { task: 0, user: 'commercial', hours: 12, billable: true, description: 'Contrôles de cohérence' },
      ],
    },
    {
      name: 'R&D — module de reporting',
      status: ProjectStatus.ON_HOLD,
      partner: null,
      owner: 'admin',
      description: 'Prototype interne, non refacturable.',
      monthsAgo: 3,
      budgetHours: 80,
      hourlyRate: 0,
      tasks: [
        { name: 'État de l’art', status: TaskStatus.DONE, estimated: 12, assignee: 'admin' },
        { name: 'Prototype', status: TaskStatus.TODO, estimated: 40, assignee: null },
      ],
      time: [
        { task: 0, user: 'admin', hours: 9, billable: false, description: 'Veille et benchmark' },
      ],
    },
  ];

  let taskTotal = 0;
  let timeTotal = 0;
  for (const seed of projectSeeds) {
    projectCounter += 1;
    const ref = `PR-${String(projectCounter).padStart(4, '0')}`;
    const startDate = monthsBefore(seed.monthsAgo);
    const project = await prisma.project.create({
      data: {
        companyId: company.id,
        ref,
        name: seed.name,
        status: seed.status,
        description: seed.description,
        startDate,
        budgetHours: seed.budgetHours,
        hourlyRate: seed.hourlyRate,
        partnerId: seed.partner ? partners[seed.partner].id : null,
        ownerId: userIds[seed.owner],
      },
    });

    const taskIds: number[] = [];
    for (const [position, task] of seed.tasks.entries()) {
      const created = await prisma.task.create({
        data: {
          projectId: project.id,
          name: task.name,
          status: task.status,
          estimatedHours: task.estimated,
          position,
          assigneeId: task.assignee ? userIds[task.assignee] : null,
        },
      });
      taskIds.push(created.id);
      taskTotal += 1;
    }

    for (const entry of seed.time) {
      await prisma.timeEntry.create({
        data: {
          projectId: project.id,
          taskId: taskIds[entry.task] ?? null,
          userId: userIds[entry.user],
          date: daysFrom(startDate, entry.task * 5 + 3),
          hours: entry.hours,
          billable: entry.billable,
          description: entry.description,
        },
      });
      timeTotal += 1;
    }
  }
  console.log(
    `✅ ${projectSeeds.length} projets, ${taskTotal} tâches, ${timeTotal} temps saisis`,
  );

  console.log('\n🌱 Seed terminé.\n');
  printCredentials(users);
}

/** Valorise des lignes « [référence, quantité] » avec les helpers du domaine. */
function buildLines(
  products: Record<
    string,
    {
      id: number;
      price: number;
      costPrice: number;
      vatRate: number;
      name: string;
    }
  >,
  entries: [string, number][],
  { useCostPrice = false }: { useCostPrice?: boolean } = {},
) {
  const lines = entries.map(([sku, quantity], position) => {
    const product = products[sku];
    const unitPrice = useCostPrice ? product.costPrice : product.price;
    const priced = {
      quantity,
      unitPrice,
      discountPercent: 0,
      vatRate: product.vatRate,
    };

    return {
      position,
      productId: product.id,
      label: product.name,
      ...priced,
      ...computeLineTotals(priced),
    };
  });

  const totals = computeDocumentTotals(lines);

  return {
    lines,
    totals: {
      totalHT: totals.totalHT,
      totalVat: totals.totalVat,
      totalTTC: totals.totalTTC,
      // Jeu de démonstration en devise société : le taux vaut 1 et les
      // montants convertis sont égaux aux totaux. Sans eux, la balance âgée
      // et l'export FEC ressortiraient à zéro.
      currency: 'EUR',
      exchangeRate: 1,
      baseTotalHT: totals.totalHT,
      baseTotalTTC: totals.totalTTC,
    },
  };
}

/**
 * Préfixes des références, alignés sur `NumberingService`.
 *
 * Le type `Record<DocumentType, string>` est ce qui compte : il oblige à
 * compléter la table à chaque nouveau type de document. Sans lui, `AV` avait
 * été oublié et un avoir se serait numéroté « undefined2026-0001 ».
 */
const SEED_PREFIX: Record<DocumentType, string> = {
  QUOTE: 'DE',
  ORDER: 'CO',
  INVOICE: 'FA',
  CREDIT_NOTE: 'AV',
  PURCHASE_ORDER: 'CF',
};

/** Même logique de numérotation que NumberingService, réutilisée hors Nest. */
async function nextRef(companyId: number, type: DocumentType, at: Date) {
  const prefix = SEED_PREFIX[type];
  const year = at.getFullYear();

  const counter = await prisma.documentCounter.upsert({
    where: { companyId_type_year: { companyId, type, year } },
    update: { value: { increment: 1 } },
    create: { companyId, type, year, value: 1 },
  });

  return `${prefix}${year}-${String(counter.value).padStart(4, '0')}`;
}

function printCredentials(
  users: { email: string; password: string; role: string }[],
) {
  console.log('Comptes de démonstration :');
  for (const user of users) {
    console.log(
      `  • ${user.email.padEnd(22)} / ${user.password.padEnd(10)} (${user.role})`,
    );
  }
  console.log('');
}

function round2(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function daysFrom(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
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
