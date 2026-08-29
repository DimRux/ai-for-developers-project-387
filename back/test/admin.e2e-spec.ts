import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/app';

describe('Admin operations (US-5, US-6)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Owner profile', () => {
    it('GET /admin/owner returns owner data', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/owner')
        .expect(200);

      expect(res.body.id).toBeDefined();
      expect(res.body.name).toBeDefined();
      expect(res.body.email).toBeDefined();
      expect(res.body.timezone).toBeDefined();
      expect(res.body.workingHours).toEqual({
        start: '10:00:00',
        end: '19:00:00',
      });
      expect(res.body.slotStepMinutes).toBe(30);
      expect(res.body.bookingWindowDays).toBe(14);
    });
  });

  describe('US-5 Create event type', () => {
    const testId = `test-et-${Date.now()}`;

    it('POST /admin/event-types creates an event type', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/event-types')
        .send({
          id: testId,
          title: 'Test Event',
          description: 'Test description',
          durationMinutes: 45,
        })
        .expect(201);

      expect(res.body.id).toBe(testId);
      expect(res.body.title).toBe('Test Event');
      expect(res.body.description).toBe('Test description');
      expect(res.body.durationMinutes).toBe(45);
      expect(res.body.createdAt).toBeDefined();
    });

    it('GET /event-types includes the new event type', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/event-types')
        .expect(200);

      const found = res.body.find((e: { id: string }) => e.id === testId);
      expect(found).toBeDefined();
    });

    it('POST /admin/event-types returns 409 on duplicate id', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/event-types')
        .send({
          id: testId,
          title: 'Duplicate',
          description: 'Should fail',
          durationMinutes: 30,
        })
        .expect(409);

      expect(res.body.code).toBe('EVENT_TYPE_ID_CONFLICT');
    });

    it('GET /admin/event-types returns paginated list', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/event-types')
        .expect(200);

      expect(Array.isArray(res.body.items)).toBe(true);
      expect(typeof res.body.total).toBe('number');
      expect(res.body.limit).toBe(20);
      expect(res.body.offset).toBe(0);
    });
  });

  describe('US-6 Admin bookings list', () => {
    it('GET /admin/bookings with scope=upcoming', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/bookings?scope=upcoming')
        .expect(200);

      expect(Array.isArray(res.body.items)).toBe(true);
      expect(typeof res.body.total).toBe('number');
    });

    it('GET /admin/bookings with scope=all', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/bookings?scope=all')
        .expect(200);

      expect(Array.isArray(res.body.items)).toBe(true);
    });

    it('GET /admin/bookings with eventTypeId filter', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/bookings?eventTypeId=intro-30&scope=all')
        .expect(200);

      for (const b of res.body.items) {
        expect(b.eventTypeId).toBe('intro-30');
      }
    });

    it('GET /admin/bookings with pagination', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/bookings?limit=1&offset=0&scope=all')
        .expect(200);

      expect(res.body.items.length).toBeLessThanOrEqual(1);
      expect(res.body.limit).toBe(1);
      expect(res.body.offset).toBe(0);
    });
  });
});
