export interface PostRepoPort {
  createPostTx(
    authorId: string,
    content: string,
  ): Promise<{ id: string; content: string; createdAt: Date }>;
  feed(userId: string): Promise<
    Array<{
      id: string;
      authorId: string;
      username: string;
      content: string;
      createdAt: Date;
    }>
  >;
}
