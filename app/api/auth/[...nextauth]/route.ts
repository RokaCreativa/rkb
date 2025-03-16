import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

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

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Se requieren credenciales")
        }

        try {
          const user = await prisma.usuarios.findFirst({
            where: { 
              us_email: credentials.email,
            }
          })

          if (!user) {
            throw new Error("Usuario no encontrado")
          }

          const isValid = user.us_contrasena === credentials.password
          
          if (!isValid) {
            throw new Error("Contraseña incorrecta")
          }

          // Es importante retornar un objeto que coincida EXACTAMENTE con la interfaz User
          return {
            id: String(user.us_cd_usuario),
            email: user.us_email || '',
            name: user.us_nombreusuario || '',
            role: user.us_perfil || ''
          }

        } catch (error) {
          console.error('Error en autenticación:', error)
          throw error
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
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin'
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 días
  },
  debug: process.env.NODE_ENV === 'development'
})

export { handler as GET, handler as POST }