import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async create(name: string, code: string) {
    return this.prisma.company.create({
      data: { name, code },
    });
  }

  async findAll() {
    return this.prisma.company.findMany({
      include: { users: true, roles: true },
    });
  }

  async findOne(id: number) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: { users: { include: { user: true, role: true } } },
    });
    if (!company) throw new NotFoundException('Entreprise introuvable');
    return company;
  }
}
