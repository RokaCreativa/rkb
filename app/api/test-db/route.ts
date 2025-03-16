import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Intentar obtener un usuario
    const user = await prisma.usuarios.findFirst({
      where: {
        us_email: "bakery@bakery.com"
      }
    })

    if (user) {
      // No devolvemos la contraseña por seguridad
      const { us_contrasena, ...userWithoutPassword } = user
      return NextResponse.json({ 
        success: true, 
        message: "Conexión exitosa",
        user: userWithoutPassword 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        message: "No se encontró el usuario de prueba" 
      })
    }
  } catch (error) {
    console.error("Error de conexión:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Error de conexión a la base de datos",
      error: error instanceof Error ? error.message : "Error desconocido"
    }, { status: 500 })
  }
} 