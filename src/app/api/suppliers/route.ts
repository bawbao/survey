import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiAdmin, requireApiUser } from "@/lib/api-auth";
import { handleApiError } from "@/lib/api-error";
import { supplierSchema } from "@/lib/validations/supplier";

export async function GET() {
  const { error } = await requireApiUser();
  if (error) return error;

  const suppliers = await prisma.supplier.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(suppliers);
}

export async function POST(req: Request) {
  const { error } = await requireApiAdmin();
  if (error) return error;

  try {
    const body = supplierSchema.parse(await req.json());
    const supplier = await prisma.supplier.create({ data: body });
    return NextResponse.json(supplier, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }
    return handleApiError(err, "Gagal menambah supplier.");
  }
}
