import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: number, data: CreateRoleDto) {
    const existing = await this.prisma.role.findUnique({
      where: { name_companyId: { name: data.name, companyId } },
      select: { id: true },
    });
    if (existing) throw new ConflictException('Ce rôle existe déjà');

    await this.assertPermissionsExist(data.permissionIds);

    const role = await this.prisma.role.create({
      data: {
        name: data.name,
        description: data.description,
        companyId,
        permissions: {
          create: (data.permissionIds ?? []).map((permissionId) => ({
            permissionId,
            granted: true,
          })),
        },
      },
    });

    return this.findOne(companyId, role.id);
  }

  async findAll(companyId: number) {
    const roles = await this.prisma.role.findMany({
      where: { companyId },
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { userCompanies: true } },
      },
      orderBy: { name: 'asc' },
    });

    return roles.map((role) => this.serialize(role));
  }

  async findOne(companyId: number, id: number) {
    const role = await this.prisma.role.findFirst({
      where: { id, companyId },
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { userCompanies: true } },
      },
    });
    if (!role) throw new NotFoundException('Rôle introuvable');
    return this.serialize(role);
  }

  async update(companyId: number, id: number, data: UpdateRoleDto) {
    const role = await this.prisma.role.findFirst({
      where: { id, companyId },
    });
    if (!role) throw new NotFoundException('Rôle introuvable');

    // Retirer une permission au rôle Admin enfermerait la société dehors :
    // plus personne ne pourrait rouvrir l'écran des rôles pour la remettre.
    // Le libellé reste modifiable, le périmètre non.
    if (role.isSystemRole && data.permissionIds) {
      throw new BadRequestException(
        `« ${role.name} » est un rôle système : ses permissions ne peuvent pas être modifiées. Créez un rôle dédié pour un périmètre restreint.`,
      );
    }

    if (data.name && data.name !== role.name) {
      const taken = await this.prisma.role.findUnique({
        where: { name_companyId: { name: data.name, companyId } },
        select: { id: true },
      });
      if (taken) throw new ConflictException('Ce nom de rôle est déjà pris');
    }

    await this.assertPermissionsExist(data.permissionIds);

    await this.prisma.$transaction(async (tx) => {
      await tx.role.update({
        where: { id },
        data: { name: data.name, description: data.description },
      });

      // La liste envoyée remplace intégralement les permissions du rôle.
      if (data.permissionIds) {
        await tx.rolePermission.deleteMany({ where: { roleId: id } });
        if (data.permissionIds.length > 0) {
          await tx.rolePermission.createMany({
            data: data.permissionIds.map((permissionId) => ({
              roleId: id,
              permissionId,
              granted: true,
            })),
          });
        }
      }
    });

    return this.findOne(companyId, id);
  }

  async remove(companyId: number, id: number) {
    const role = await this.prisma.role.findFirst({
      where: { id, companyId },
      include: { _count: { select: { userCompanies: true } } },
    });
    if (!role) throw new NotFoundException('Rôle introuvable');

    if (role.isSystemRole) {
      throw new BadRequestException(
        'Un rôle système ne peut pas être supprimé',
      );
    }
    if (role._count.userCompanies > 0) {
      throw new ConflictException(
        `Ce rôle est attribué à ${role._count.userCompanies} utilisateur(s)`,
      );
    }

    await this.prisma.role.delete({ where: { id } });
    return { message: `Rôle ${id} supprimé` };
  }

  /** Catalogue global des permissions, groupé par module pour l'UI. */
  async listPermissions() {
    const permissions = await this.prisma.permission.findMany({
      orderBy: [
        { moduleName: 'asc' },
        { resourceName: 'asc' },
        { actionName: 'asc' },
      ],
    });

    const byModule = new Map<string, typeof permissions>();
    for (const permission of permissions) {
      const bucket = byModule.get(permission.moduleName) ?? [];
      bucket.push(permission);
      byModule.set(permission.moduleName, bucket);
    }

    return [...byModule.entries()].map(([moduleName, items]) => ({
      moduleName,
      permissions: items.map((p) => ({
        id: p.id,
        resourceName: p.resourceName,
        actionName: p.actionName,
        key: `${p.moduleName}.${p.resourceName}.${p.actionName}`,
        description: p.description,
      })),
    }));
  }

  // -------------------------------------------------------------------------

  private async assertPermissionsExist(ids?: number[]) {
    if (!ids || ids.length === 0) return;
    const count = await this.prisma.permission.count({
      where: { id: { in: ids } },
    });
    if (count !== ids.length) {
      throw new BadRequestException(
        'Une ou plusieurs permissions sont inconnues',
      );
    }
  }

  private serialize(role: {
    id: number;
    name: string;
    description: string | null;
    isSystemRole: boolean;
    createdAt: Date;
    permissions: {
      granted: boolean;
      permissionId: number;
      permission: {
        moduleName: string;
        resourceName: string;
        actionName: string;
      };
    }[];
    _count: { userCompanies: number };
  }) {
    const granted = role.permissions.filter((rp) => rp.granted);
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      isSystemRole: role.isSystemRole,
      createdAt: role.createdAt,
      userCount: role._count.userCompanies,
      permissionIds: granted.map((rp) => rp.permissionId),
      permissions: granted.map(
        (rp) =>
          `${rp.permission.moduleName}.${rp.permission.resourceName}.${rp.permission.actionName}`,
      ),
    };
  }
}
