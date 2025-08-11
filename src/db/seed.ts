import prisma from './client';
import logger from '../config/logger';

async function main() {
  logger.info('Starting database seed...');

  // Create a test user
  const user = await prisma.user.upsert({
    where: { appleSub: 'test_apple_sub_123' },
    update: {},
    create: {
      appleSub: 'test_apple_sub_123',
      email: 'test@example.com',
      profile: {
        create: {
          name: 'Test User',
          birthDate: new Date('1990-01-01'),
          zodiacSign: 'capricorn',
        },
      },
    },
  });

  // Create some test mood entries
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  await prisma.moodEntry.upsert({
    where: { userId_date: { userId: user.id, date: today } },
    update: {},
    create: {
      userId: user.id,
      date: today,
      moodLevel: 4,
      eventLabel: 'Great day!',
    },
  });

  await prisma.moodEntry.upsert({
    where: { userId_date: { userId: user.id, date: yesterday } },
    update: {},
    create: {
      userId: user.id,
      date: yesterday,
      moodLevel: 3,
      eventLabel: 'Normal day',
    },
  });

  logger.info('Database seed completed');
}

main()
  .catch((e) => {
    logger.error(e, 'Error during seed');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
