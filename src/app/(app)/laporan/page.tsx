import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/layout/PageHeader";
import { LaporanClient } from "./LaporanClient";

export default async function LaporanPage() {
  await requireAdmin();

  return (
    <div>
      <PageHeader title="Laporan" description="Ringkasan penjualan, pembelian, stok, dan laba per periode." />
      <LaporanClient />
    </div>
  );
}
