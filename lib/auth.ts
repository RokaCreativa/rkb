import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/prisma/prisma";
// O la ruta relativa que corresponda


// Extender tipos de NextAuth
declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
  }
  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    role: string;
  }
}

// Definir tipo de usuario personalizado
type CustomUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt" as const,
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<CustomUser | null> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Buscar usuario por email en la base de datos
        const user = await prisma.users.findFirst({
          where: { email: credentials.email },
        });

        // Validar credenciales
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
  },
};
