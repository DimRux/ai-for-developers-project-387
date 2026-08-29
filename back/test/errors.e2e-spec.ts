import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/app';
import { findFirstAvailableSlot } from './helpers/slots';

describe('Error codes (US-7)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('EVENT_TYPE_NOT_FOUND (404)', () => {
    it('GET /event-types/nonexistent', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/event-types/nonexistent')
        .expect(404);

      expect(res.body.code).toBe('EVENT_TYPE_NOT_FOUND');
      expect(typeof res.body.message).toBe('string');
    });

    it('POST /event-types/nonexistent/bookings', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/event-types/nonexistent/bookings')
        .send({
          start: new Date().toISOString(),
          guest: { name: 'X', email: 'x@test.com' },
        })
        .expect(404);

      expect(res.body.code).toBe('EVENT_TYPE_NOT_FOUND');
    });

    it('GET /event-types/nonexistent/slots', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/event-types/nonexistent/slots')
        .expect(404);

      expect(res.body.code).toBe('EVENT_TYPE_NOT_FOUND');
    });
  });

  describe('BOOKING_NOT_FOUND (404)', () => {
    it('GET /bookings/:id with nonexistent id', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/bookings/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(res.body.code).toBe('BOOKING_NOT_FOUND');
    });
  });

  describe('VALIDATION_ERROR (400)', () => {
    it('POST /event-types/intro-30/bookings with missing start', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/event-types/intro-30/bookings')
        .send({
          guest: { name: 'Test', email: 'test@test.com' },
        })
        .expect(400);

      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('POST /event-types/intro-30/bookings with invalid email', async () => {
      const slot = await findFirstAvailableSlot(app, 'intro-30');
      const res = await request(app.getHttpServer())
        .post('/api/v1/event-types/intro-30/bookings')
        .send({
          start: slot.start,
          guest: { name: 'Test', email: 'not-an-email' },
        })
        .expect(400);

      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('POST /admin/event-types with missing fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/event-types')
        .send({ id: 'x' })
        .expect(400);

      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('POST /admin/event-types with unknown field rejected by forbidNonWhitelisted', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/event-types')
        .send({
          id: 'test-wl',
          title: 'WL',
          description: '',
          durationMinutes: 30,
          unknownField: 'should be rejected',
        })
        .expect(400);

      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('SLOT_NOT_ALIGNED (400)', () => {
    it('POST /bookings with start not on step grid', async () => {
      const now = new Date();
      const moscowOffset = 3;
      const utcHour = now.getUTCHours();
      const utcMin = now.getUTCMinutes();
      const moscowHour = (utcHour + moscowOffset) % 24;

      let targetMoscowHour = moscowHour;
      if (moscowHour < 10) targetMoscowHour = 10;
      if (moscowHour >= 19) targetMoscowHour = 10;

      const targetUtcHour = (targetMoscowHour - moscowOffset + 24) % 24;
      const nonAlignedMinute = 15;

      const target = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        targetUtcHour,
        nonAlignedMinute,
        0,
      ));

      if (target <= now) {
        target.setUTCDate(target.getUTCDate() + 1);
      }

      const res = await request(app.getHttpServer())
        .post('/api/v1/event-types/intro-30/bookings')
        .send({
          start: target.toISOString(),
          guest: { name: 'Align', email: 'align@test.com' },
        })
        .expect(400);

      expect(res.body.code).toBe('SLOT_NOT_ALIGNED');
    });
  });

  describe('SLOT_OUT_OF_WINDOW (400)', () => {
    it('POST /bookings with start in the past', async () => {
      const past = new Date(Date.now() - 3600 * 1000);
      const res = await request(app.getHttpServer())
        .post('/api/v1/event-types/intro-30/bookings')
        .send({
          start: past.toISOString(),
          guest: { name: 'Past', email: 'past@test.com' },
        })
        .expect(400);

      expect(res.body.code).toBe('SLOT_OUT_OF_WINDOW');
    });

    it('POST /bookings with start far in the future', async () => {
      const farFuture = new Date(Date.now() + 365 * 24 * 3600 * 1000);
      const res = await request(app.getHttpServer())
        .post('/api/v1/event-types/intro-30/bookings')
        .send({
          start: farFuture.toISOString(),
          guest: { name: 'Future', email: 'future@test.com' },
        })
        .expect(400);

      expect(res.body.code).toBe('SLOT_OUT_OF_WINDOW');
    });
  });
});
