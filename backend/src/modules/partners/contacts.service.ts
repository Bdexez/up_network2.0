import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateContactDto, UpdateContactDto } from './dto/contact.dto';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: number, partnerId: number) {
    await this.assertPartner(companyId, partnerId);
    return this.prisma.contact.findMany({
      where: { partnerId },
      orderBy: [{ isPrimary: 'desc' }, { lastName: 'asc' }],
    });
  }

  async create(companyId: number, partnerId: number, dto: CreateContactDto) {
    await this.assertPartner(companyId, partnerId);

    return this.prisma.$transaction(async (tx) => {
      // Un seul contact principal par tiers.
      if (dto.isPrimary) {
        await tx.contact.updateMany({
          where: { partnerId },
          data: { isPrimary: false },
        });
      }

      const isFirst = (await tx.contact.count({ where: { partnerId } })) === 0;

      return tx.contact.create({
        data: { ...dto, partnerId, isPrimary: dto.isPrimary ?? isFirst },
      });
    });
  }

  async update(
    companyId: number,
    partnerId: number,
    id: number,
    dto: UpdateContactDto,
  ) {
    await this.assertContact(companyId, partnerId, id);

    return this.prisma.$transaction(async (tx) => {
      if (dto.isPrimary) {
        await tx.contact.updateMany({
          where: { partnerId, id: { not: id } },
          data: { isPrimary: false },
        });
      }
      return tx.contact.update({ where: { id }, data: dto });
    });
  }

  async remove(companyId: number, partnerId: number, id: number) {
    await this.assertContact(companyId, partnerId, id);
    await this.prisma.contact.delete({ where: { id } });
    return { message: 'Contact supprimé' };
  }

  private async assertPartner(companyId: number, partnerId: number) {
    const partner = await this.prisma.partner.findFirst({
      where: { id: partnerId, companyId },
      select: { id: true },
    });
    if (!partner) throw new NotFoundException('Client introuvable');
  }

  private async assertContact(
    companyId: number,
    partnerId: number,
    id: number,
  ) {
    const contact = await this.prisma.contact.findFirst({
      where: { id, partnerId, partner: { companyId } },
      select: { id: true },
    });
    if (!contact) throw new NotFoundException('Contact introuvable');
  }
}
