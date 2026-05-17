/** Normalize API / Prisma dates for Redux (store ISO strings only). */
export function toIsoTimestamp(value: string | Date): string {
  if (typeof value === "string") return value;
  return value.toISOString();
}

export function timeAgo(isoOrDate: string | Date): string {
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (Number.isNaN(s)) return d.toLocaleString();
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const days = Math.floor(h / 24);
  return `${days}d`;
}
