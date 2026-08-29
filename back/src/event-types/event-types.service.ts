import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventType, PageEventType } from '../shared/api-types';
import { PaginationQuery } from '../common/dto/pagination-query.dto';
import { ApiException, ErrorCode } from '../common/exceptions/api.exception';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class EventTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async createEventType(data: {
    id: string;
    title: string;
    description: string;
    durationMinutes: number;
  }): Promise<EventType> {
    try {
      const et = await this.prisma.eventType.create({
        data: {
          id: data.id,
          title: data.title,
          description: data.description,
          durationMinutes: data.durationMinutes,
        },
      });
      return this.toResponse(et);
    } catch (e: unknown) {
      if (isPrismaError(e, 'P2002')) {
        throw new ApiException(
          'EVENT_TYPE_ID_CONFLICT',
          `Event type with id "${data.id}" already exists`,
          HttpStatus.CONFLICT,
        );
      }
      throw e;
    }
  }

  async listEventTypesAdmin(pagination: PaginationQuery): Promise<PageEventType> {
    const limit = pagination.limit ?? 20;
    const offset = pagination.offset ?? 0;
    const [items, total] = await Promise.all([
      this.prisma.eventType.findMany({
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.prisma.eventType.count(),
    ]);
    return { items: items.map(this.toResponse), total, limit, offset };
  }

  async listEventTypesPublic(): Promise<EventType[]> {
    const items = await this.prisma.eventType.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return items.map(this.toResponse);
  }

  async getEventType(id: string): Promise<EventType> {
    const et = await this.prisma.eventType.findUnique({ where: { id } });
    if (!et) {
      throw new ApiException(
        'EVENT_TYPE_NOT_FOUND',
        `Event type "${id}" not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return this.toResponse(et);
  }

  private toResponse(et: { id: string; title: string; description: string; durationMinutes: number; createdAt: Date }): EventType {
    return {
      id: et.id,
      title: et.title,
      description: et.description,
      durationMinutes: et.durationMinutes,
      createdAt: et.createdAt.toISOString(),
    };
  }
}

function isPrismaError(e: unknown, code: string): boolean {
  return typeof e === 'object' && e !== null && 'code' in e && (e as { code: string }).code === code;
}
