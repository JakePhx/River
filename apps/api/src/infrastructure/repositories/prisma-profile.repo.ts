import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileRepoPort } from '../../application/profile/ports/profile-repo.port';

@Injectable()
export class PrismaProfileRepo implements ProfileRepoPort {
  constructor(private readonly prisma: PrismaService) {}

  getByUserId(userId: string) {
    return this.prisma.profile.findUnique({
      where: { userId },
      select: { userId: true, name: true, avatarUrl: true },
    });
  }

  upsertByUserId(
    userId: string,
    data: { name?: string | null; avatarUrl?: string | null },
  ) {
    return this.prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        name: data.name ?? null,
        avatarUrl: data.avatarUrl ?? null,
      },
      update: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
      },
      select: { userId: true, name: true, avatarUrl: true },
    });
  }
}
