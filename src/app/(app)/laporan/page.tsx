import { PageHeader } from "@/components/layout/PageHeader";
import { LaporanClient } from "./LaporanClient";

export default function LaporanPage() {
  return (
    <div>
      <PageHeader title="Laporan" description="Ringkasan penjualan, pembelian, dan stok per periode." />
      <LaporanClient />
    </div>
  );
}
