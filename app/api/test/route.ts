import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const user = await prisma.usuarios.findFirst({
      where: {
        us_email: "bakery@bakery.com"
      }
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error al buscar usuario" }, { status: 500 })
  }
} 