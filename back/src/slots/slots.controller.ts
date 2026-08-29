import { Controller, Get, Param, Query } from '@nestjs/common';
import { SlotsService } from './slots.service';
import { SlotsResponse } from '../shared/api-types';

@Controller('event-types/:eventTypeId/slots')
export class SlotsController {
  constructor(private readonly slotsService: SlotsService) {}

  @Get()
  async listSlots(
    @Param('eventTypeId') eventTypeId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('onlyAvailable') onlyAvailable?: string,
  ): Promise<SlotsResponse> {
    return this.slotsService.listSlots(eventTypeId, {
      from,
      to,
      onlyAvailable: onlyAvailable !== 'false',
    });
  }
}
