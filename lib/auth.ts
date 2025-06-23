/**
 * @fileoverview Authentication Configuration - CERO SEGURIDAD PARA PRUEBAS
 * @description Solo verifica que el usuario exista. SIN contraseñas, SIN validaciones.
 * @module lib/auth
 */
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./prisma";

// Tipos simplificados
type SimpleUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  client_id?: number;
};

// Extender tipos de NextAuth
declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    client_id?: number;
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
    client_id?: number;
  }
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<SimpleUser | null> {
        // 🧪 CERO SEGURIDAD: Solo verificar que el email exista
        if (!credentials?.email) {
          throw new Error("Email es requerido");
        }

        try {
          // Solo buscar usuario por email - SIN verificar contraseña
          const user = await prisma.users.findFirst({
            where: { email: credentials.email },
            select: {
              user_id: true,
              username: true,
              email: true,
              profile: true,
              client_id: true,
            }
          });

          if (!user) {
            throw new Error("Usuario no encontrado");
          }

          // ✅ Si existe el usuario = login automático
          console.log(`🧪 LOGIN AUTOMÁTICO: ${user.email}`);

          return {
            id: user.user_id,
            name: user.username || "Usuario Test",
            email: user.email,
            role: user.profile || "user",
            client_id: user.client_id || undefined,
          };
        } catch (error) {
          console.error("Error buscando usuario:", error);
          throw new Error("Usuario no encontrado");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.client_id = user.client_id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        name: session.user.name ?? "Usuario Test",
        email: token.email,
        role: token.role,
        client_id: token.client_id,
      };
      return session;
    },
  },
};
