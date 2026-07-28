import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { Role } from '@prisma/client';

import { RideService } from './ride.service';
import { CreateRideDto } from './dto/create-ride.dto';

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
}
