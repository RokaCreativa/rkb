import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

/**
 * Maneja las solicitudes GET para obtener la lista de zonas.
 * 
 * @returns {NextResponse} JSON con la lista de zonas o un error en caso de fallo.
 */
export async function GET() {
  try {
    const zonas = await prisma.zonas.findMany();
    return NextResponse.json(zonas, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo zonas:", error);
    return NextResponse.json({ error: "Error obteniendo zonas" }, { status: 500 });
  }
}
