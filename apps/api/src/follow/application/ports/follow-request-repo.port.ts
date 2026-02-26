export interface FollowRequestRepo {
  exists(requesterId: string, requestedId: string): Promise<boolean>;
  create(requesterId: string, requestedId: string): Promise<void>;
  delete(requesterId: string, requestedId: string): Promise<void>;
}
