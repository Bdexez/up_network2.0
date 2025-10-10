import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: any, res: any, next: () => void) {
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
