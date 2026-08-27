import { requireAdmin } from "@/lib/session";
import { parseDateRange } from "@/lib/date-range";
import { getSalesReport, getPurchasesReport, getStockReport, getProfitReport } from "@/lib/reports";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";

type SearchParams = { type?: string; from?: string; to?: string };
type ReportType = "penjualan" | "pembelian" | "laba" | "stok";

const TYPE_LABEL: Record<ReportType, string> = {
  penjualan: "Penjualan",
  pembelian: "Pembelian",
  laba: "Laba",
  stok: "Stok",
};

export default async function PrintLaporanPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();

  const sp = await searchParams;
  const type: ReportType =
    sp.type === "pembelian" || sp.type === "laba" || sp.type === "stok" ? sp.type : "penjualan";

  const params = new URLSearchParams();
  if (sp.from) params.set("from", sp.from);
  if (sp.to) params.set("to", sp.to);
  const { gte, lte } = parseDateRange(params);
  const periodLabel = `${formatDate(gte)} — ${formatDate(lte)}`;

  return (
    <div className="p-8 sm:p-10 text-sm text-gray-900">
      <div className="border-b border-gray-300 pb-4 mb-6">
        <h1 className="text-lg font-bold">Grosir Snack</h1>
        <p className="text-gray-500">
          Laporan {TYPE_LABEL[type]}
          {type !== "stok" && ` · Periode ${periodLabel}`}
        </p>
      </div>

      {type === "penjualan" && <SalesReportPrint gte={gte} lte={lte} />}
      {type === "pembelian" && <PurchasesReportPrint gte={gte} lte={lte} />}
      {type === "laba" && <ProfitReportPrint gte={gte} lte={lte} />}
      {type === "stok" && <StockReportPrint />}

      <p className="text-center text-xs text-gray-400 mt-10">Dicetak dari Aplikasi Kasir &amp; Stok Grosir Snack</p>
    </div>
  );
}

async function SalesReportPrint({ gte, lte }: { gte: Date; lte: Date }) {
  const report = await getSalesReport(gte, lte);
  return (
    <>
      <SummaryGrid
        items={[
          ["Total Pendapatan", formatCurrency(report.totalRevenue)],
          ["Jumlah Transaksi", formatNumber(report.totalTransactions)],
          ["Barang Terjual", formatNumber(report.totalItemsSold)],
          ["Total Diskon", formatCurrency(report.totalDiscount)],
        ]}
      />
      <h2 className="font-semibold mb-2 mt-6">Produk Terlaris</h2>
      <ProductTable rows={report.topProducts} />
    </>
  );
}

async function PurchasesReportPrint({ gte, lte }: { gte: Date; lte: Date }) {
  const report = await getPurchasesReport(gte, lte);
  return (
    <>
      <SummaryGrid
        items={[
          ["Total Pembelian", formatCurrency(report.totalSpend)],
          ["Jumlah Transaksi", formatNumber(report.totalTransactions)],
          ["Barang Dibeli", formatNumber(report.totalItemsBought)],
        ]}
      />
      <h2 className="font-semibold mb-2 mt-6">Barang Paling Banyak Dibeli</h2>
      <ProductTable rows={report.topProducts} />
    </>
  );
}

async function ProfitReportPrint({ gte, lte }: { gte: Date; lte: Date }) {
  const report = await getProfitReport(gte, lte);
  return (
    <>
      <SummaryGrid
        items={[
          ["Laba Kotor", formatCurrency(report.totalProfit)],
          ["Margin Laba", `${report.marginPercent.toFixed(1)}%`],
          ["Total Pendapatan", formatCurrency(report.totalRevenue)],
          ["Total Modal", formatCurrency(report.totalCost)],
        ]}
      />
      <h2 className="font-semibold mb-2 mt-6">Produk Paling Menguntungkan</h2>
      {report.topProducts.length === 0 ? (
        <p className="text-gray-500">Tidak ada data pada periode ini.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-800">
              <th className="text-left font-semibold py-2">Produk</th>
              <th className="text-right font-semibold py-2">Jumlah</th>
              <th className="text-right font-semibold py-2">Pendapatan</th>
              <th className="text-right font-semibold py-2">Modal</th>
              <th className="text-right font-semibold py-2">Laba</th>
            </tr>
          </thead>
          <tbody>
            {report.topProducts.map((r) => (
              <tr key={r.productId} className="border-b border-gray-200">
                <td className="py-2">
                  {r.name} <span className="text-gray-500">({r.sku})</span>
                </td>
                <td className="py-2 text-right">{formatNumber(r.qty)}</td>
                <td className="py-2 text-right">{formatCurrency(r.revenue)}</td>
                <td className="py-2 text-right">{formatCurrency(r.cost)}</td>
                <td className="py-2 text-right font-semibold">{formatCurrency(r.profit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

async function StockReportPrint() {
  const report = await getStockReport();
  return (
    <>
      <SummaryGrid
        items={[
          ["Total Produk Aktif", formatNumber(report.totalProducts)],
          ["Nilai Stok (Harga Beli)", formatCurrency(report.totalStockValue)],
          ["Barang Menipis", formatNumber(report.lowStockCount)],
        ]}
      />
      <h2 className="font-semibold mb-2 mt-6">Rincian Stok</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-gray-800">
            <th className="text-left font-semibold py-2">Produk</th>
            <th className="text-right font-semibold py-2">Stok</th>
            <th className="text-right font-semibold py-2">Nilai Stok</th>
          </tr>
        </thead>
        <tbody>
          {report.rows.map((r) => (
            <tr key={r.id} className="border-b border-gray-200">
              <td className="py-2">
                {r.name} <span className="text-gray-500">({r.sku})</span>
              </td>
              <td className="py-2 text-right">
                {formatNumber(r.stock)} {r.unit}
              </td>
              <td className="py-2 text-right">{formatCurrency(r.stockValue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function SummaryGrid({ items }: { items: [string, string][] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
      {items.map(([label, value]) => (
        <div key={label} className="border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">{label}</p>
          <p className="font-bold">{value}</p>
        </div>
      ))}
    </div>
  );
}

function ProductTable({ rows }: { rows: { productId: string; name: string; sku: string; qty: number; total: number }[] }) {
  if (rows.length === 0) return <p className="text-gray-500">Tidak ada data pada periode ini.</p>;
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b-2 border-gray-800">
          <th className="text-left font-semibold py-2">Produk</th>
          <th className="text-right font-semibold py-2">Jumlah</th>
          <th className="text-right font-semibold py-2">Total</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.productId} className="border-b border-gray-200">
            <td className="py-2">
              {r.name} <span className="text-gray-500">({r.sku})</span>
            </td>
            <td className="py-2 text-right">{formatNumber(r.qty)}</td>
            <td className="py-2 text-right">{formatCurrency(r.total)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
