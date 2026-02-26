import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { UserRecord } from '../../../application/user/models/user.models';

export const seedUser = async (prisma: PrismaClient, userCount: number) => {
  const users: UserRecord[] = [];
  for (let i = 0; i < userCount; i += 1) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        username: faker.internet.username(),
        password: await bcrypt.hash('password', 10),
        role: 'USER',
        isPrivate: false,
        isActive: true,
        postCount: 0,
        followersCount: 0,
        followingCount: 0,
      },
    });
    users.push(user);
  }
  return users;
};
