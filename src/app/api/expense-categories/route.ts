import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiAdmin } from "@/lib/api-auth";
import { handleApiError } from "@/lib/api-error";
import { expenseCategorySchema } from "@/lib/validations/expense";

// Khusus Admin — data pengeluaran tidak boleh terlihat oleh Kasir.
export async function GET() {
  const { error } = await requireApiAdmin();
  if (error) return error;

  const categories = await prisma.expenseCategory.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { expenses: true } } },
  });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const { error } = await requireApiAdmin();
  if (error) return error;

  try {
    const body = expenseCategorySchema.parse(await req.json());
    const category = await prisma.expenseCategory.create({ data: body });
    return NextResponse.json(category, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }
    return handleApiError(err, "Gagal menambah kategori pengeluaran.");
  }
}
