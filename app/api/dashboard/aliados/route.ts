import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

/**
 * Obtiene la lista de aliados desde la base de datos.
 * @returns {NextResponse} JSON con la lista de aliados o un mensaje de error.
 */
export async function GET() {
  try {
    const aliados = await prisma.aliados.findMany();
    return NextResponse.json(aliados, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo aliados:", error);
    return NextResponse.json({ error: "Error obteniendo aliados" }, { status: 500 });
  }
}
