import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Intentar obtener el usuario específico sin ninguna relación
    const user = await prisma.$queryRaw`SELECT * FROM usuarios WHERE us_email = 'bakery@bakery.com'`;

    return NextResponse.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
      errorObject: error
    }, { status: 500 });
  }
} 