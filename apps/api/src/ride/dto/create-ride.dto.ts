import {
  IsString,
  IsNumber,
  IsUUID,
  IsPositive,
} from 'class-validator';

export class CreateRideDto {
  @IsString()
  vehicleId: string;

  @IsString()
  pickupAddress: string;

  @IsNumber()
  pickupLatitude: number;

  @IsNumber()
  pickupLongitude: number;

  @IsString()
  dropAddress: string;

  @IsNumber()
  dropLatitude: number;

  @IsNumber()
  dropLongitude: number;

  @IsPositive()
  estimatedDistance: number;
}
