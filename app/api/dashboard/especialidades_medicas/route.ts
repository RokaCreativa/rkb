import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

/**
 * Obtiene la lista de especialidades médicas desde la base de datos.
 * @returns {NextResponse} JSON con la lista de especialidades o un mensaje de error.
 */
export async function GET() {
  try {
    const especialidades = await prisma.especialidades_medicas.findMany();
    return NextResponse.json(especialidades, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo especialidades médicas:", error);
    return NextResponse.json({ error: "Error obteniendo especialidades médicas" }, { status: 500 });
  }
}
