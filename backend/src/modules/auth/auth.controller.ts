import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SwitchCompanyDto } from './dto/switch-company.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser, CompanyId } from 'src/common/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/common/types/authenticated-request';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(
    @CurrentUser() user: AuthenticatedUser,
    @CompanyId() companyId: number,
  ) {
    return this.authService.getProfile(user.userId, companyId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('switch-company')
  @HttpCode(HttpStatus.OK)
  switchCompany(
    @CurrentUser('userId') userId: number,
    @Body() dto: SwitchCompanyDto,
  ) {
    return this.authService.switchCompany(userId, dto.companyId);
  }
}
