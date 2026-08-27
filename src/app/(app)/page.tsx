import Link from "next/link";
import { Wallet, Receipt, AlertTriangle, Plus, Truck, ClipboardCheck, ScanBarcode } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatNumber } from "@/lib/format";
import { getSalesReport, getStockReport } from "@/lib/reports";
import { dayKey } from "@/lib/date-range";
import { requireUser } from "@/lib/session";
import { StatCard } from "./laporan/StatCard";
import { DailyBarChart } from "./laporan/DailyBarChart";

export default async function DashboardPage() {
  const user = await requireUser();

  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [weekReport, stockReport] = await Promise.all([getSalesReport(sevenDaysAgo, now), getStockReport()]);

  const todayKey = dayKey(now);
  const todayPoint = weekReport.daily.find((d) => d.date === todayKey);
  const todayTotal = todayPoint?.total ?? 0;

  const lowStockRows = stockReport.rows.filter((r) => r.stock <= r.minStock).slice(0, 8);

  return (
    <div>
      <PageHeader title={`Halo, ${(user.name ?? "Pengguna").split(" ")[0]} 👋`} description="Ringkasan toko hari ini." />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard icon={Wallet} label="Pendapatan Hari Ini" value={formatCurrency(todayTotal)} />
        <StatCard icon={Receipt} label="Transaksi 7 Hari" value={formatNumber(weekReport.totalTransactions)} />
        <StatCard icon={AlertTriangle} label="Barang Menipis" value={formatNumber(stockReport.lowStockCount)} tone="amber" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader title="Tren Penjualan 7 Hari Terakhir" />
          <div className="px-5 sm:px-6 pb-5 pt-2">
            <DailyBarChart data={weekReport.daily} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Aksi Cepat" />
          <CardBody className="space-y-2.5">
            <LinkButton href="/penjualan/baru" className="w-full">
              <ScanBarcode className="h-4 w-4" /> Penjualan Baru
            </LinkButton>
            {user.role === "ADMIN" && (
              <>
                <LinkButton href="/pembelian/baru" variant="outline" className="w-full">
                  <Truck className="h-4 w-4" /> Pembelian Baru
                </LinkButton>
                <LinkButton href="/opname" variant="outline" className="w-full">
                  <ClipboardCheck className="h-4 w-4" /> Stok Opname
                </LinkButton>
                <LinkButton href="/produk" variant="outline" className="w-full">
                  <Plus className="h-4 w-4" /> Tambah Produk
                </LinkButton>
              </>
            )}
          </CardBody>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader title="Barang Perlu Direstock" subtitle="Stok saat ini sudah di bawah atau sama dengan batas minimum." />
        {lowStockRows.length === 0 ? (
          <EmptyState icon={AlertTriangle} title="Semua stok aman" description="Tidak ada barang yang perlu direstock saat ini." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-background text-muted text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left font-medium px-5 py-3">Produk</th>
                  <th className="text-right font-medium px-5 py-3">Stok Saat Ini</th>
                  <th className="text-right font-medium px-5 py-3">Stok Minimum</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {lowStockRows.map((r) => (
                  <tr key={r.id} className="hover:bg-background/60">
                    <td className="px-5 py-3">
                      <p className="font-medium text-foreground">{r.name}</p>
                      <p className="text-xs text-muted">{r.sku}</p>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums font-semibold">
                      {formatNumber(r.stock)} {r.unit}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-muted">
                      {formatNumber(r.minStock)} {r.unit}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/stok/${r.id}`} className="text-sm font-medium text-brand-700 hover:text-brand-800">
                        Lihat
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {stockReport.lowStockCount > lowStockRows.length && (
          <div className="px-5 py-3 border-t border-border text-center">
            <Badge tone="amber">+{stockReport.lowStockCount - lowStockRows.length} barang lainnya menipis</Badge>
          </div>
        )}
      </Card>
    </div>
  );
}
