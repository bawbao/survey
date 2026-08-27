import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/api-auth";
import { getStockReport } from "@/lib/reports";

export async function GET() {
  const { error } = await requireApiAdmin();
  if (error) return error;

  const report = await getStockReport();
  return NextResponse.json(report);
}
