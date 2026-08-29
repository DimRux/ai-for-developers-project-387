import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.owner.findFirst();
  if (!existing) {
    await prisma.owner.create({
      data: {
        name: process.env.OWNER_NAME || 'Владелец календаря',
        email: process.env.OWNER_EMAIL || 'owner@example.com',
        timezone: process.env.OWNER_TIMEZONE || 'Europe/Moscow',
        workingHoursStart: process.env.OWNER_WORKING_HOURS_START || '10:00:00',
        workingHoursEnd: process.env.OWNER_WORKING_HOURS_END || '19:00:00',
        slotStepMinutes: parseInt(process.env.OWNER_SLOT_STEP_MINUTES || '30', 10),
        bookingWindowDays: parseInt(process.env.OWNER_BOOKING_WINDOW_DAYS || '14', 10),
      },
    });
    console.log('Owner seeded');
  }

  if (process.env.SEED_DEMO === 'true') {
    const count = await prisma.eventType.count();
    if (count === 0) {
      await prisma.eventType.createMany({
        data: [
          {
            id: 'intro-30',
            title: 'Встреча-знакомство',
            description:
              'Короткая встреча для знакомства и обсуждения первичных требований.',
            durationMinutes: 30,
          },
          {
            id: 'deep-dive-60',
            title: 'Детальное обсуждение',
            description:
              'Развёрнутая встреча для глубокого обсуждения деталей проекта.',
            durationMinutes: 60,
          },
        ],
      });
      console.log('Demo event types seeded');
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
