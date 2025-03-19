import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "../../../prisma/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse("No autorizado", { status: 401 })
    }

    const roles = await prisma.Role.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(roles)
  } catch (error) {
    console.error('Error al obtener roles:', error)
    return new NextResponse("Error interno del servidor", { status: 500 })
  }
} 