import {
  IsDateString,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateDriverProfileDto {
  @IsString()
  @IsNotEmpty()
  licenseNumber: string;

  @IsDateString()
  licenseExpiry: string;

  @IsString()
  @IsNotEmpty()
  aadhaarNumber: string;
}
