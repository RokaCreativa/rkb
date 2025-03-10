import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

/**
 * Obtiene la lista de idiomas desde la base de datos.
 * @returns {NextResponse} JSON con la lista de idiomas o un mensaje de error.
 */
export async function GET() {
  try {
    const idiomas = await prisma.idiomas.findMany();
    return NextResponse.json(idiomas, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo idiomas:", error);
    return NextResponse.json({ error: "Error obteniendo idiomas" }, { status: 500 });
  }
}
