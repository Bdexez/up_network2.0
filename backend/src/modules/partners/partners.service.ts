import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { paginate, type PageParams } from 'src/common/pagination/paginate';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';

@Injectable()
export class PartnersService {
  constructor(private prisma: PrismaService) {}

  create(companyId: number, data: CreatePartnerDto) {
    return this.prisma.partner.create({ data: { ...data, companyId } });
  }

  findAll(companyId: number, filters: { search?: string } & PageParams) {
    const where = this.buildWhere(companyId, filters.search);

    return paginate(filters, (skip, take) =>
      this.prisma.$transaction([
        this.prisma.partner.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: {
                orders: true,
                quotes: true,
                invoices: true,
                opportunities: true,
              },
            },
          },
          skip,
          take,
        }),
        this.prisma.partner.count({ where }),
      ]),
    );
  }

  /**
   * Liste allégée pour les sélecteurs de formulaire : pas de pagination, mais
   * seulement l'identité. Une liste paginée y tronquerait silencieusement les
   * choix possibles.
   */
  findOptions(companyId: number, type?: 'CUSTOMER' | 'SUPPLIER') {
    const where: Prisma.PartnerWhereInput = { companyId, isActive: true };

    // « BOTH » est à la fois client et fournisseur : il figure dans les deux listes.
    if (type === 'CUSTOMER') where.type = { in: ['CUSTOMER', 'BOTH'] };
    if (type === 'SUPPLIER') where.type = { in: ['SUPPLIER', 'BOTH'] };

    return this.prisma.partner.findMany({
      where,
      select: { id: true, name: true, type: true },
      orderBy: { name: 'asc' },
    });
  }

  private buildWhere(
    companyId: number,
    search?: string,
  ): Prisma.PartnerWhereInput {
    const where: Prisma.PartnerWhereInput = { companyId };

    if (search?.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { city: { contains: q, mode: 'insensitive' } },
        { vatNumber: { contains: q, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  async findOne(companyId: number, id: number) {
    const partner = await this.prisma.partner.findFirst({
      where: { id, companyId },
      include: {
        contacts: { orderBy: [{ isPrimary: 'desc' }, { lastName: 'asc' }] },
        quotes: { orderBy: { createdAt: 'desc' }, take: 10 },
        orders: { orderBy: { createdAt: 'desc' }, take: 10 },
        invoices: { orderBy: { createdAt: 'desc' }, take: 10 },
        opportunities: { orderBy: { createdAt: 'desc' }, take: 10 },
        activities: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!partner) throw new NotFoundException('Client introuvable');
    return partner;
  }

  async update(companyId: number, id: number, data: UpdatePartnerDto) {
    await this.assertExists(companyId, id);
    return this.prisma.partner.update({ where: { id }, data });
  }

  async remove(companyId: number, id: number) {
    await this.assertExists(companyId, id);

    const ordersCount = await this.prisma.order.count({
      where: { partnerId: id },
    });
    if (ordersCount > 0) {
      // On archive plutôt que de casser l'historique des commandes.
      await this.prisma.partner.update({
        where: { id },
        data: { isActive: false },
      });
      return {
        message: `Client ${id} archivé (${ordersCount} commande(s) liée(s))`,
        archived: true,
      };
    }

    await this.prisma.partner.delete({ where: { id } });
    return { message: `Client ${id} supprimé`, archived: false };
  }

  private async assertExists(companyId: number, id: number) {
    const found = await this.prisma.partner.findFirst({
      where: { id, companyId },
      select: { id: true },
    });
    if (!found) throw new NotFoundException('Client introuvable');
  }
}
