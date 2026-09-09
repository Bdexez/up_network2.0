import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { JwtPayload } from 'src/common/types/authenticated-request';
import { RefreshTokenService } from './refresh-token.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private refreshTokens: RefreshTokenService,
  ) {}

  /**
   * Inscription. Deux parcours :
   *  - sans `companyCode` : on crée une société, un rôle Admin doté de toutes
   *    les permissions, et on y rattache l'utilisateur. C'est le parcours normal.
   *  - avec `companyCode` : on rattache l'utilisateur à une société existante,
   *    sans rôle. Un admin de cette société devra lui en donner un.
   */
  async register(dto: RegisterDto, userAgent?: string) {
    const [existingEmail, existingUsername] = await Promise.all([
      this.prisma.user.findUnique({ where: { email: dto.email } }),
      this.prisma.user.findUnique({ where: { username: dto.username } }),
    ]);

    if (existingEmail)
      throw new ConflictException('Cet email est déjà utilisé');
    if (existingUsername)
      throw new ConflictException("Ce nom d'utilisateur est déjà pris");

    let targetCompany: { id: number } | null = null;
    if (dto.companyCode) {
      targetCompany = await this.prisma.company.findUnique({
        where: { code: dto.companyCode.toUpperCase() },
        select: { id: true },
      });
      if (!targetCompany) {
        throw new NotFoundException('Code société inconnu');
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const { user, companyId, roleId } = await this.prisma.$transaction(
      async (tx) => {
        const createdUser = await tx.user.create({
          data: {
            email: dto.email,
            username: dto.username,
            passwordHash,
            firstName: dto.firstName,
            lastName: dto.lastName,
            userType: 'internal',
            isActive: true,
          },
        });

        // Rattachement à une société existante : aucun rôle par défaut.
        if (targetCompany) {
          const link = await tx.userCompany.create({
            data: {
              userId: createdUser.id,
              companyId: targetCompany.id,
              isDefault: true,
            },
          });
          return {
            user: createdUser,
            companyId: link.companyId,
            roleId: null as number | null,
          };
        }

        // Nouvelle société + rôle Admin complet.
        const company = await tx.company.create({
          data: {
            name: dto.companyName?.trim() || `${dto.username} SARL`,
            code: await this.generateCompanyCode(
              tx,
              dto.companyName ?? dto.username,
            ),
          },
        });

        const adminRole = await tx.role.create({
          data: {
            name: 'Admin',
            description: 'Accès complet à la société',
            companyId: company.id,
            isSystemRole: true,
          },
        });

        const permissions = await tx.permission.findMany({
          select: { id: true },
        });
        if (permissions.length > 0) {
          await tx.rolePermission.createMany({
            data: permissions.map((p) => ({
              roleId: adminRole.id,
              permissionId: p.id,
              granted: true,
            })),
          });
        }

        await tx.userCompany.create({
          data: {
            userId: createdUser.id,
            companyId: company.id,
            roleId: adminRole.id,
            isDefault: true,
          },
        });

        return {
          user: createdUser,
          companyId: company.id,
          roleId: adminRole.id as number | null,
        };
      },
    );

    return this.buildSession(
      user.id,
      user.email,
      user.username,
      companyId,
      roleId,
      userAgent,
    );
  }

  async login(dto: LoginDto, userAgent?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Message identique dans les deux cas : on n'indique pas si l'email existe.
    if (!user) throw new UnauthorizedException('Identifiants invalides');
    if (!user.isActive) throw new UnauthorizedException('Compte désactivé');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Identifiants invalides');

    const link = await this.resolveDefaultCompany(user.id);

    return this.buildSession(
      user.id,
      user.email,
      user.username,
      link.companyId,
      link.roleId,
      userAgent,
    );
  }

  /** Change la société active et renvoie un nouveau jeton. */
  async switchCompany(userId: number, companyId: number) {
    const link = await this.prisma.userCompany.findUnique({
      where: { userId_companyId: { userId, companyId } },
      include: { user: true },
    });

    if (!link) {
      throw new ForbiddenException("Vous n'appartenez pas à cette société");
    }

    await this.prisma.$transaction([
      this.prisma.userCompany.updateMany({
        where: { userId },
        data: { isDefault: false },
      }),
      this.prisma.userCompany.update({
        where: { id: link.id },
        data: { isDefault: true },
      }),
    ]);

    return this.buildSession(
      userId,
      link.user.email,
      link.user.username,
      companyId,
      link.roleId,
    );
  }

  /** Profil complet : société active, sociétés accessibles, permissions. */
  async getProfile(userId: number, companyId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        userType: true,
        isActive: true,
        createdAt: true,
        userCompanies: {
          include: {
            company: true,
            role: {
              include: { permissions: { include: { permission: true } } },
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundException('Utilisateur introuvable');

    const active = user.userCompanies.find((uc) => uc.companyId === companyId);

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
      isActive: user.isActive,
      createdAt: user.createdAt,
      company: active?.company ?? null,
      role: active?.role
        ? { id: active.role.id, name: active.role.name }
        : null,
      permissions: this.flattenPermissions(active?.role?.permissions),
      companies: user.userCompanies.map((uc) => ({
        id: uc.company.id,
        name: uc.company.name,
        code: uc.company.code,
        isActive: uc.companyId === companyId,
        role: uc.role ? uc.role.name : null,
      })),
    };
  }

  // -------------------------------------------------------------------------

  private flattenPermissions(
    rolePermissions?: {
      granted: boolean;
      permission: {
        moduleName: string;
        resourceName: string;
        actionName: string;
      };
    }[],
  ): string[] {
    if (!rolePermissions) return [];
    return rolePermissions
      .filter((rp) => rp.granted)
      .map(
        (rp) =>
          `${rp.permission.moduleName}.${rp.permission.resourceName}.${rp.permission.actionName}`,
      )
      .sort();
  }

  private async resolveDefaultCompany(userId: number) {
    const link =
      (await this.prisma.userCompany.findFirst({
        where: { userId, isDefault: true },
      })) ??
      (await this.prisma.userCompany.findFirst({
        where: { userId },
        orderBy: { assignedAt: 'asc' },
      }));

    if (!link) {
      throw new UnauthorizedException(
        "Aucune société n'est associée à ce compte",
      );
    }
    return link;
  }

  private async buildSession(
    userId: number,
    email: string,
    username: string,
    companyId: number,
    roleId: number | null,
    userAgent?: string,
  ) {
    const payload: JwtPayload = {
      sub: userId,
      email,
      username,
      companyId,
      roleId,
    };

    const refresh = await this.refreshTokens.issue(
      userId,
      companyId,
      userAgent,
    );

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: refresh.token,
      refreshTokenExpiresAt: refresh.expiresAt,
      user: await this.getProfile(userId, companyId),
    };
  }

  /**
   * Renouvelle la paire de jetons. Le jeton d'accès est volontairement court :
   * c'est le rafraîchissement, révocable, qui porte la durée de la session.
   */
  async refresh(refreshToken: string, userAgent?: string) {
    const rotated = await this.refreshTokens.rotate(refreshToken, userAgent);

    const link = await this.prisma.userCompany.findUnique({
      where: {
        userId_companyId: {
          userId: rotated.userId,
          companyId: rotated.companyId,
        },
      },
      include: { user: true },
    });

    if (!link || !link.user.isActive) {
      await this.refreshTokens.revokeAllForUser(rotated.userId);
      throw new UnauthorizedException('Compte ou société inaccessible');
    }

    const payload: JwtPayload = {
      sub: link.user.id,
      email: link.user.email,
      username: link.user.username,
      companyId: rotated.companyId,
      roleId: link.roleId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: rotated.token,
      refreshTokenExpiresAt: rotated.expiresAt,
      user: await this.getProfile(link.user.id, rotated.companyId),
    };
  }

  /** Déconnexion : on révoque le jeton présenté, pas toute la session. */
  async logout(refreshToken?: string) {
    if (refreshToken) await this.refreshTokens.revoke(refreshToken);
    return { message: 'Session fermée' };
  }

  /** Code société court, unique, dérivé du nom (DEMOCORP, DEMOCORP2, ...). */
  private async generateCompanyCode(
    tx: { company: { findUnique: (a: any) => Promise<unknown> } },
    source: string,
  ): Promise<string> {
    const base =
      source
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 8) || 'COMP';

    for (let suffix = 0; suffix < 1000; suffix++) {
      const code = suffix === 0 ? base : `${base}${suffix}`;
      const taken = await tx.company.findUnique({ where: { code } });
      if (!taken) return code;
    }
    // Repli très improbable.
    return `${base}${Date.now().toString(36).toUpperCase()}`;
  }
}
