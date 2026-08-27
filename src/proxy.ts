import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

// Halaman yang hanya boleh diakses role ADMIN.
const ADMIN_ONLY_PREFIXES = [
  "/produk",
  "/pembelian",
  "/opname",
  "/pengeluaran",
  "/laporan",
  "/users",
  "/print/pembelian",
  "/print/laporan",
];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isLoginPage = nextUrl.pathname === "/login";

  if (!isLoggedIn && !isLoginPage) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/", nextUrl.origin));
  }

  const role = req.auth?.user?.role;
  const isAdminOnly = ADMIN_ONLY_PREFIXES.some((prefix) => nextUrl.pathname.startsWith(prefix));
  if (isAdminOnly && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
