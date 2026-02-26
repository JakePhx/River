import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import { ProfileRecord } from '../../../application/profile/models/profile.models';
import { UserRecord } from 'src/application/user/models/user.models';

export const seedProfile = async (
  prisma: PrismaClient,
  users: UserRecord[],
) => {
  const profiles: ProfileRecord[] = [];
  for (const user of users) {
    const profile = await prisma.profile.create({
      data: {
        userId: user.id,
        name: faker.person.fullName(),
        avatarUrl: faker.image.url(),
      },
    });
  }
  return profiles;
};
