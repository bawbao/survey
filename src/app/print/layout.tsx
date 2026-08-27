import type { ReactNode } from "react";
import { requireUser } from "@/lib/session";
import { PrintBar } from "./PrintBar";

export default async function PrintLayout({ children }: { children: ReactNode }) {
  await requireUser();
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <PrintBar />
      <div className="max-w-2xl mx-auto bg-white shadow-sm print:shadow-none print:max-w-none">{children}</div>
    </div>
  );
}
