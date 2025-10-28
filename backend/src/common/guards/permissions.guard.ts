import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';
import { Request } from 'express';

// --- Typage global ---
interface RequiredPermission {
  moduleName: string;
  resourceName: string;
  actionName: string;
}

interface AuthenticatedUser {
  userId: number;
  roleId?: number;
  email?: string;
  [key: string]: any;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // ✅ Typage explicite du request
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthenticatedUser }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Utilisateur non authentifié');
    }

    // ✅ Récupération typée de la permission
    const requiredPermission = this.reflector.get<RequiredPermission>(
      'permission',
      context.getHandler(),
    );

    if (!requiredPermission) return true; // aucune permission requise pour cette route

    // ✅ Recherche du rôle et des permissions
    const userCompany = await this.prisma.userCompany.findFirst({
      where: { userId: user.userId },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    if (!userCompany?.role) {
      throw new ForbiddenException('Aucun rôle assigné');
    }

    const hasPermission = userCompany.role.permissions.some(
      (rp) =>
        rp.permission.moduleName === requiredPermission.moduleName &&
        rp.permission.resourceName === requiredPermission.resourceName &&
        rp.permission.actionName === requiredPermission.actionName &&
        rp.granted === true,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Accès refusé : permission manquante (${requiredPermission.moduleName}.${requiredPermission.resourceName}.${requiredPermission.actionName})`,
      );
    }

    return true;
  }
}
