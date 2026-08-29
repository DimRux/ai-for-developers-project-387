import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SlotsService } from '../slots/slots.service';
import { Booking, PageBooking, BookingScope } from '../shared/api-types';
import { PaginationQuery } from '../common/dto/pagination-query.dto';
import { ApiException } from '../common/exceptions/api.exception';
import { DateTime } from 'luxon';
import type { Prisma } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly slotsService: SlotsService,
  ) {}

  async createBooking(
    eventTypeId: string,
    data: { start: string; guest: { name: string; email: string; notes?: string } },
  ): Promise<Booking> {
    const event = await this.prisma.eventType.findUnique({ where: { id: eventTypeId } });
    if (!event) {
      throw new ApiException(
        'EVENT_TYPE_NOT_FOUND',
        `Event type "${eventTypeId}" not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const owner = await this.prisma.owner.findFirst();
    if (!owner) {
      throw new ApiException(
        'EVENT_TYPE_NOT_FOUND',
        'Owner profile not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const start = DateTime.fromISO(data.start, { zone: 'utc' });
    if (!start.isValid) {
      throw new ApiException(
        'VALIDATION_ERROR',
        'Invalid date format for start',
        HttpStatus.BAD_REQUEST,
      );
    }

    this.slotsService.assertInWindow(start, owner.bookingWindowDays);
    this.slotsService.assertAligned(start, event.durationMinutes, {
      timezone: owner.timezone,
      workingHoursStart: owner.workingHoursStart,
      workingHoursEnd: owner.workingHoursEnd,
      slotStepMinutes: owner.slotStepMinutes,
      bookingWindowDays: owner.bookingWindowDays,
    });

    const end = start.plus({ minutes: event.durationMinutes });

    const booking = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const conflict = await tx.booking.findFirst({
        where: {
          start: { lt: end.toJSDate() },
          end: { gt: start.toJSDate() },
        },
        select: { id: true },
      });

      if (conflict) {
        throw new ApiException(
          'SLOT_TAKEN',
          'This time slot is already booked',
          HttpStatus.CONFLICT,
          { conflictingBookingId: conflict.id },
        );
      }

      return tx.booking.create({
        data: {
          eventTypeId,
          eventTypeTitle: event.title,
          start: start.toJSDate(),
          end: end.toJSDate(),
          guestName: data.guest.name,
          guestEmail: data.guest.email,
          guestNotes: data.guest.notes ?? null,
        },
      });
    });

    return this.toResponse(booking);
  }

  async getBooking(id: string): Promise<Booking> {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      throw new ApiException(
        'BOOKING_NOT_FOUND',
        `Booking "${id}" not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return this.toResponse(booking);
  }

  async listBookingsAdmin(
    pagination: PaginationQuery,
    filters: {
      scope?: BookingScope;
      from?: string;
      to?: string;
      eventTypeId?: string;
    },
  ): Promise<PageBooking> {
    const limit = pagination.limit ?? 20;
    const offset = pagination.offset ?? 0;
    const now = DateTime.utc();

    const where: Record<string, unknown> = {};

    if (filters.scope === 'upcoming' || !filters.scope) {
      where.start = { gte: now.toJSDate() };
    } else if (filters.scope === 'past') {
      where.start = { lt: now.toJSDate() };
    }

    if (filters.from) {
      const fromDate = DateTime.fromISO(filters.from, { zone: 'utc' });
      where.start = { ...(where.start as object), gte: fromDate.toJSDate() };
    }

    if (filters.to) {
      const toDate = DateTime.fromISO(filters.to, { zone: 'utc' });
      where.start = { ...(where.start as object), lt: toDate.toJSDate() };
    }

    if (filters.eventTypeId) {
      where.eventTypeId = filters.eventTypeId;
    }

    const [items, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        orderBy: { start: 'asc' },
        skip: offset,
        take: limit,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { items: items.map(this.toResponse), total, limit, offset };
  }

  private toResponse(b: {
    id: string;
    eventTypeId: string;
    eventTypeTitle: string;
    start: Date;
    end: Date;
    guestName: string;
    guestEmail: string;
    guestNotes: string | null;
    createdAt: Date;
  }): Booking {
    return {
      id: b.id,
      eventTypeId: b.eventTypeId,
      eventTypeTitle: b.eventTypeTitle,
      start: b.start.toISOString(),
      end: b.end.toISOString(),
      guest: {
        name: b.guestName,
        email: b.guestEmail,
        ...(b.guestNotes ? { notes: b.guestNotes } : {}),
      },
      createdAt: b.createdAt.toISOString(),
    };
  }
}
