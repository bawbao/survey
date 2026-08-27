import { z } from "zod";

export const expenseCategorySchema = z.object({
  name: z.string().trim().min(1, "Nama kategori wajib diisi").max(100),
});

export const expenseSchema = z.object({
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  amount: z.coerce.number().positive("Jumlah harus lebih dari 0"),
  date: z.string().optional(),
  note: z.string().trim().max(300).optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
});
