import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(150),
  email: z.string().trim().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["ADMIN", "KASIR"]),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(1).max(150).optional(),
  email: z.string().trim().email("Email tidak valid").optional(),
  role: z.enum(["ADMIN", "KASIR"]).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(6, "Password minimal 6 karakter").optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
});
