import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

import { PostRecord } from 'src/application/post/models/post.models';
import { UserRecord } from 'src/application/user/models/user.models';

export const seedPost = async (
  prisma: PrismaClient,
  users: UserRecord[],
  postCount = 2,
) => {
  const posts: PostRecord[] = [];
  for (const user of users) {
    for (let i = 0; i < postCount; i++) {
      const post = await prisma.post.create({
        data: {
          authorId: user.id,
          content: faker.lorem.sentence(),
        },
      });
      posts.push(post);
    }
  }
  return posts;
};
