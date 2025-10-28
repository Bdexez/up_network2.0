import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import type { Request, Response, NextFunction } from 'express';

interface AuthenticatedUser {
  userId: number;
  email: string;
  username: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
  company?: { id: number; name: string; code: string }; // adapte selon ton modèle Company
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const user = req.user;
    if (!user) throw new UnauthorizedException();

    const companyLink = await this.prisma.userCompany.findFirst({
      where: { userId: user.userId, isDefault: true },
      include: { company: true },
    });

    if (!companyLink)
      throw new UnauthorizedException('Aucune entreprise associée');

    req.company = companyLink.company;

    next();
  }
}
