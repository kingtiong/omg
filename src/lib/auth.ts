import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import type { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 12 }, // 12h
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });
        if (!user || !user.active) return null;

        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          customerId: user.customerId ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id: string }).id;
        token.role = (user as { role: Role }).role;
        token.customerId = (user as { customerId: string | null }).customerId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: Role }).role = token.role as Role;
        (session.user as { customerId?: string | null }).customerId =
          (token.customerId as string | null) ?? null;
      }
      return session;
    },
  },
};

export function dashboardPathForRole(role: Role): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "CUSTOMER":
      return "/portal";
    case "DELIVERY":
      return "/delivery";
    default:
      return "/";
  }
}
