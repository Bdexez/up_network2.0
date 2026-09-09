import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtStrategy } from './jwt.strategy';
import { RefreshTokenService } from './refresh-token.service';
import { UsersModule } from '../users/users.module';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        // Jeton d'accès court : c'est le jeton de rafraîchissement, révocable
        // en base, qui porte la durée réelle de la session.
        signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '15m' },
      }),
    }),
    forwardRef(() => UsersModule),
    RolesModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy, RefreshTokenService],
  exports: [AuthService],
})
export class AuthModule {}
