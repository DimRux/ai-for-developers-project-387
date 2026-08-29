import { Controller, Get, Param } from '@nestjs/common';
import { EventTypesService } from './event-types.service';
import { EventType } from '../shared/api-types';

@Controller('event-types')
export class PublicEventTypesController {
  constructor(private readonly eventTypesService: EventTypesService) {}

  @Get()
  async list(): Promise<EventType[]> {
    return this.eventTypesService.listEventTypesPublic();
  }

  @Get(':eventTypeId')
  async get(@Param('eventTypeId') eventTypeId: string): Promise<EventType> {
    return this.eventTypesService.getEventType(eventTypeId);
  }
}
