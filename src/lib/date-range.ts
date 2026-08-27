export function parseDateRange(searchParams: URLSearchParams) {
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const now = new Date();
  const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1);
  const defaultTo = now;

  const gte = from ? new Date(from) : defaultFrom;
  gte.setHours(0, 0, 0, 0);

  const lte = to ? new Date(`${to}T23:59:59.999`) : new Date(defaultTo);
  if (!to) lte.setHours(23, 59, 59, 999);

  return { gte, lte };
}

export function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}
