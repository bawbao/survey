import bcrypt from "bcryptjs";
import type { PrismaClient } from "@/generated/prisma/client";

/**
 * Data awal (akun contoh, kategori, supplier, produk contoh). Dipakai baik
 * oleh `prisma/seed.ts` (untuk `npm run db:seed` di lokal) maupun endpoint
 * setup satu-kali `/api/setup` (untuk isi data awal langsung dari browser
 * setelah deploy, tanpa perlu Node.js di komputer).
 */
export async function seedInitialData(prisma: PrismaClient) {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const kasirPassword = await bcrypt.hash("kasir123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@grosir.local" },
    update: {},
    create: { name: "Admin Toko", email: "admin@grosir.local", passwordHash: adminPassword, role: "ADMIN" },
  });

  await prisma.user.upsert({
    where: { email: "kasir@grosir.local" },
    update: {},
    create: { name: "Kasir Toko", email: "kasir@grosir.local", passwordHash: kasirPassword, role: "KASIR" },
  });

  const categoryNames = ["Keripik & Kerupuk", "Biskuit & Wafer", "Permen & Coklat", "Minuman Sachet", "Mie Instan"];
  const categories: Record<string, string> = {};
  for (const name of categoryNames) {
    const cat = await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
    categories[name] = cat.id;
  }

  const supplier = await prisma.supplier.upsert({
    where: { id: "seed-supplier-1" },
    update: {},
    create: {
      id: "seed-supplier-1",
      name: "PT Sumber Rejeki Snack",
      phone: "081234567890",
      address: "Jl. Industri No. 10, Jakarta",
    },
  });

  const products = [
    { sku: "SNK-001", barcode: "8991001000017", name: "Keripik Singkong Balado 100g", category: "Keripik & Kerupuk", unit: "pcs", buyPrice: 5000, sellPrice: 7000, stock: 100, minStock: 20 },
    { sku: "SNK-002", barcode: "8991001000024", name: "Kerupuk Udang 250g", category: "Keripik & Kerupuk", unit: "pcs", buyPrice: 8000, sellPrice: 11000, stock: 60, minStock: 15 },
    { sku: "SNK-003", barcode: "8991001000031", name: "Biskuit Coklat Sandwich", category: "Biskuit & Wafer", unit: "pcs", buyPrice: 3000, sellPrice: 4500, stock: 150, minStock: 30 },
    { sku: "SNK-004", barcode: "8991001000048", name: "Wafer Vanilla Roll", category: "Biskuit & Wafer", unit: "pcs", buyPrice: 2500, sellPrice: 4000, stock: 12, minStock: 20 },
    { sku: "SNK-005", barcode: "8991001000055", name: "Coklat Batang Susu 65g", category: "Permen & Coklat", unit: "pcs", buyPrice: 6000, sellPrice: 9000, stock: 80, minStock: 15 },
    { sku: "SNK-006", barcode: "8991001000062", name: "Permen Mint Kaleng", category: "Permen & Coklat", unit: "kaleng", buyPrice: 9000, sellPrice: 13000, stock: 40, minStock: 10 },
    { sku: "SNK-007", barcode: "8991001000079", name: "Minuman Sachet Rasa Jeruk", category: "Minuman Sachet", unit: "sachet", buyPrice: 800, sellPrice: 1500, stock: 300, minStock: 50 },
    { sku: "SNK-008", barcode: "8991001000086", name: "Mie Instan Goreng Pedas", category: "Mie Instan", unit: "pcs", buyPrice: 2800, sellPrice: 3800, stock: 5, minStock: 24 },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        sku: p.sku,
        barcode: p.barcode,
        name: p.name,
        categoryId: categories[p.category],
        unit: p.unit,
        buyPrice: p.buyPrice,
        sellPrice: p.sellPrice,
        stock: p.stock,
        minStock: p.minStock,
      },
    });
  }

  // --- Kategori pengeluaran contoh (bisa ditambah/diubah Admin nanti) ---
  const expenseCategoryNames = ["Gaji Karyawan", "Sewa Tempat", "Transportasi", "Listrik & Air", "Lainnya"];
  for (const name of expenseCategoryNames) {
    await prisma.expenseCategory.upsert({ where: { name }, update: {}, create: { name } });
  }

  return { admin, supplier, productCount: products.length };
}
