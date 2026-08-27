"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatNumber } from "@/lib/format";
import {
  Wallet,
  Receipt,
  Package,
  AlertTriangle,
  Boxes,
  ShoppingBag,
  Printer,
  TrendingUp,
  Percent,
  MinusCircle,
  PiggyBank,
} from "lucide-react";
import { PeriodFilter, presetPeriod, type Period } from "./PeriodFilter";
import { StatCard } from "./StatCard";
import { DailyBarChart } from "./DailyBarChart";
import type { SalesReport, PurchasesReport, StockReport, ProfitReport } from "@/types/models";

type Tab = "penjualan" | "pembelian" | "laba" | "stok";

export function LaporanClient() {
  const [tab, setTab] = useState<Tab>("penjualan");
  const [period, setPeriod] = useState<Period>(presetPeriod("month"));

  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [purchasesReport, setPurchasesReport] = useState<PurchasesReport | null>(null);
  const [stockReport, setStockReport] = useState<StockReport | null>(null);
  const [profitReport, setProfitReport] = useState<ProfitReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tab === "stok") {
      setLoading(true);
      fetch("/api/reports/stock")
        .then((r) => r.json())
        .then(setStockReport)
        .finally(() => setLoading(false));
      return;
    }
    setLoading(true);
    const params = new URLSearchParams({ from: period.from, to: period.to });
    const endpoint =
      tab === "penjualan" ? "/api/reports/sales" : tab === "pembelian" ? "/api/reports/purchases" : "/api/reports/profit";
    const setter = tab === "penjualan" ? setSalesReport : tab === "pembelian" ? setPurchasesReport : setProfitReport;
    fetch(`${endpoint}?${params.toString()}`)
      .then((r) => r.json())
      .then(setter)
      .finally(() => setLoading(false));
  }, [tab, period]);

  const printHref =
    tab === "stok" ? "/print/laporan?type=stok" : `/print/laporan?type=${tab}&from=${period.from}&to=${period.to}`;

  const tabs: { key: Tab; label: string }[] = [
    { key: "penjualan", label: "Penjualan" },
    { key: "pembelian", label: "Pembelian" },
    { key: "laba", label: "Laba" },
    { key: "stok", label: "Stok" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-xl border border-border overflow-hidden text-sm">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 font-medium ${tab === t.key ? "bg-brand-600 text-white" : "bg-surface text-foreground"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <LinkButton href={printHref} variant="outline">
          <Printer className="h-4 w-4" /> Cetak Laporan
        </LinkButton>
      </div>

      {tab !== "stok" && <PeriodFilter period={period} onChange={setPeriod} />}

      {loading && <div className="text-center text-sm text-muted py-10">Memuat laporan...</div>}

      {!loading && tab === "penjualan" && salesReport && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Wallet} label="Total Pendapatan" value={formatCurrency(salesReport.totalRevenue)} />
            <StatCard icon={Receipt} label="Jumlah Transaksi" value={formatNumber(salesReport.totalTransactions)} />
            <StatCard icon={ShoppingBag} label="Barang Terjual" value={formatNumber(salesReport.totalItemsSold)} />
            <StatCard icon={Package} label="Total Diskon" value={formatCurrency(salesReport.totalDiscount)} tone="amber" />
          </div>
          <Card>
            <CardHeader title="Tren Penjualan Harian" />
            <div className="px-5 sm:px-6 pb-5 pt-2">
              <DailyBarChart data={salesReport.daily} />
            </div>
          </Card>
          <Card className="overflow-hidden">
            <CardHeader title="Produk Terlaris" />
            <TopProductsTable rows={salesReport.topProducts} />
          </Card>
        </>
      )}

      {!loading && tab === "pembelian" && purchasesReport && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard icon={Wallet} label="Total Pembelian" value={formatCurrency(purchasesReport.totalSpend)} />
            <StatCard icon={Receipt} label="Jumlah Transaksi" value={formatNumber(purchasesReport.totalTransactions)} />
            <StatCard icon={Package} label="Barang Dibeli" value={formatNumber(purchasesReport.totalItemsBought)} />
          </div>
          <Card>
            <CardHeader title="Tren Pembelian Harian" />
            <div className="px-5 sm:px-6 pb-5 pt-2">
              <DailyBarChart data={purchasesReport.daily} />
            </div>
          </Card>
          <Card className="overflow-hidden">
            <CardHeader title="Barang Paling Banyak Dibeli" />
            <TopProductsTable rows={purchasesReport.topProducts} />
          </Card>
        </>
      )}

      {!loading && tab === "laba" && profitReport && (
        <>
          <div className="flex items-center justify-between -mt-1">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">Laba Kotor</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Wallet} label="Total Pendapatan" value={formatCurrency(profitReport.totalRevenue)} />
            <StatCard icon={Package} label="Total Modal" value={formatCurrency(profitReport.totalCost)} tone="amber" />
            <StatCard icon={TrendingUp} label="Laba Kotor" value={formatCurrency(profitReport.totalProfit)} />
            <StatCard icon={Percent} label="Margin Kotor" value={`${profitReport.marginPercent.toFixed(1)}%`} />
          </div>

          <div className="flex items-center justify-between pt-2">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">Laba Bersih</h3>
            <LinkButton href="/pengeluaran" variant="outline" size="sm">
              <Receipt className="h-4 w-4" /> Kelola Pengeluaran
            </LinkButton>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard icon={MinusCircle} label="Total Pengeluaran" value={formatCurrency(profitReport.totalExpenses)} tone="amber" />
            <StatCard
              icon={PiggyBank}
              label="Laba Bersih"
              value={formatCurrency(profitReport.netProfit)}
              tone={profitReport.netProfit >= 0 ? "brand" : "danger"}
            />
            <StatCard
              icon={Percent}
              label="Margin Bersih"
              value={`${profitReport.netMarginPercent.toFixed(1)}%`}
              tone={profitReport.netProfit >= 0 ? "brand" : "danger"}
            />
          </div>

          <Card>
            <CardHeader title="Tren Laba Kotor Harian" />
            <div className="px-5 sm:px-6 pb-5 pt-2">
              <DailyBarChart data={profitReport.daily} />
            </div>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader title="Rincian Pengeluaran per Kategori" />
            {profitReport.expensesByCategory.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-muted">Belum ada pengeluaran pada periode ini.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-background text-muted text-xs uppercase tracking-wide">
                    <tr>
                      <th className="text-left font-medium px-5 py-3">Kategori</th>
                      <th className="text-right font-medium px-5 py-3">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {profitReport.expensesByCategory.map((c) => (
                      <tr key={c.categoryId}>
                        <td className="px-5 py-3 font-medium text-foreground">{c.name}</td>
                        <td className="px-5 py-3 text-right tabular-nums font-semibold">{formatCurrency(c.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card className="overflow-hidden">
            <CardHeader title="Produk Paling Menguntungkan" subtitle="Berdasarkan laba kotor, sebelum dikurangi pengeluaran operasional." />
            {profitReport.topProducts.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-muted">Belum ada data pada periode ini.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-background text-muted text-xs uppercase tracking-wide">
                    <tr>
                      <th className="text-left font-medium px-5 py-3">Produk</th>
                      <th className="text-right font-medium px-5 py-3">Jumlah</th>
                      <th className="text-right font-medium px-5 py-3">Pendapatan</th>
                      <th className="text-right font-medium px-5 py-3">Modal</th>
                      <th className="text-right font-medium px-5 py-3">Laba</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {profitReport.topProducts.map((r) => (
                      <tr key={r.productId}>
                        <td className="px-5 py-3">
                          <p className="font-medium text-foreground">{r.name}</p>
                          <p className="text-xs text-muted">{r.sku}</p>
                        </td>
                        <td className="px-5 py-3 text-right tabular-nums">{formatNumber(r.qty)}</td>
                        <td className="px-5 py-3 text-right tabular-nums">{formatCurrency(r.revenue)}</td>
                        <td className="px-5 py-3 text-right tabular-nums text-muted">{formatCurrency(r.cost)}</td>
                        <td className="px-5 py-3 text-right tabular-nums font-semibold text-brand-700">
                          {formatCurrency(r.profit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}

      {!loading && tab === "stok" && stockReport && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard icon={Boxes} label="Total Produk Aktif" value={formatNumber(stockReport.totalProducts)} />
            <StatCard icon={Wallet} label="Nilai Stok (Harga Beli)" value={formatCurrency(stockReport.totalStockValue)} />
            <StatCard icon={AlertTriangle} label="Barang Menipis" value={formatNumber(stockReport.lowStockCount)} tone="amber" />
          </div>
          <Card className="overflow-hidden">
            <CardHeader title="Rincian Stok" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-background text-muted text-xs uppercase tracking-wide">
                  <tr>
                    <th className="text-left font-medium px-5 py-3">Produk</th>
                    <th className="text-right font-medium px-5 py-3">Stok</th>
                    <th className="text-right font-medium px-5 py-3">Nilai Stok</th>
                    <th className="text-left font-medium px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stockReport.rows.map((r) => (
                    <tr key={r.id}>
                      <td className="px-5 py-3">
                        <p className="font-medium text-foreground">{r.name}</p>
                        <p className="text-xs text-muted">{r.sku}</p>
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">
                        {formatNumber(r.stock)} {r.unit}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums font-medium">{formatCurrency(r.stockValue)}</td>
                      <td className="px-5 py-3">
                        {r.stock <= r.minStock ? <Badge tone="amber">Menipis</Badge> : <Badge tone="brand">Aman</Badge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function TopProductsTable({ rows }: { rows: SalesReport["topProducts"] }) {
  if (rows.length === 0) {
    return <div className="px-5 py-8 text-center text-sm text-muted">Belum ada data pada periode ini.</div>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-background text-muted text-xs uppercase tracking-wide">
          <tr>
            <th className="text-left font-medium px-5 py-3">Produk</th>
            <th className="text-right font-medium px-5 py-3">Jumlah</th>
            <th className="text-right font-medium px-5 py-3">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r) => (
            <tr key={r.productId}>
              <td className="px-5 py-3">
                <p className="font-medium text-foreground">{r.name}</p>
                <p className="text-xs text-muted">{r.sku}</p>
              </td>
              <td className="px-5 py-3 text-right tabular-nums">{formatNumber(r.qty)}</td>
              <td className="px-5 py-3 text-right tabular-nums font-medium">{formatCurrency(r.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
