import { Controller, Post, Body, Param } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Booking } from '../shared/api-types';

@Controller('event-types/:eventTypeId/bookings')
export class PublicBookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  async create(
    @Param('eventTypeId') eventTypeId: string,
    @Body() dto: CreateBookingDto,
  ): Promise<Booking> {
    return this.bookingsService.createBooking(eventTypeId, dto);
  }
}
