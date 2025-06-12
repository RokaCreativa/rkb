/**
 * @fileoverview Authentication Configuration for NextAuth
 * @description This file defines the authentication options for NextAuth.js,
 *              including the credentials provider, session strategy, and callbacks
 *              for handling JWT and session logic.
 * @module lib/auth
 */
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./prisma";
import { compare } from "bcrypt";
// O la ruta relativa que corresponda

// Definir tipo de usuario personalizado
type CustomUser = {
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
      async authorize(credentials): Promise<CustomUser | null> {
        if (!credentials?.email || !credentials?.password) {
          console.log("Email y contraseña son requeridos");
          throw new Error("Email y contraseña son requeridos");
        }

        console.log(`Intentando autenticar: ${credentials.email}`);

        // Buscar usuario por email
        const user = await prisma.users.findFirst({
          where: { email: credentials.email },
          select: {
            user_id: true,
            username: true,
            email: true,
            password: true,
            profile: true,
            client_id: true,
            status: true
          }
        });

        if (!user) {
          console.log(`Usuario no encontrado: ${credentials.email}`);
          throw new Error("Usuario no encontrado");
        }

        console.log(`Usuario encontrado: ${user.email}, ID: ${user.user_id}`);
        console.log(`Contraseña almacenada: ${user.password}`);
        console.log(`Contraseña ingresada: ${credentials.password}`);

        if (typeof user.status === 'number' && user.status !== 1) {
          console.log(`Usuario inactivo: ${user.email}, status: ${user.status}`);
          throw new Error("Usuario inactivo");
        }

        // Verificar contraseña
        if (!user.password) {
          console.log(`Error en las credenciales: ${user.email}, no tiene contraseña`);
          throw new Error("Error en las credenciales");
        }

        // Comparación directa de contraseñas en lugar de usar bcrypt
        const passwordMatch = user.password === credentials.password;
        console.log(`Resultado de comparación de contraseña: ${passwordMatch ? "Correcta" : "Incorrecta"}`);

        if (!passwordMatch) {
          throw new Error("Contraseña incorrecta");
        }

        console.log(`Autenticación exitosa para: ${user.email}`);

        return {
          id: user.user_id,
          name: user.username || "",
          email: user.email,
          role: user.profile || "user",
          client_id: user.client_id || undefined,
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
        token.client_id = user.client_id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        name: session.user.name ?? "",
        email: token.email,
        role: token.role,
        client_id: token.client_id,
      };
      return session;
    },
  },
};
