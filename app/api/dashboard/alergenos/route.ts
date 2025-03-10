import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

/**
 * Obtiene la lista de alérgenos desde la base de datos.
 * @returns {NextResponse} JSON con la lista de alérgenos o un mensaje de error.
 */
export async function GET() {
  try {
    const alergenos = await prisma.alergenos.findMany();
    return NextResponse.json(alergenos, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo alérgenos:", error);
    return NextResponse.json({ error: "Error obteniendo alérgenos" }, { status: 500 });
  }
}
