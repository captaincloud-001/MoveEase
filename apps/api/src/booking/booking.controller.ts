import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('booking')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
  ) {}

  @UseGuards(JwtAuthGuard)
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
