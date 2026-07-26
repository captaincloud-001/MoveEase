import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { Role } from '@prisma/client';

import { DriverService } from './driver.service';
import { CreateDriverProfileDto } from './dto/create-driver-profile.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('driver')
export class DriverController {
  constructor(
    private readonly driverService: DriverService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DRIVER)
  @Post('profile')
  createProfile(
    @Req() req: any,
    @Body() dto: CreateDriverProfileDto,
  ) {
    return this.driverService.createProfile(
      req.user.sub,
      dto,
    );
  }
}
