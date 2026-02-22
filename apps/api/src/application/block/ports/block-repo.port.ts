export interface BlockRepoPort {
  exists(blockerId: string, blockedId: string): Promise<boolean>;
  blockTx(blockerId: string, blockedId: string): Promise<void>;
  unblock(blockerId: string, blockedId: string): Promise<void>;
}
