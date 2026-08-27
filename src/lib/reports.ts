import { prisma } from "@/lib/prisma";
import { dayKey } from "@/lib/date-range";
import type { SalesReport, PurchasesReport, StockReport, DailyPoint, TopProductRow, StockReportRow } from "@/types/models";

export async function getSalesReport(gte: Date, lte: Date): Promise<SalesReport> {
  const sales = await prisma.sale.findMany({
    where: { date: { gte, lte } },
    include: { items: { include: { product: true } } },
  });

  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total), 0);
  const totalDiscount = sales.reduce((sum, s) => sum + Number(s.discount), 0);
  const totalTransactions = sales.length;

  const dailyMap = new Map<string, number>();
  const productMap = new Map<string, TopProductRow>();
  let totalItemsSold = 0;

  for (const sale of sales) {
    const key = dayKey(sale.date);
    dailyMap.set(key, (dailyMap.get(key) ?? 0) + Number(sale.total));
    for (const item of sale.items) {
      totalItemsSold += Number(item.qty);
      const existing = productMap.get(item.productId);
      if (existing) {
        existing.qty += Number(item.qty);
        existing.total += Number(item.subtotal);
      } else {
        productMap.set(item.productId, {
          productId: item.productId,
          name: item.product.name,
          sku: item.product.sku,
          qty: Number(item.qty),
          total: Number(item.subtotal),
        });
      }
    }
  }

  const daily: DailyPoint[] = [...dailyMap.entries()].map(([date, total]) => ({ date, total })).sort((a, b) => a.date.localeCompare(b.date));
  const topProducts = [...productMap.values()].sort((a, b) => b.total - a.total).slice(0, 10);

  return { totalRevenue, totalTransactions, totalItemsSold, totalDiscount, daily, topProducts };
}

export async function getPurchasesReport(gte: Date, lte: Date): Promise<PurchasesReport> {
  const purchases = await prisma.purchase.findMany({
    where: { date: { gte, lte } },
    include: { items: { include: { product: true } } },
  });

  const totalSpend = purchases.reduce((sum, p) => sum + Number(p.total), 0);
  const totalTransactions = purchases.length;

  const dailyMap = new Map<string, number>();
  const productMap = new Map<string, TopProductRow>();
  let totalItemsBought = 0;

  for (const purchase of purchases) {
    const key = dayKey(purchase.date);
    dailyMap.set(key, (dailyMap.get(key) ?? 0) + Number(purchase.total));
    for (const item of purchase.items) {
      totalItemsBought += Number(item.qty);
      const existing = productMap.get(item.productId);
      if (existing) {
        existing.qty += Number(item.qty);
        existing.total += Number(item.subtotal);
      } else {
        productMap.set(item.productId, {
          productId: item.productId,
          name: item.product.name,
          sku: item.product.sku,
          qty: Number(item.qty),
          total: Number(item.subtotal),
        });
      }
    }
  }

  const daily: DailyPoint[] = [...dailyMap.entries()].map(([date, total]) => ({ date, total })).sort((a, b) => a.date.localeCompare(b.date));
  const topProducts = [...productMap.values()].sort((a, b) => b.total - a.total).slice(0, 10);

  return { totalSpend, totalTransactions, totalItemsBought, daily, topProducts };
}

export async function getStockReport(): Promise<StockReport> {
  const products = await prisma.product.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });

  const rows: StockReportRow[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    unit: p.unit,
    stock: Number(p.stock),
    minStock: Number(p.minStock),
    buyPrice: Number(p.buyPrice),
    stockValue: Number(p.stock) * Number(p.buyPrice),
  }));

  const totalStockValue = rows.reduce((sum, r) => sum + r.stockValue, 0);
  const lowStockCount = rows.filter((r) => r.stock <= r.minStock).length;

  return { totalProducts: rows.length, totalStockValue, lowStockCount, rows };
}
