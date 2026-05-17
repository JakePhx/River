export enum EVENT_TYPE {
  POST_CREATED = 'post.created',
  POST_COMMENTED = 'post.commented',
  FOLLOW_RECEIVED = 'follow.received',
  FOLLOW_REQUEST_ACCEPTED = 'follow.request.accepted',
  CHAT_REQUEST_ACCEPTED = 'chat.request.accepted',
}

export type EventType = (typeof EVENT_TYPE)[keyof typeof EVENT_TYPE];

export type Event<T, E extends EventType> = {
  eventId: string;
  type: E;
  occurredAt: Date;
  payload: T;
};

export * from './post-created.event.payload';
export * from './post-commented.event.payload';
export * from './follow-received.event.payload';
export * from './follow-request-accepted.event.payload';
export * from './chat-request-accepted.event.payload';
