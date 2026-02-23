// DTO (query params - used only at controller layer)
export type CursorPageRequestDto = {
  cursor?: string;
  limit?: number;
};

// Response (API output)
export type CursorPageRes<T> = {
  items: T[];
  nextCursor: string | null;
};
