import { Controller, Get } from '@nestjs/common';
import { OwnerService } from './owner.service';
import { Owner } from '../shared/api-types';

@Controller('admin/owner')
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  @Get()
  async getOwner(): Promise<Owner> {
    return this.ownerService.getOwner();
  }
}
