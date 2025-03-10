import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/prisma/prisma"; // Asegúrate de que esta ruta es correcta
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

// Inicializa Prisma Client
const prismaClient = new PrismaClient();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "email@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Falta email o contraseña en la solicitud");
          throw new Error("Debe proporcionar un email y una contraseña.");
        }

        try {
          // Buscar el usuario en la base de datos
          const user = await prismaClient.usuarios.findUnique({
            where: { us_email: credentials.email },
          });

          console.log("🔍 Usuario encontrado en DB:", user);

          if (!user) {
            console.log("❌ Usuario no encontrado");
            throw new Error("Correo o contraseña incorrectos.");
          }

          // Validar la contraseña con bcrypt
          const isPasswordValid = await bcrypt.compare(credentials.password, user.us_contrasena);
          if (!isPasswordValid) {
            console.log("❌ Contraseña incorrecta");
            throw new Error("Correo o contraseña incorrectos.");
          }

          console.log("✅ Usuario autenticado:", user.us_email);

          return {
            id: String(user.us_cd_usuario), // Se asegura que sea string
            email: user.us_email,
            name: user.us_nombreusuario,
            role: String(user.role_id), // Se asegura que sea string
          };
        } catch (error) {
          console.error("🔴 Error en autenticación:", error);
          throw new Error("Error al autenticar usuario.");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = String(user.id); // Asegura que sea string
        token.role = String(user.role); // Asegura que sea string
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
