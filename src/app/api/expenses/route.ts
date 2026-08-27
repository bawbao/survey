import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiAdmin } from "@/lib/api-auth";
import { handleApiError } from "@/lib/api-error";
import { expenseSchema } from "@/lib/validations/expense";
import type { Prisma } from "@/generated/prisma/client";

// Khusus Admin — pengeluaran (gaji, sewa, dll) adalah data sensitif, tidak boleh terlihat Kasir.
export async function GET(req: Request) {
  const { error } = await requireApiAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const categoryId = searchParams.get("categoryId");

  const where: Prisma.ExpenseWhereInput = {};
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from);
    if (to) where.date.lte = new Date(`${to}T23:59:59.999Z`);
  }
  if (categoryId) where.categoryId = categoryId;

  const expenses = await prisma.expense.findMany({
    where,
    orderBy: { date: "desc" },
    include: { category: true, user: { select: { name: true } } },
    take: 200,
  });

  return NextResponse.json(expenses);
}

export async function POST(req: Request) {
  const { user, error } = await requireApiAdmin();
  if (error) return error;

  try {
    const body = expenseSchema.parse(await req.json());
    const expense = await prisma.expense.create({
      data: {
        categoryId: body.categoryId,
        amount: body.amount,
        date: body.date ? new Date(body.date) : new Date(),
        note: body.note,
        userId: user!.id,
      },
      include: { category: true, user: { select: { name: true } } },
    });
    return NextResponse.json(expense, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }
    return handleApiError(err, "Gagal menambah pengeluaran.");
  }
}
