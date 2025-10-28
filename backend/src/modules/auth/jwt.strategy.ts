import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';

interface JwtPayload {
  sub: number;
  email: string;
  username: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    const secretOrKey = process.env.JWT_SECRET;

    if (!secretOrKey) {
      throw new Error('JWT_SECRET must be defined');
    }

    const options: StrategyOptions = {
      jwtFromRequest,
      secretOrKey,
    };

    super(options);
  }

  validate(payload: JwtPayload): {
    userId: number;
    email: string;
    username: string;
  } {
    // validate payload type
    if (
      !payload ||
      typeof payload.sub !== 'number' ||
      typeof payload.email !== 'string' ||
      typeof payload.username !== 'string'
    ) {
      throw new Error('Invalid JWT payload');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      username: payload.username,
    };
  }
}
