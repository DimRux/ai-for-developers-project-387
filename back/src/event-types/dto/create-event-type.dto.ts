import { IsString, IsInt, Min, Max, Length } from 'class-validator';
import { EventTypeCreate } from '../../shared/api-types';

export class CreateEventTypeDto implements EventTypeCreate {
  @IsString()
  @Length(1, 64)
  id!: string;

  @IsString()
  @Length(1, 200)
  title!: string;

  @IsString()
  @Length(0, 2000)
  description!: string;

  @IsInt()
  @Min(1)
  @Max(1440)
  durationMinutes!: number;
}
