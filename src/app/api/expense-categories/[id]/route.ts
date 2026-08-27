import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiAdmin } from "@/lib/api-auth";
import { handleApiError } from "@/lib/api-error";
import { expenseCategorySchema } from "@/lib/validations/expense";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireApiAdmin();
  if (error) return error;
  const { id } = await params;

  try {
    const body = expenseCategorySchema.parse(await req.json());
    const category = await prisma.expenseCategory.update({ where: { id }, data: body });
    return NextResponse.json(category);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }
    return handleApiError(err, "Gagal mengubah kategori pengeluaran.");
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireApiAdmin();
  if (error) return error;
  const { id } = await params;

  try {
    await prisma.expenseCategory.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err, "Gagal menghapus kategori. Pastikan tidak ada pengeluaran yang memakainya.");
  }
}
