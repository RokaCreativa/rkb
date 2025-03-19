import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"
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

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }