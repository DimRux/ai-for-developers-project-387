import { IsString, IsOptional, IsEmail, Length, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BookingCreate, Guest } from '../../shared/api-types';

class GuestDto implements Guest {
  @IsString()
  @Length(1, 200)
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  notes?: string;
}

export class CreateBookingDto implements BookingCreate {
  @IsString()
  start!: string;

  @ValidateNested()
  @Type(() => GuestDto)
  guest!: GuestDto;
}
