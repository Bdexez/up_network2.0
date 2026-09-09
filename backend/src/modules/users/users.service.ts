import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { paginate, type PageParams } from 'src/common/pagination/paginate';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const USER_SELECT = {
  id: true,
  email: true,
  username: true,
  firstName: true,
  lastName: true,
  userType: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /** Crée un utilisateur et le rattache directement à la société active. */
  async create(companyId: number, data: CreateUserDto) {
    const [emailTaken, usernameTaken] = await Promise.all([
      this.prisma.user.findUnique({ where: { email: data.email } }),
      this.prisma.user.findUnique({ where: { username: data.username } }),
    ]);
    if (emailTaken) throw new ConflictException('Cet email est déjà utilisé');
    if (usernameTaken)
      throw new ConflictException("Ce nom d'utilisateur est déjà pris");

    await this.assertRole(companyId, data.roleId);

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        isActive: data.isActive ?? true,
        userCompanies: {
          create: { companyId, roleId: data.roleId, isDefault: true },
        },
      },
      select: USER_SELECT,
    });

    return this.findOne(companyId, user.id);
  }

  /** Ne liste que les membres de la société active. */
  async findAll(companyId: number, params: PageParams = {}) {
    const page = await paginate(params, (skip, take) =>
      this.prisma.$transaction([
        this.prisma.userCompany.findMany({
          where: { companyId },
          include: {
            user: { select: USER_SELECT },
            role: { select: { id: true, name: true } },
          },
          orderBy: { assignedAt: 'asc' },
          skip,
          take,
        }),
        this.prisma.userCompany.count({ where: { companyId } }),
      ]),
    );

    return {
      ...page,
      items: page.items.map((link) => ({ ...link.user, role: link.role })),
    };
  }

  async findOne(companyId: number, id: number) {
    const link = await this.prisma.userCompany.findUnique({
      where: { userId_companyId: { userId: id, companyId } },
      include: {
        user: { select: USER_SELECT },
        role: { select: { id: true, name: true } },
      },
    });
    if (!link) throw new NotFoundException('Utilisateur introuvable');
    return { ...link.user, role: link.role };
  }

  async update(companyId: number, id: number, data: UpdateUserDto) {
    await this.findOne(companyId, id);
    await this.assertRole(companyId, data.roleId);

    if (data.email) {
      const taken = await this.prisma.user.findFirst({
        where: { email: data.email, id: { not: id } },
        select: { id: true },
      });
      if (taken) throw new ConflictException('Cet email est déjà utilisé');
    }

    if (data.username) {
      const taken = await this.prisma.user.findFirst({
        where: { username: data.username, id: { not: id } },
        select: { id: true },
      });
      if (taken)
        throw new ConflictException("Ce nom d'utilisateur est déjà pris");
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: {
          email: data.email,
          username: data.username,
          firstName: data.firstName,
          lastName: data.lastName,
          isActive: data.isActive,
          ...(data.password
            ? { passwordHash: await bcrypt.hash(data.password, 10) }
            : {}),
        },
      });

      if (data.roleId !== undefined) {
        await tx.userCompany.update({
          where: { userId_companyId: { userId: id, companyId } },
          data: { roleId: data.roleId },
        });
      }
    });

    return this.findOne(companyId, id);
  }

  /**
   * Retire l'utilisateur de la société active. Le compte n'est supprimé
   * que s'il n'appartient plus à aucune société.
   */
  async remove(companyId: number, currentUserId: number, id: number) {
    if (id === currentUserId) {
      throw new BadRequestException(
        'Vous ne pouvez pas retirer votre propre compte',
      );
    }

    await this.findOne(companyId, id);

    await this.prisma.userCompany.delete({
      where: { userId_companyId: { userId: id, companyId } },
    });

    const remaining = await this.prisma.userCompany.count({
      where: { userId: id },
    });

    if (remaining === 0) {
      // Le compte signe des devis, des factures, des règlements, des
      // mouvements de stock, des saisies de temps… Plutôt que d'énumérer
      // chaque table — et d'en oublier une à la prochaine fonctionnalité —
      // on tente la suppression et on retombe sur la désactivation dès
      // qu'une écriture le référence encore : l'historique reste lisible.
      try {
        await this.prisma.user.delete({ where: { id } });
        return { message: `Utilisateur ${id} supprimé`, deleted: true };
      } catch (error) {
        if (!isForeignKeyViolation(error)) throw error;

        await this.prisma.user.update({
          where: { id },
          data: { isActive: false },
        });
        return {
          message: `Utilisateur ${id} désactivé : son compte reste rattaché à des documents`,
          deleted: false,
        };
      }
    }

    return {
      message: `Utilisateur ${id} retiré de la société`,
      deleted: false,
    };
  }

  private async assertRole(companyId: number, roleId?: number) {
    if (roleId === undefined) return;
    const role = await this.prisma.role.findFirst({
      where: { id: roleId, companyId },
      select: { id: true },
    });
    if (!role) {
      throw new NotFoundException("Ce rôle n'existe pas dans cette société");
    }
  }
}

/** P2003 : une clé étrangère empêche la suppression. */
function isForeignKeyViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2003'
  );
}
