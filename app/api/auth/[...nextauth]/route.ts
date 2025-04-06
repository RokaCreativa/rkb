import NextAuth from "next-auth"
import { authOptions } from "../../../../lib/auth"

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