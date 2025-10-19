import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserCompanyService {
  constructor(private prisma: PrismaService) {}

  async addUserToCompany(
    userId: number,
    companyId: number,
    roleId?: number,
    isDefault = false,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    if (!company) throw new NotFoundException('Entreprise introuvable');

    const existingLink = await this.prisma.userCompany.findUnique({
      where: { userId_companyId: { userId, companyId } },
    });
    if (existingLink)
      throw new BadRequestException(
        'L’utilisateur est déjà dans cette entreprise',
      );

    return this.prisma.userCompany.create({
      data: {
        user: { connect: { id: userId } },
        company: { connect: { id: companyId } },
        role: roleId ? { connect: { id: roleId } } : undefined,
        isDefault,
      },
      include: { user: true, company: true, role: true },
    });
  }

  async updateUserRole(userId: number, companyId: number, roleId: number) {
    const link = await this.prisma.userCompany.findUnique({
      where: { userId_companyId: { userId, companyId } },
    });
    if (!link)
      throw new NotFoundException('Lien utilisateur-entreprise introuvable');

    return this.prisma.userCompany.update({
      where: { userId_companyId: { userId, companyId } },
      data: { roleId },
      include: { user: true, company: true, role: true },
    });
  }

  async getUsersByCompany(companyId: number) {
    return this.prisma.userCompany.findMany({
      where: { companyId },
      include: { user: true, role: true },
    });
  }

  async setDefaultCompany(userId: number, companyId: number) {
    await this.prisma.userCompany.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
    return this.prisma.userCompany.update({
      where: { userId_companyId: { userId, companyId } },
      data: { isDefault: true },
      include: { company: true },
    });
  }
}
