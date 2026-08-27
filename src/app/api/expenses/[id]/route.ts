import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiAdmin } from "@/lib/api-auth";
import { handleApiError } from "@/lib/api-error";
import { expenseSchema } from "@/lib/validations/expense";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireApiAdmin();
  if (error) return error;
  const { id } = await params;

  try {
    const body = expenseSchema.parse(await req.json());
    const expense = await prisma.expense.update({
      where: { id },
      data: {
        categoryId: body.categoryId,
        amount: body.amount,
        date: body.date ? new Date(body.date) : undefined,
        note: body.note,
      },
      include: { category: true, user: { select: { name: true } } },
    });
    return NextResponse.json(expense);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }
    return handleApiError(err, "Gagal mengubah pengeluaran.");
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireApiAdmin();
  if (error) return error;
  const { id } = await params;

  try {
    await prisma.expense.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err, "Gagal menghapus pengeluaran.");
  }
}
