import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireApiAdmin } from "@/lib/api-auth";
import { handleApiError } from "@/lib/api-error";
import { createUserSchema } from "@/lib/validations/user";

const userSelect = { id: true, name: true, email: true, role: true, isActive: true, createdAt: true } as const;

export async function GET() {
  const { error } = await requireApiAdmin();
  if (error) return error;

  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" }, select: userSelect });
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const { error } = await requireApiAdmin();
  if (error) return error;

  try {
    const body = createUserSchema.parse(await req.json());
    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({
      data: { name: body.name, email: body.email, role: body.role, passwordHash },
      select: userSelect,
    });
    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }
    return handleApiError(err, "Gagal menambah pengguna.");
  }
}
