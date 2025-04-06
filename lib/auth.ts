import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./prisma";
import { compare } from "bcrypt";
// O la ruta relativa que corresponda


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

// Definir tipo de usuario personalizado
type CustomUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  client_id?: number;
};

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
          throw new Error("Email y contraseña son requeridos");
        }

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
          throw new Error("Usuario no encontrado");
        }

        if (typeof user.status === 'number' && user.status !== 1) {
          throw new Error("Usuario inactivo");
        }

        // Verificar contraseña
        if (!user.password) {
          throw new Error("Error en las credenciales");
        }

        const passwordMatch = await compare(credentials.password, user.password);
        if (!passwordMatch) {
          throw new Error("Contraseña incorrecta");
        }

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
