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

import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';


import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('booking')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
  ) {}
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DRIVER)
  @Get('pending')
  getPendingBookings(
    @Req() req: any,
  ) {
    return this.bookingService.getPendingBookings(
      req.user.sub,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DRIVER)
  @Patch(':id/status')
  updateBookingStatus(
    @Param('id') bookingId: string,
    @Req() req: any,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.bookingService.updateBookingStatus(
      bookingId,
      req.user.sub,
      dto,
    );
  }






  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @Post()
  createBooking(
    @Req() req: any,
    @Body() dto: CreateBookingDto,
  ) {
    return this.bookingService.createBooking(
      req.user.sub,
      dto,
    );
  }
}
