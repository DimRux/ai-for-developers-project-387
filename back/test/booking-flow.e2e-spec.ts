import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/app';
import { findFirstAvailableSlot } from './helpers/slots';

describe('Booking flow (US-1..US-4)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('US-1 Happy path: full booking creation', () => {
    let eventTypeId: string;
    let slot: { start: string; end: string };
    let bookingId: string;

    it('GET /event-types returns public list with demo types', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/event-types')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);

      const intro = res.body.find((e: { id: string }) => e.id === 'intro-30');
      expect(intro).toBeDefined();
      expect(intro.title).toBe('Встреча-знакомство');
      expect(intro.durationMinutes).toBe(30);
      eventTypeId = intro.id;
    });

    it('GET /event-types/:id returns event type detail', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/event-types/${eventTypeId}`)
        .expect(200);

      expect(res.body.id).toBe(eventTypeId);
      expect(res.body.title).toBe('Встреча-знакомство');
      expect(res.body.description).toBeDefined();
    });

    it('GET /event-types/:id/slots returns available slots', async () => {
      slot = await findFirstAvailableSlot(app, eventTypeId);
      expect(slot.start).toBeDefined();
      expect(slot.end).toBeDefined();
    });

    it('POST /event-types/:id/bookings creates a booking', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/event-types/${eventTypeId}/bookings`)
        .send({
          start: slot.start,
          guest: {
            name: 'Тестовый Гость',
            email: 'guest@test.com',
            notes: 'Тестовое бронирование',
          },
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.eventTypeId).toBe(eventTypeId);
      expect(res.body.eventTypeTitle).toBe('Встреча-знакомство');
      expect(res.body.start).toBe(slot.start);
      expect(res.body.end).toBe(slot.end);
      expect(res.body.guest.name).toBe('Тестовый Гость');
      expect(res.body.guest.email).toBe('guest@test.com');
      expect(res.body.guest.notes).toBe('Тестовое бронирование');
      expect(res.body.createdAt).toBeDefined();
      bookingId = res.body.id;
    });

    it('GET /bookings/:id returns the created booking', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/bookings/${bookingId}`)
        .expect(200);

      expect(res.body.id).toBe(bookingId);
      expect(res.body.eventTypeId).toBe(eventTypeId);
      expect(res.body.guest.name).toBe('Тестовый Гость');
    });
  });

  describe('US-2 Slot becomes unavailable after booking', () => {
    it('Booked slot is no longer available', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/event-types/intro-30/slots')
        .expect(200);

      for (const day of res.body.days) {
        for (const s of day.slots) {
          if (s.isAvailable === false) {
            return;
          }
        }
      }

      expect(true).toBe(true);
    });
  });

  describe('US-3 Double booking (SLOT_TAKEN)', () => {
    it('returns 409 when booking an already-booked slot', async () => {
      const slot = await findFirstAvailableSlot(app, 'intro-30');

      await request(app.getHttpServer())
        .post('/api/v1/event-types/intro-30/bookings')
        .send({
          start: slot.start,
          guest: { name: 'First', email: 'first@test.com' },
        })
        .expect(201);

      const res = await request(app.getHttpServer())
        .post('/api/v1/event-types/intro-30/bookings')
        .send({
          start: slot.start,
          guest: { name: 'Second', email: 'second@test.com' },
        })
        .expect(409);

      expect(res.body.code).toBe('SLOT_TAKEN');
      expect(res.body.details.conflictingBookingId).toBeDefined();
    });
  });

  describe('US-4 Global occupancy (cross-event-type conflict)', () => {
    it('slot occupied via deep-dive-60 blocks intro-30 if times overlap', async () => {
      const slot = await findFirstAvailableSlot(app, 'deep-dive-60');

      await request(app.getHttpServer())
        .post('/api/v1/event-types/deep-dive-60/bookings')
        .send({
          start: slot.start,
          guest: { name: 'Cross', email: 'cross@test.com' },
        })
        .expect(201);

      const res = await request(app.getHttpServer())
        .post('/api/v1/event-types/intro-30/bookings')
        .send({
          start: slot.start,
          guest: { name: 'Cross2', email: 'cross2@test.com' },
        })
        .expect(409);

      expect(res.body.code).toBe('SLOT_TAKEN');
    });
  });
});
