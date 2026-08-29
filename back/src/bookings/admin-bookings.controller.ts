import { Controller, Get, Query } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { AdminBookingsQuery } from './dto/admin-bookings-query.dto';
import { PageBooking } from '../shared/api-types';

@Controller('admin/bookings')
export class AdminBookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  async list(@Query() query: AdminBookingsQuery): Promise<PageBooking> {
    return this.bookingsService.listBookingsAdmin(query, {
      scope: query.scope,
      from: query.from,
      to: query.to,
      eventTypeId: query.eventTypeId,
    });
  }
}
