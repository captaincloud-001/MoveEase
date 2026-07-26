import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateDriverProfileDto } from './dto/create-driver-profile.dto';

@Injectable()
export class DriverService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createProfile(
    userId: string,
    dto: CreateDriverProfileDto,
  ) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        driverProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.driverProfile) {
      throw new ConflictException(
        'Driver profile already exists',
      );
    }

    const driverProfile =
      await this.prisma.driverProfile.create({
        data: {
          userId,

          licenseNumber: dto.licenseNumber,

          licenseExpiry: new Date(dto.licenseExpiry),

          aadhaarNumber: dto.aadhaarNumber,
        },
      });

    return {
      message: 'Driver profile created successfully',
      driverProfile,
    };
  }
}
