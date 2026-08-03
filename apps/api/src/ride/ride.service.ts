import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateRideDto } from './dto/create-ride.dto';
import { UpdateRideStatusDto } from './dto/update-ride-status.dto';
import { RideStatus } from '@prisma/client';


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

  async updateRideStatus(
  rideId: string,
  userId: string,
  dto: UpdateRideStatusDto,
) {
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

  const ride =
    await this.prisma.ride.findUnique({
      where: {
        id: rideId,
      },
    });

  if (!ride) {
    throw new NotFoundException(
      'Ride not found',
    );
  }

  if (ride.driverProfileId !== driver.id) {
    throw new ForbiddenException(
      'This ride does not belong to you',
    );
  }
  
  const allowedTransitions: Record<RideStatus, RideStatus[]> = {

  REQUESTED: [RideStatus.ACCEPTED, RideStatus.CANCELLED],

  ACCEPTED: [RideStatus.ARRIVED, RideStatus.CANCELLED],

  ARRIVED: [RideStatus.STARTED, RideStatus.CANCELLED],

  STARTED: [RideStatus.COMPLETED],

  COMPLETED: [],

  CANCELLED: [],

  EXPIRED: [],
};
const currentStatus = ride.status;

const nextStatus = dto.status;

if (
  !allowedTransitions[currentStatus].includes(
    nextStatus,
  )
) {
  throw new ForbiddenException(
    `Cannot change ride from ${currentStatus} to ${nextStatus}`,
  );
}



  const updatedRide =
    await this.prisma.ride.update({
      where: {
        id: rideId,
      },
      data: {
        status: dto.status,

        acceptedAt:
          dto.status === 'ACCEPTED'
            ? new Date()
            : ride.acceptedAt,

        arrivedAt:
          dto.status === 'ARRIVED'
            ? new Date()
            : ride.arrivedAt,

        startedAt:
          dto.status === 'STARTED'
            ? new Date()
            : ride.startedAt,

        completedAt:
          dto.status === 'COMPLETED'
            ? new Date()
            : ride.completedAt,

        cancelledAt:
          dto.status === 'CANCELLED'
            ? new Date()
            : ride.cancelledAt,
      },
    });

  return {
    message: 'Ride status updated successfully',
    ride: updatedRide,
  };
}
}
