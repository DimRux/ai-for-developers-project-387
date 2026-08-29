import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { OwnerModule } from './owner/owner.module';
import { EventTypesModule } from './event-types/event-types.module';
import { BookingsModule } from './bookings/bookings.module';
import { SlotsModule } from './slots/slots.module';
import { BootstrapModule } from './bootstrap/bootstrap.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    OwnerModule,
    EventTypesModule,
    BookingsModule,
    SlotsModule,
    BootstrapModule,
  ],
})
export class AppModule {}
