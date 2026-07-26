import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { Role } from '@prisma/client';

import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('vehicle')
export class VehicleController {
  constructor(
    private readonly vehicleService: VehicleService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DRIVER)
  @Post()
  createVehicle(
    @Req() req: any,
    @Body() dto: CreateVehicleDto,
  ) {
    return this.vehicleService.createVehicle(
      req.user.sub,
      dto,
    );
  }
}
