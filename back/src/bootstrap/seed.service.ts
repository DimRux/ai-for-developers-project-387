import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Ensures the singleton Owner profile (and optional demo event types) exist on
 * every application start. This runs in-process, so it works reliably in any
 * environment (Docker, Render, local) without depending on ts-node or a
 * tsconfig being present in the runtime image.
 */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.ensureOwner();
    await this.ensureDemoEventTypes();
  }

  private async ensureOwner(): Promise<void> {
    const existing = await this.prisma.owner.findFirst();
    if (existing) return;

    await this.prisma.owner.create({
      data: {
        name: this.config.get<string>('OWNER_NAME', 'Владелец календаря'),
        email: this.config.get<string>('OWNER_EMAIL', 'owner@example.com'),
        timezone: this.config.get<string>('OWNER_TIMEZONE', 'Europe/Moscow'),
        workingHoursStart: this.config.get<string>('OWNER_WORKING_HOURS_START', '10:00:00'),
        workingHoursEnd: this.config.get<string>('OWNER_WORKING_HOURS_END', '19:00:00'),
        slotStepMinutes: parseInt(this.config.get<string>('OWNER_SLOT_STEP_MINUTES', '30'), 10),
        bookingWindowDays: parseInt(this.config.get<string>('OWNER_BOOKING_WINDOW_DAYS', '14'), 10),
      },
    });
    this.logger.log('Owner profile seeded');
  }

  private async ensureDemoEventTypes(): Promise<void> {
    if (this.config.get<string>('SEED_DEMO') !== 'true') return;

    const count = await this.prisma.eventType.count();
    if (count > 0) return;

    await this.prisma.eventType.createMany({
      data: [
        {
          id: 'intro-30',
          title: 'Встреча-знакомство',
          description: 'Короткая встреча для знакомства и обсуждения первичных требований.',
          durationMinutes: 30,
        },
        {
          id: 'deep-dive-60',
          title: 'Детальное обсуждение',
          description: 'Развёрнутая встреча для глубокого обсуждения деталей проекта.',
          durationMinutes: 60,
        },
      ],
    });
    this.logger.log('Demo event types seeded');
  }
}
