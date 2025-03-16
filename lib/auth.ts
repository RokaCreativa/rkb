import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"

// Extender los tipos de NextAuth
declare module "next-auth" {
  interface User {
    id: string
    email: string
    name: string
    role: string
  }
  
  interface Session {
    user: User
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string
    name: string
    role: string
  }
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt'
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Faltan credenciales')
          return null
        }

        const user = await prisma.usuarios.findFirst({
          where: {
            us_email: credentials.email
          }
        })

        if (!user) {
          console.log('Usuario no encontrado')
          return null
        }

        // En desarrollo, comparamos directamente la contraseña
        const isPasswordValid = credentials.password === user.us_contrasena

        if (!isPasswordValid) {
          console.log('Contraseña inválida')
          return null
        }

        return {
          id: user.us_cd_usuario,
          email: user.us_email || '',
          name: user.us_nombreusuario || '',
          role: user.us_perfil
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.email = token.email || ''
        session.user.name = token.name || ''
        session.user.role = token.role
      }
      return session
    }
  }
} 