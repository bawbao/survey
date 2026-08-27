import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { PaymentMethod } from "@/types/models";

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  CASH: "Tunai",
  TRANSFER: "Transfer",
  QRIS: "QRIS",
  OTHER: "Lainnya",
};

export default async function PrintPenjualanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: { user: true, items: { include: { product: true } } },
  });
  if (!sale) notFound();

  return (
    <div className="py-8 px-6 flex justify-center">
      <div className="w-full max-w-[320px] text-gray-900 text-sm font-mono">
        <div className="text-center mb-4">
          <p className="font-bold text-base">GROSIR SNACK</p>
          <p className="text-xs text-gray-500">Struk Penjualan</p>
        </div>

        <div className="border-t border-dashed border-gray-400 my-2" />

        <div className="text-xs space-y-0.5 mb-2">
          <div className="flex justify-between">
            <span>No.</span>
            <span>{sale.invoiceNo}</span>
          </div>
          <div className="flex justify-between">
            <span>Tanggal</span>
            <span>{formatDateTime(sale.date)}</span>
          </div>
          <div className="flex justify-between">
            <span>Kasir</span>
            <span>{sale.user.name}</span>
          </div>
          {sale.customerName && (
            <div className="flex justify-between">
              <span>Pelanggan</span>
              <span>{sale.customerName}</span>
            </div>
          )}
        </div>

        <div className="border-t border-dashed border-gray-400 my-2" />

        <div className="space-y-1.5 text-xs">
          {sale.items.map((item) => (
            <div key={item.id}>
              <p>{item.product.name}</p>
              <div className="flex justify-between text-gray-600">
                <span>
                  {item.qty.toString()} x {formatCurrency(item.sellPrice)}
                </span>
                <span>{formatCurrency(item.subtotal)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed border-gray-400 my-2" />

        <div className="text-xs space-y-0.5">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(sale.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Diskon</span>
            <span>- {formatCurrency(sale.discount)}</span>
          </div>
          <div className="flex justify-between font-bold text-sm pt-1">
            <span>TOTAL</span>
            <span>{formatCurrency(sale.total)}</span>
          </div>
          <div className="flex justify-between text-gray-600 pt-1">
            <span>Bayar</span>
            <span>{PAYMENT_LABEL[sale.paymentMethod]}</span>
          </div>
        </div>

        <div className="border-t border-dashed border-gray-400 my-3" />

        <p className="text-center text-xs text-gray-500">Terima kasih atas kunjungan Anda!</p>
      </div>
    </div>
  );
}
