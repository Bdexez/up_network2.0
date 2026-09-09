import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';
import type { AuthenticatedRequest } from 'src/common/types/authenticated-request';

interface RequiredPermission {
  moduleName: string;
  resourceName: string;
  actionName: string;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<
      RequiredPermission | undefined
    >('permission', [context.getHandler(), context.getClass()]);

    // Route sans @RequirePermission : le JwtAuthGuard suffit.
    if (!requiredPermission) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Utilisateur non authentifié');
    }

    // Le rôle est cherché dans la société ACTIVE, pas la première venue.
    const userCompany = await this.prisma.userCompany.findUnique({
      where: {
        userId_companyId: { userId: user.userId, companyId: user.companyId },
      },
      include: {
        role: {
          include: { permissions: { include: { permission: true } } },
        },
      },
    });

    if (!userCompany) {
      throw new ForbiddenException("Vous n'appartenez pas à cette société");
    }

    if (!userCompany.role) {
      throw new ForbiddenException('Aucun rôle assigné');
    }

    const hasPermission = userCompany.role.permissions.some(
      (rp) =>
        rp.granted &&
        rp.permission.moduleName === requiredPermission.moduleName &&
        rp.permission.resourceName === requiredPermission.resourceName &&
        rp.permission.actionName === requiredPermission.actionName,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Accès refusé : permission manquante (${requiredPermission.moduleName}.${requiredPermission.resourceName}.${requiredPermission.actionName})`,
      );
    }

    return true;
  }
}
