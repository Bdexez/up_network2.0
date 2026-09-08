import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import type {
  AuthenticatedUser,
  JwtPayload,
} from 'src/common/types/authenticated-request';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const secretOrKey = process.env.JWT_SECRET;

    if (!secretOrKey) {
      throw new Error(
        'JWT_SECRET must be defined (voir backend/.env.example)',
      );
    }

    const options: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey,
    };

    super(options);
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    if (
      !payload ||
      typeof payload.sub !== 'number' ||
      typeof payload.email !== 'string' ||
      typeof payload.username !== 'string' ||
      typeof payload.companyId !== 'number'
    ) {
      throw new UnauthorizedException('Jeton invalide');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      username: payload.username,
      companyId: payload.companyId,
      roleId: typeof payload.roleId === 'number' ? payload.roleId : null,
    };
  }
}
