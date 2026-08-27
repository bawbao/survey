import { prisma } from "@/lib/prisma";
import { dayKey } from "@/lib/date-range";
import type {
  SalesReport,
  PurchasesReport,
  StockReport,
  ProfitReport,
  ProfitProductRow,
  ExpenseCategoryTotal,
  DailyPoint,
  TopProductRow,
  StockReportRow,
} from "@/types/models";

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

// Laba kotor = pendapatan penjualan - modal (harga beli x jumlah) - diskon.
// Modal memakai snapshot `buyPriceAtSale` yang dicatat saat transaksi terjadi;
// untuk transaksi lama sebelum kolom itu ada, jatuh balik ke harga beli
// produk saat ini sebagai perkiraan.
export async function getProfitReport(gte: Date, lte: Date): Promise<ProfitReport> {
  const sales = await prisma.sale.findMany({
    where: { date: { gte, lte } },
    include: { items: { include: { product: true } } },
  });

  const totalDiscount = sales.reduce((sum, s) => sum + Number(s.discount), 0);

  const dailyMap = new Map<string, number>();
  const productMap = new Map<string, ProfitProductRow>();
  let totalRevenue = 0;
  let totalCost = 0;

  for (const sale of sales) {
    let saleProfit = 0;
    for (const item of sale.items) {
      const revenue = Number(item.subtotal);
      const buyPrice = item.buyPriceAtSale !== null ? Number(item.buyPriceAtSale) : Number(item.product.buyPrice);
      const cost = buyPrice * Number(item.qty);
      const profit = revenue - cost;

      totalRevenue += revenue;
      totalCost += cost;
      saleProfit += profit;

      const existing = productMap.get(item.productId);
      if (existing) {
        existing.qty += Number(item.qty);
        existing.revenue += revenue;
        existing.cost += cost;
        existing.profit += profit;
      } else {
        productMap.set(item.productId, {
          productId: item.productId,
          name: item.product.name,
          sku: item.product.sku,
          qty: Number(item.qty),
          revenue,
          cost,
          profit,
        });
      }
    }

    const key = dayKey(sale.date);
    // Diskon transaksi dialokasikan ke laba hari itu (bukan per barang).
    dailyMap.set(key, (dailyMap.get(key) ?? 0) + saleProfit - Number(sale.discount));
  }

  const totalProfit = totalRevenue - totalCost - totalDiscount;
  const marginPercent = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  const daily: DailyPoint[] = [...dailyMap.entries()].map(([date, total]) => ({ date, total })).sort((a, b) => a.date.localeCompare(b.date));
  const topProducts = [...productMap.values()].sort((a, b) => b.profit - a.profit).slice(0, 10);

  // Laba bersih = laba kotor - pengeluaran operasional (gaji, sewa, transport, dll) periode ini.
  const expenses = await prisma.expense.findMany({
    where: { date: { gte, lte } },
    include: { category: true },
  });

  const expenseCategoryMap = new Map<string, ExpenseCategoryTotal>();
  let totalExpenses = 0;
  for (const exp of expenses) {
    const amount = Number(exp.amount);
    totalExpenses += amount;
    const existing = expenseCategoryMap.get(exp.categoryId);
    if (existing) {
      existing.total += amount;
    } else {
      expenseCategoryMap.set(exp.categoryId, { categoryId: exp.categoryId, name: exp.category.name, total: amount });
    }
  }
  const expensesByCategory = [...expenseCategoryMap.values()].sort((a, b) => b.total - a.total);

  const netProfit = totalProfit - totalExpenses;
  const netMarginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return {
    totalRevenue,
    totalCost,
    totalDiscount,
    totalProfit,
    marginPercent,
    totalExpenses,
    netProfit,
    netMarginPercent,
    expensesByCategory,
    daily,
    topProducts,
  };
}
