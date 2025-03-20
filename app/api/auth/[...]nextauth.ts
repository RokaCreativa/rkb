import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/prisma/prisma";
// O la ruta relativa que corresponda

import { authOptions } from "@/lib/auth";

export default NextAuth({
  ...authOptions,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "Email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Buscar usuario por email
        const user = await prisma.users.findFirst({
          where: { email: credentials.email },
        });

        if (!user || user.password !== credentials.password) {
          return null;
        }

        return {
          id: user.user_code,
          name: user.username ?? "",
          email: user.email ?? "",
          role: user.profile ?? "user",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        name: session.user.name ?? "",
        email: token.email,
        role: token.role,
      };
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redirigir al dashboard tras iniciar sesión exitosamente
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return `${baseUrl}/dashboard`;
    },
  },
});
