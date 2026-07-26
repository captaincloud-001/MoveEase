import { Role } from '@prisma/client';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

import { LoginDto } from './dto/login.dto';
import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
  ) {
    return this.authService.refresh(refreshTokenDto);
  }
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    return this.authService.me(req.user.sub);
  }
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() req: any) {
    return this.authService.logout(req.user.sub);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DRIVER)
  @Get('driver-only')
  driverOnly() {
    return {
      message: 'Welcome Driver!',
    };
  }

}
