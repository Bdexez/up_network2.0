import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  /** Uniquement les sociétés auxquelles l'utilisateur est rattaché. */
  async findMine(userId: number) {
    const links = await this.prisma.userCompany.findMany({
      where: { userId },
      include: {
        company: true,
        role: { select: { id: true, name: true } },
      },
      orderBy: { assignedAt: 'asc' },
    });

    return links.map((link) => ({
      ...link.company,
      role: link.role,
      isDefault: link.isDefault,
    }));
  }

  /** Fiche de la société active, avec ses compteurs. */
  async findActive(companyId: number) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        _count: {
          select: {
            users: true,
            roles: true,
            partners: true,
            products: true,
            orders: true,
            leads: true,
            opportunities: true,
          },
        },
      },
    });
    if (!company) throw new NotFoundException('Société introuvable');
    return company;
  }

  async update(companyId: number, data: UpdateCompanyDto) {
    await this.findActive(companyId);
    return this.prisma.company.update({ where: { id: companyId }, data });
  }
}
