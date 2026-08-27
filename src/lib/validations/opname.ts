import { z } from "zod";

export const createOpnameSchema = z.object({
  note: z.string().trim().max(500).optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  categoryId: z.string().optional().nullable(),
});

export const updateOpnameItemsSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        actualQty: z.coerce.number().min(0).nullable(),
        note: z.string().trim().max(300).optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
      }),
    )
    .min(1),
});
