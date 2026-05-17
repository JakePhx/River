import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { seedUser } from './user';
import { seedPost } from './post';

const adapter = new PrismaPg({
  connectionString: process.env['DATABASE_URL']!,
});

const prisma = new PrismaClient({ adapter });

export async function main() {
  try {
    const userCount = await prisma.user.count();

    if (userCount > 0) {
      console.log('Database already seeded, skipping...');
      return;
    }

    console.log('Seeding database...');

    const users = await seedUser(prisma, 200);

    await seedPost(prisma, users);

    console.log('Seed completed');
  } finally {
    await prisma.$disconnect();
  }
}
