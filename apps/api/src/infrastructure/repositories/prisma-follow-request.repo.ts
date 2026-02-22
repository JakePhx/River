import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FollowRequestRepoPort } from '../../application/follow/ports/follow-request-repo.port';

@Injectable()
export class PrismaFollowRequestRepo implements FollowRequestRepoPort {
  constructor(private readonly prisma: PrismaService) {}

  async exists(requesterId: string, requestedId: string) {
    const row = await this.prisma.followRequest.findUnique({
      where: { requesterId_requestedId: { requesterId, requestedId } },
      select: { requesterId: true },
    });
    return !!row;
  }

  create(requesterId: string, requestedId: string) {
    return this.prisma.followRequest
      .create({ data: { requesterId, requestedId } })
      .then(() => {});
  }

  delete(requesterId: string, requestedId: string) {
    return this.prisma.followRequest
      .delete({
        where: { requesterId_requestedId: { requesterId, requestedId } },
      })
      .then(() => {});
  }
}
