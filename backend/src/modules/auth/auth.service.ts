import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    console.log('🔐 REGISTER - Email:', dto.email, 'Username:', dto.username);

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      console.log('❌ Email already exists');
      throw new ConflictException('Email already exists');
    }

    const existingUsername = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (existingUsername) {
      console.log('❌ Username already exists');
      throw new ConflictException('Username already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    console.log('🔑 Password hashed successfully');

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        passwordHash,
        userType: dto.userType || 'internal',
        isActive: true,
      },
    });

    console.log('✅ User created with ID:', user.id);
    return this.signToken(user.id, user.email, user.username);
  }

  async login(dto: LoginDto) {
    console.log('🔐 LOGIN ATTEMPT - Email:', dto.email);

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    console.log(
      '👤 User found:',
      user ? `ID: ${user.id}, Email: ${user.email}` : 'NOT FOUND',
    );

    if (!user) {
      console.log('❌ User not found in database');
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log('🔑 Comparing passwords...');
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    console.log('🔑 Password valid:', valid);

    if (!valid) {
      console.log('❌ Password comparison failed');
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log('✅ LOGIN SUCCESSFUL - User ID:', user.id);
    return this.signToken(user.id, user.email, user.username);
  }

  private signToken(userId: number, email: string, username: string) {
    const payload = {
      sub: userId,
      email,
      username,
    };
    const accessToken = this.jwtService.sign(payload);
    console.log('🎫 Token generated for user:', userId);

    return {
      accessToken,
      user: {
        id: userId,
        email,
        username,
      },
    };
  }

  async getProfile(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userCompanies: {
          include: {
            company: true,
            role: true,
          },
        },
      },
    });
  }
}
