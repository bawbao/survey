import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";

export function handleApiError(err: unknown, fallback = "Terjadi kesalahan. Silakan coba lagi.") {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const target = (err.meta?.target as string[] | undefined)?.join(", ") ?? "data";
      return NextResponse.json({ error: `${target} sudah digunakan, gunakan nilai lain.` }, { status: 409 });
    }
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Data tidak ditemukan." }, { status: 404 });
    }
    if (err.code === "P2003") {
      return NextResponse.json({ error: "Data ini masih digunakan oleh data lain dan tidak dapat dihapus." }, { status: 409 });
    }
  }
  console.error(err);
  return NextResponse.json({ error: fallback }, { status: 500 });
}
