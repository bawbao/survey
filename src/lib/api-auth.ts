import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function requireApiUser() {
  const session = await auth();
  if (!session?.user) {
    return { user: null, error: NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 }) };
  }
  return { user: session.user, error: null };
}

export async function requireApiAdmin() {
  const { user, error } = await requireApiUser();
  if (error) return { user: null, error };
  if (user!.role !== "ADMIN") {
    return { user: null, error: NextResponse.json({ error: "Hanya admin yang dapat melakukan aksi ini." }, { status: 403 }) };
  }
  return { user, error: null };
}
