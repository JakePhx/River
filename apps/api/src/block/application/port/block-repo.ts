export interface BlockRepo {
  exists(params: { blockerId: string; blockedId: string }): Promise<boolean>;
  blockTx(params: { blockerId: string; blockedId: string }): Promise<void>;
  unblock(params: { blockerId: string; blockedId: string }): Promise<void>;
}
