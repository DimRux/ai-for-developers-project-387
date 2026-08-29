import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DateTime, Interval } from 'luxon';
import { SlotsResponse, DaySlots, Slot } from '../shared/api-types';
import { ApiException } from '../common/exceptions/api.exception';

interface OwnerRecord {
  timezone: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  slotStepMinutes: number;
  bookingWindowDays: number;
}

interface BookingRecord {
  start: Date;
  end: Date;
}

@Injectable()
export class SlotsService {
  constructor(private readonly prisma: PrismaService) {}

  async listSlots(
    eventTypeId: string,
    params: {
      from?: string;
      to?: string;
      onlyAvailable?: boolean;
    },
  ): Promise<SlotsResponse> {
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

    const now = DateTime.utc();
    const windowStartRaw = params.from ? DateTime.fromISO(params.from, { zone: 'utc' }) : now;
    const maxEnd = now.plus({ days: owner.bookingWindowDays });
    const windowStart = windowStartRaw < now ? now : windowStartRaw;

    const windowEndRaw = params.to
      ? DateTime.fromISO(params.to, { zone: 'utc' })
      : windowStart.plus({ days: owner.bookingWindowDays });

    if (windowEndRaw <= windowStart) {
      throw new ApiException(
        'SLOT_OUT_OF_WINDOW',
        'Parameter "to" must be greater than "from"',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (windowEndRaw > maxEnd) {
      throw new ApiException(
        'SLOT_OUT_OF_WINDOW',
        `Window end cannot exceed ${maxEnd.toISO()}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const windowEnd = windowEndRaw;

    const allBookings = await this.prisma.booking.findMany({
      where: {
        start: { lt: windowEnd.toJSDate() },
        end: { gt: windowStart.toJSDate() },
      },
      select: { start: true, end: true },
    });

    const days = this.generateSlots(
      owner,
      event.durationMinutes,
      windowStart,
      windowEnd,
      allBookings,
    );

    const filteredDays = params.onlyAvailable !== false
      ? days.map((d) => ({
          ...d,
          slots: d.slots.filter((s: Slot) => s.isAvailable),
        }))
      : days;

    return {
      eventTypeId,
      durationMinutes: event.durationMinutes,
      timezone: owner.timezone,
      windowStart: windowStart.toISO()!,
      windowEnd: windowEnd.toISO()!,
      days: filteredDays,
    };
  }

  generateSlots(
    owner: OwnerRecord,
    durationMinutes: number,
    windowStart: DateTime,
    windowEnd: DateTime,
    bookings: BookingRecord[],
  ): DaySlots[] {
    const tz = owner.timezone;
    const [whStartH, whStartM] = owner.workingHoursStart.split(':').map(Number);
    const [whEndH, whEndM] = owner.workingHoursEnd.split(':').map(Number);
    const step = owner.slotStepMinutes;

    const dayStart = windowStart.setZone(tz).startOf('day');
    const dayEnd = windowEnd.setZone(tz).startOf('day');

    const result: DaySlots[] = [];
    let currentDay = dayStart;

    while (currentDay <= dayEnd) {
      const workStart = currentDay.set({ hour: whStartH, minute: whStartM, second: 0, millisecond: 0 });
      const workEnd = currentDay.set({ hour: whEndH, minute: whEndM, second: 0, millisecond: 0 });

      const slots: Slot[] = [];
      let t = workStart;

      while (t.plus({ minutes: durationMinutes }) <= workEnd) {
        const slotStartUtc = t.setZone('utc');
        const slotEndUtc = slotStartUtc.plus({ minutes: durationMinutes });

        const inWindow = slotStartUtc >= windowStart && slotEndUtc <= windowEnd;

        const isOverlapping = bookings.some((b) => {
          const bStart = DateTime.fromJSDate(b.start, { zone: 'utc' });
          const bEnd = DateTime.fromJSDate(b.end, { zone: 'utc' });
          return Interval.fromDateTimes(slotStartUtc, slotEndUtc).overlaps(
            Interval.fromDateTimes(bStart, bEnd),
          );
        });

        const isAvailable = inWindow && !isOverlapping;

        slots.push({
          start: slotStartUtc.toISO()!,
          end: slotEndUtc.toISO()!,
          isAvailable,
        });

        t = t.plus({ minutes: step });
      }

      result.push({
        date: currentDay.toISODate()!,
        slots,
      });

      currentDay = currentDay.plus({ days: 1 });
    }

    return result;
  }

  assertInWindow(start: DateTime, bookingWindowDays: number): void {
    const now = DateTime.utc();
    const maxEnd = now.plus({ days: bookingWindowDays });
    if (start < now || start >= maxEnd) {
      throw new ApiException(
        'SLOT_OUT_OF_WINDOW',
        `Slot start must be within [${now.toISO()}; ${maxEnd.toISO()})`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  assertAligned(
    start: DateTime,
    durationMinutes: number,
    owner: OwnerRecord,
  ): void {
    const tz = owner.timezone;
    const localStart = start.setZone(tz);
    const [whStartH, whStartM] = owner.workingHoursStart.split(':').map(Number);
    const [whEndH, whEndM] = owner.workingHoursEnd.split(':').map(Number);
    const workStart = localStart.set({ hour: whStartH, minute: whStartM, second: 0, millisecond: 0 });
    const workEnd = localStart.set({ hour: whEndH, minute: whEndM, second: 0, millisecond: 0 });

    const minutesFromWorkStart = localStart.diff(workStart, 'minutes').minutes;
    if (minutesFromWorkStart < 0 || minutesFromWorkStart % owner.slotStepMinutes !== 0) {
      throw new ApiException(
        'SLOT_NOT_ALIGNED',
        `Slot start must be aligned to ${owner.slotStepMinutes}-minute grid from working hours start`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const slotEnd = localStart.plus({ minutes: durationMinutes });
    if (slotEnd > workEnd) {
      throw new ApiException(
        'SLOT_NOT_ALIGNED',
        'Slot does not fit within owner working hours',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
