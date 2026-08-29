import { Controller, Get, Param } from '@nestjs/common';
import { BookingsService } from './bookings.service';

@Controller('bookings')
export class PublicBookingController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get(':bookingId')
  async getBooking(@Param('bookingId') bookingId: string) {
    return this.bookingsService.getBooking(bookingId);
  }
}
