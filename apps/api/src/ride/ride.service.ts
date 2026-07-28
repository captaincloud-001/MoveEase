import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateRideDto } from './dto/create-ride.dto';

@Injectable()
export class RideService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createRide(
    userId: string,
    dto: CreateRideDto,
  ) {
    // Find driver's profile
    const driver =
      await this.prisma.driverProfile.findUnique({
        where: {
          userId,
        },
      });

    if (!driver) {
      throw new NotFoundException(
        'Driver profile not found',
      );
    }

    // Find vehicle
    const vehicle =
      await this.prisma.vehicle.findUnique({
        where: {
          id: dto.vehicleId,
        },
      });

    if (!vehicle) {
      throw new NotFoundException(
        'Vehicle not found',
      );
    }

    // Ensure vehicle belongs to driver
    if (vehicle.driverProfileId !== driver.id) {
      throw new ForbiddenException(
        'This vehicle does not belong to you',
      );
    }

    if (!vehicle.isActive) {
      throw new ForbiddenException(
        'Vehicle is inactive',
      );
    }

    if (!vehicle.isVerified) {
      throw new ForbiddenException(
        'Vehicle is not verified',
      );
    }

    // Temporary fare calculation
    const estimatedFare = Number(
      (dto.estimatedDistance * 10).toFixed(2),
    );

    const ride =
      await this.prisma.ride.create({
        data: {
          driverProfileId: driver.id,

          vehicleId: vehicle.id,

          pickupAddress: dto.pickupAddress,
          pickupLatitude: dto.pickupLatitude,
          pickupLongitude: dto.pickupLongitude,

          dropAddress: dto.dropAddress,
          dropLatitude: dto.dropLatitude,
          dropLongitude: dto.dropLongitude,

          estimatedDistance:
            dto.estimatedDistance,

          estimatedFare,

          amount: estimatedFare,
        },
      });

    return {
      message: 'Ride created successfully',
      ride,
    };
  }
  async getAvailableRides() {
  const rides = await this.prisma.ride.findMany({
  where: {
    status: 'REQUESTED',
    vehicle: {
      isActive: true,
      isVerified: true,
    },
  },

  select: {
    id: true,

    pickupAddress: true,
    dropAddress: true,

    pickupLatitude: true,
    pickupLongitude: true,

    dropLatitude: true,
    dropLongitude: true,

    estimatedDistance: true,
    estimatedFare: true,

    requestedAt: true,

    vehicle: {
      select: {
        id: true,
        type: true,
        brand: true,
        model: true,
        color: true,
        passengerCapacity: true,
      },
    },

    driverProfile: {
        select: {
          rating: true,
 
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },

    orderBy: {
      requestedAt: 'desc',
    },
  });
    return {
    message: 'Available rides fetched successfully',
    rides,
  };

}
