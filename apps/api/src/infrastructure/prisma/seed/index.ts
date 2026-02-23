import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { seedUser } from './user';
import { seedProfile } from './profile';
import { seedPost } from './post';

const databaseURL = 'postgresql://admin:admin123@localhost:5432/linktree';

const adapter = new PrismaPg({
  connectionString: databaseURL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await seedUser(prisma, 10);

  await seedProfile(prisma, users);

  await seedPost(prisma, users);

  console.log('Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
