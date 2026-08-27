import { z } from "zod";

export const saleItemSchema = z.object({
  productId: z.string().min(1),
  qty: z.coerce.number().positive("Jumlah harus lebih dari 0"),
  sellPrice: z.coerce.number().min(0),
});

export const saleSchema = z.object({
  customerName: z.string().trim().max(150).optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  discount: z.coerce.number().min(0).default(0),
  paymentMethod: z.enum(["CASH", "TRANSFER", "QRIS", "OTHER"]).default("CASH"),
  note: z.string().trim().max(500).optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  items: z.array(saleItemSchema).min(1, "Tambahkan minimal 1 barang"),
});

export type SaleInput = z.infer<typeof saleSchema>;
