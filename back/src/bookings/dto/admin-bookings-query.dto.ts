import { IsOptional, IsString, IsIn } from 'class-validator';
import { PaginationQuery } from '../../common/dto/pagination-query.dto';
import { BookingScope } from '../../shared/api-types';

export class AdminBookingsQuery extends PaginationQuery {
  @IsOptional()
  @IsString()
  @IsIn(['upcoming', 'past', 'all'])
  scope?: BookingScope;

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsString()
  eventTypeId?: string;
}
