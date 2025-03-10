import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

/**
 * Obtiene la relación de productos y secciones desde la base de datos.
 * @returns {NextResponse} JSON con la lista de relaciones o un mensaje de error.
 */
export async function GET() {
  try {
    const productosSecciones = await prisma.productos_secciones.findMany();
    return NextResponse.json(productosSecciones, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo productos-secciones:", error);
    return NextResponse.json({ error: "Error obteniendo productos-secciones" }, { status: 500 });
  }
}
