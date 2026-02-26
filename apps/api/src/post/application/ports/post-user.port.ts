export interface PostUserPort {
  isActive(userId: string): Promise<boolean>;
}
