import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"

// Extender los tipos de NextAuth para incluir role
declare module "next-auth" {
  interface User {
    id: string
    name: string
    email: string
    role: string
  }
  
  interface Session {
    user: User
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role?: string
  }
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        // Simplemente usa el usuario y contraseña proporcionados
        // para crear un objeto de usuario básico
        return {
          id: "1",
          name: credentials.username,
          email: `${credentials.username}@example.com`,
          role: "user" // Añadir un rol por defecto
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.role = token.role as string
      }
      return session
    },
  },
} 