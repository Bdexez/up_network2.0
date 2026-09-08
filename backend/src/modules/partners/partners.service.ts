import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';

@Injectable()
export class PartnersService {
  constructor(private prisma: PrismaService) {}

  create(companyId: number, data: CreatePartnerDto) {
    return this.prisma.partner.create({ data: { ...data, companyId } });
  }

  findAll(companyId: number, search?: string) {
    const where: Prisma.PartnerWhereInput = { companyId };

    if (search?.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { city: { contains: q, mode: 'insensitive' } },
      ];
    }

    return this.prisma.partner.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { orders: true, opportunities: true } } },
    });
  }

  async findOne(companyId: number, id: number) {
    const partner = await this.prisma.partner.findFirst({
      where: { id, companyId },
      include: {
        orders: { orderBy: { createdAt: 'desc' }, take: 10 },
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
