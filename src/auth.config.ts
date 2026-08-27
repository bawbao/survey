import type { NextAuthConfig } from "next-auth";

// Config shared between the full auth.ts (Node.js runtime, has the
// Credentials/Prisma provider) and middleware.ts (Edge runtime, providers-free).
// Keeping this file free of Prisma/bcrypt imports keeps middleware Edge-compatible.
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role?: "ADMIN" | "KASIR" }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "KASIR";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
