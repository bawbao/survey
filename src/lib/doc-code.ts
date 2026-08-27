function todayCode(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

/**
 * Membuat kode dokumen unik & mudah dibaca, mis. "PB-20260827-0001".
 * `countToday` adalah jumlah dokumen dengan prefix sama yang sudah dibuat hari ini.
 */
export function buildDocCode(prefix: string, countToday: number): string {
  return `${prefix}-${todayCode()}-${String(countToday + 1).padStart(4, "0")}`;
}
