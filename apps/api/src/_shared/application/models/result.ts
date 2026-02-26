export type Ok<T> = { ok: true; value: T };
export type Err<E extends string> = { ok: false; error: E };
export type Result<T, E extends string> = Ok<T> | Err<E>;
