import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/api-auth";
import { parseDateRange } from "@/lib/date-range";
import { getPurchasesReport } from "@/lib/reports";

export async function GET(req: Request) {
  const { error } = await requireApiAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const { gte, lte } = parseDateRange(searchParams);
  const report = await getPurchasesReport(gte, lte);
  return NextResponse.json(report);
}
