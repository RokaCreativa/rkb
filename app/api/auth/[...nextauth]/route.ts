import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // Buscar usuario sin verificar contraseña primero
          const user = await prisma.usuarios.findFirst({
            where: { 
              us_email: credentials?.email 
            }
          })

          console.log('Usuario encontrado:', user)

          if (!user) {
            console.log('No se encontró el usuario')
            return null
          }

          // Verificar contraseña
          const isValid = user.us_contrasena === credentials?.password
          console.log('Contraseña válida:', isValid)
          console.log('Contraseña proporcionada:', credentials?.password)
          console.log('Contraseña en DB:', user.us_contrasena)

          if (!isValid) {
            console.log('Contraseña inválida')
            return null
          }

          console.log('Login exitoso')
          return {
            id: user.us_cd_usuario,
            email: user.us_email,
            name: user.us_nombreusuario
          }
        } catch (error) {
          console.error('Error en authorize:', error)
          return null
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/signin'
  }
})

export { handler as GET, handler as POST } 