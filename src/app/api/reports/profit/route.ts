import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/api-auth";
import { parseDateRange } from "@/lib/date-range";
import { getProfitReport } from "@/lib/reports";

// Khusus Admin — data modal & margin tidak boleh terlihat oleh Kasir.
export async function GET(req: Request) {
  const { error } = await requireApiAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const { gte, lte } = parseDateRange(searchParams);
  const report = await getProfitReport(gte, lte);
  return NextResponse.json(report);
}
