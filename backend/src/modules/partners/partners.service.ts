import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';

@Injectable()
export class PartnersService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreatePartnerDto) {
    if (!data.companyId) {
      throw new BadRequestException(
        'companyId est requis pour créer un partenaire',
      );
    }

    return this.prisma.partner.create({ data });
  }

  async findAll(companyId: number) {
    if (!companyId) {
      throw new BadRequestException(
        'companyId est requis pour récupérer les partenaires',
      );
    }

    return this.prisma.partner.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const partner = await this.prisma.partner.findUnique({ where: { id } });
    if (!partner) throw new NotFoundException('Partenaire introuvable');
    return partner;
  }

  async update(id: number, data: UpdatePartnerDto) {
    const partner = await this.prisma.partner.findUnique({ where: { id } });
    if (!partner) throw new NotFoundException('Partenaire introuvable');

    return this.prisma.partner.update({ where: { id }, data });
  }

  async remove(id: number) {
    const partner = await this.prisma.partner.findUnique({ where: { id } });
    if (!partner) throw new NotFoundException('Partenaire introuvable');

    await this.prisma.partner.delete({ where: { id } });
    return { message: `Partenaire ${id} supprimé avec succès` };
  }
}
