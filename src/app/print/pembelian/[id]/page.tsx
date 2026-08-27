import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDateTime } from "@/lib/format";

export default async function PrintPembelianPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const purchase = await prisma.purchase.findUnique({
    where: { id },
    include: { supplier: true, user: true, items: { include: { product: true } } },
  });
  if (!purchase) notFound();

  return (
    <div className="p-8 sm:p-10 text-sm text-gray-900">
      <div className="flex items-start justify-between border-b border-gray-300 pb-4 mb-4">
        <div>
          <h1 className="text-lg font-bold">Grosir Snack</h1>
          <p className="text-gray-500">Bukti Pembelian Barang</p>
        </div>
        <div className="text-right">
          <p className="font-semibold">{purchase.invoiceNo}</p>
          <p className="text-gray-500">{formatDateTime(purchase.date)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Supplier</p>
          <p className="font-medium">{purchase.supplier?.name ?? "—"}</p>
          {purchase.supplier?.phone && <p className="text-gray-500">{purchase.supplier.phone}</p>}
          {purchase.supplier?.address && <p className="text-gray-500">{purchase.supplier.address}</p>}
        </div>
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Dicatat Oleh</p>
          <p className="font-medium">{purchase.user.name}</p>
        </div>
      </div>

      <table className="w-full text-sm mb-6">
        <thead>
          <tr className="border-b-2 border-gray-800">
            <th className="text-left font-semibold py-2">Barang</th>
            <th className="text-right font-semibold py-2">Jumlah</th>
            <th className="text-right font-semibold py-2">Harga</th>
            <th className="text-right font-semibold py-2">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {purchase.items.map((item) => (
            <tr key={item.id} className="border-b border-gray-200">
              <td className="py-2">
                {item.product.name}
                <span className="text-gray-500"> ({item.product.sku})</span>
              </td>
              <td className="py-2 text-right">
                {item.qty.toString()} {item.product.unit}
              </td>
              <td className="py-2 text-right">{formatCurrency(item.buyPrice)}</td>
              <td className="py-2 text-right">{formatCurrency(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="text-right font-semibold pt-3">
              TOTAL
            </td>
            <td className="text-right font-bold text-base pt-3">{formatCurrency(purchase.total)}</td>
          </tr>
        </tfoot>
      </table>

      {purchase.note && (
        <div className="mb-6">
          <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Catatan</p>
          <p>{purchase.note}</p>
        </div>
      )}

      <p className="text-center text-xs text-gray-400 mt-10">Dicetak dari Aplikasi Kasir &amp; Stok Grosir Snack</p>
    </div>
  );
}
