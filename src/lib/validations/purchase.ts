import { z } from "zod";

export const purchaseItemSchema = z.object({
  productId: z.string().min(1),
  qty: z.coerce.number().positive("Jumlah harus lebih dari 0"),
  buyPrice: z.coerce.number().min(0),
});

export const purchaseSchema = z.object({
  supplierId: z.string().optional().nullable(),
  date: z.string().optional(),
  note: z.string().trim().max(500).optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  items: z.array(purchaseItemSchema).min(1, "Tambahkan minimal 1 barang"),
});

export type PurchaseInput = z.infer<typeof purchaseSchema>;
