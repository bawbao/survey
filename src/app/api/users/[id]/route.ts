import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireApiAdmin } from "@/lib/api-auth";
import { handleApiError } from "@/lib/api-error";
import { updateUserSchema } from "@/lib/validations/user";

const userSelect = { id: true, name: true, email: true, role: true, isActive: true, createdAt: true } as const;

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user: currentUser, error } = await requireApiAdmin();
  if (error) return error;
  const { id } = await params;

  try {
    const body = updateUserSchema.parse(await req.json());

    if (id === currentUser!.id && (body.role === "KASIR" || body.isActive === false)) {
      return NextResponse.json({ error: "Tidak dapat mengubah peran atau menonaktifkan akun sendiri." }, { status: 400 });
    }

    const data: Record<string, unknown> = { ...body };
    if (body.password) {
      data.passwordHash = await bcrypt.hash(body.password, 10);
    }
    delete data.password;

    const user = await prisma.user.update({ where: { id }, data, select: userSelect });
    return NextResponse.json(user);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }
    return handleApiError(err, "Gagal mengubah pengguna.");
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user: currentUser, error } = await requireApiAdmin();
  if (error) return error;
  const { id } = await params;

  if (id === currentUser!.id) {
    return NextResponse.json({ error: "Tidak dapat menonaktifkan akun sendiri." }, { status: 400 });
  }

  try {
    const user = await prisma.user.update({ where: { id }, data: { isActive: false }, select: userSelect });
    return NextResponse.json(user);
  } catch (err) {
    return handleApiError(err, "Gagal menonaktifkan pengguna.");
  }
}
