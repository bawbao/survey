import { z } from "zod";

export const productSchema = z.object({
  sku: z.string().trim().min(1, "SKU wajib diisi").max(50),
  barcode: z
    .string()
    .trim()
    .max(50)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  name: z.string().trim().min(1, "Nama produk wajib diisi").max(200),
  categoryId: z.string().optional().nullable(),
  unit: z.string().trim().min(1).max(20).default("pcs"),
  buyPrice: z.coerce.number().min(0),
  sellPrice: z.coerce.number().min(0),
  stock: z.coerce.number().min(0).default(0),
  minStock: z.coerce.number().min(0).default(0),
  isActive: z.boolean().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
