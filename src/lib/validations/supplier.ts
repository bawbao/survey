import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().trim().min(1, "Nama supplier wajib diisi").max(150),
  phone: z.string().trim().max(30).optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  address: z.string().trim().max(300).optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
});

export type SupplierInput = z.infer<typeof supplierSchema>;
