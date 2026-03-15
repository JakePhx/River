export enum EVENT_TYPE {
  POST_CREATED = 'post.created',
}

export type EventType = (typeof EVENT_TYPE)[keyof typeof EVENT_TYPE];

export type Event<T, E extends EventType> = {
  eventId: string;
  type: E;
  occurredAt: Date;
  payload: T;
};

export * from './post-created.event.payload';
