import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { Role } from '@prisma/client';

import { RideService } from './ride.service';
import { CreateRideDto } from './dto/create-ride.dto';
import { UpdateRideStatusDto } from './dto/update-ride-status.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('ride')
export class RideController {
  constructor(
    private readonly rideService: RideService,
  ) {}

    @Get()
    getAvailableRides() {
      return this.rideService.getAvailableRides();
    }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DRIVER)
  @Post()
  createRide(
    @Req() req: any,
    @Body() dto: CreateRideDto,
  ) {
    return this.rideService.createRide(
      req.user.sub,
      dto,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DRIVER)
  @Patch(':id/status')
  updateRideStatus(
    @Param('id') rideId: string,
    @Req() req: any,
    @Body() dto: UpdateRideStatusDto,
  ) {
    return this.rideService.updateRideStatus(
      rideId,
      req.user.sub,
      dto,
    );
  }
}
