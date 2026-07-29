import {
  IsInt,
  IsString,
  Min,
} from 'class-validator';

export class CreateBookingDto {
  @IsString()
  rideId: string;

  @IsInt()
  @Min(1)
  seats: number;
}
