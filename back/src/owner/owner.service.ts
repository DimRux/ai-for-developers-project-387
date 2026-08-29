import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Owner } from '../shared/api-types';
import { ApiException } from '../common/exceptions/api.exception';

@Injectable()
export class OwnerService {
  constructor(private readonly prisma: PrismaService) {}

  async getOwner(): Promise<Owner> {
    const owner = await this.prisma.owner.findFirst();
    if (!owner) {
      throw new ApiException(
        'EVENT_TYPE_NOT_FOUND',
        'Owner profile not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      id: owner.id,
      name: owner.name,
      email: owner.email,
      timezone: owner.timezone,
      workingHours: {
        start: owner.workingHoursStart,
        end: owner.workingHoursEnd,
      },
      slotStepMinutes: owner.slotStepMinutes,
      bookingWindowDays: owner.bookingWindowDays,
    };
  }
}
