import {
  IsEnum,
  IsInt,
  IsString,
  Min,
} from 'class-validator';

import { VehicleType } from '@prisma/client';

export class CreateVehicleDto {
  @IsEnum(VehicleType)
  type: VehicleType;

  @IsString()
  brand: string;

  @IsString()
  model: string;

  @IsInt()
  year: number;

  @IsString()
  plateNumber: string;

  @IsString()
  color: string;

  @IsInt()
  @Min(1)
  passengerCapacity: number;
}
