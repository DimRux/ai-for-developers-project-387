import request from 'supertest';
import { INestApplication } from '@nestjs/common';

export interface AvailableSlot {
  start: string;
  end: string;
}

export async function findFirstAvailableSlot(
  app: INestApplication,
  eventTypeId: string,
): Promise<AvailableSlot> {
  const res = await request(app.getHttpServer())
    .get(`/api/v1/event-types/${eventTypeId}/slots`)
    .expect(200);

  for (const day of res.body.days) {
    const slot = day.slots.find((s: { isAvailable: boolean }) => s.isAvailable);
    if (slot) {
      return { start: slot.start, end: slot.end };
    }
  }

  throw new Error(`No available slots found for event type "${eventTypeId}"`);
}
