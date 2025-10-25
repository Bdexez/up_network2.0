import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get(
      'permission',
      context.getHandler(),
    );
    if (!requiredPermission) return true; // aucune permission requise pour cette route

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) throw new ForbiddenException('Utilisateur non authentifié');

    // On prend le premier rôle assigné à l'utilisateur, peu importe isDefault
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

    if (!userCompany?.role) throw new ForbiddenException('Aucun rôle assigné');

    const hasPermission = userCompany.role.permissions.some(
      (rp) =>
        rp.permission.moduleName === requiredPermission.moduleName &&
        rp.permission.resourceName === requiredPermission.resourceName &&
        rp.permission.actionName === requiredPermission.actionName &&
        rp.granted === true,
    );

    if (!hasPermission)
      throw new ForbiddenException(
        `Accès refusé : permission manquante (${requiredPermission.moduleName}.${requiredPermission.resourceName}.${requiredPermission.actionName})`,
      );

    return true;
  }
}
