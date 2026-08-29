import { Module } from '@nestjs/common';
import { EventTypesService } from './event-types.service';
import { AdminEventTypesController } from './admin-event-types.controller';
import { PublicEventTypesController } from './public-event-types.controller';

@Module({
  providers: [EventTypesService],
  controllers: [AdminEventTypesController, PublicEventTypesController],
  exports: [EventTypesService],
})
export class EventTypesModule {}
