import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { PublicBookingsController } from './public-bookings.controller';
import { PublicBookingController } from './public-booking.controller';
import { AdminBookingsController } from './admin-bookings.controller';
import { SlotsModule } from '../slots/slots.module';

@Module({
  imports: [SlotsModule],
  providers: [BookingsService],
  controllers: [PublicBookingsController, PublicBookingController, AdminBookingsController],
})
export class BookingsModule {}
