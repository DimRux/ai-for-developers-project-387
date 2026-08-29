import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { EventTypesService } from './event-types.service';
import { CreateEventTypeDto } from './dto/create-event-type.dto';
import { PaginationQuery } from '../common/dto/pagination-query.dto';
import { EventType, PageEventType } from '../shared/api-types';

@Controller('admin/event-types')
export class AdminEventTypesController {
  constructor(private readonly eventTypesService: EventTypesService) {}

  @Post()
  async create(@Body() dto: CreateEventTypeDto): Promise<EventType> {
    return this.eventTypesService.createEventType(dto);
  }

  @Get()
  async list(@Query() pagination: PaginationQuery): Promise<PageEventType> {
    return this.eventTypesService.listEventTypesAdmin(pagination);
  }
}
