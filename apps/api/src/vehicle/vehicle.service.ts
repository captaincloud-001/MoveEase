import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

@Injectable()
export class VehicleService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createVehicle(
    userId: string,
    dto: CreateVehicleDto,
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

    const existingVehicle =
      await this.prisma.vehicle.findUnique({
        where: {
          plateNumber: dto.plateNumber,
        },
      });

    if (existingVehicle) {
      throw new ConflictException(
        'Vehicle already exists',
      );
    }

    const vehicle =
      await this.prisma.vehicle.create({
        data: {
          driverProfileId: driver.id,

          type: dto.type,

          brand: dto.brand,

          model: dto.model,

          year: dto.year,

          plateNumber: dto.plateNumber,

          color: dto.color,

          passengerCapacity:
            dto.passengerCapacity,
        },
      });

    return {
      message: 'Vehicle added successfully',
      vehicle,
    };
  }
}
