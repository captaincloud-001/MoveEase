import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createBooking(
    userId: string,
    dto: CreateBookingDto,
  ) {
    // Find customer
    const customer =
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

    if (!customer) {
      throw new NotFoundException(
        'Customer not found',
      );
    }

    // Find ride
    const ride =
      await this.prisma.ride.findUnique({
        where: {
          id: dto.rideId,
        },
        include: {
          vehicle: true,
          driverProfile: true,
        },
      });

    if (!ride) {
      throw new NotFoundException(
        'Ride not found',
      );
    }

    if (ride.status !== 'REQUESTED') {
      throw new BadRequestException(
        'Ride is no longer available',
      );
    }

    // Driver cannot book own ride
    if (
      ride.driverProfile &&
      ride.driverProfile.userId === userId
    ) {
      throw new ForbiddenException(
        'You cannot book your own ride',
      );
    }

    // Prevent duplicate booking
    const existingBooking =
      await this.prisma.booking.findUnique({
        where: {
          userId_rideId: {
            userId,
            rideId: ride.id,
          },
        },
      });

    if (existingBooking) {
      throw new BadRequestException(
        'You already booked this ride',
      );
    }

    // Seat validation
    const bookedSeats =
      await this.prisma.booking.aggregate({
        where: {
          rideId: ride.id,
        },
        _sum: {
          seats: true,
        },
      });

    const occupiedSeats =
      bookedSeats._sum.seats ?? 0;

    const availableSeats =
      ride.vehicle!.passengerCapacity -
      occupiedSeats;

    if (dto.seats > availableSeats) {
      throw new BadRequestException(
        `Only ${availableSeats} seat(s) available`,
      );
    }

    // Create booking
    const booking =
      await this.prisma.booking.create({
        data: {
          userId,
          rideId: ride.id,
          seats: dto.seats,
        },
      });

    return {
      message: 'Ride booked successfully',
      booking,
    };
  }
}
