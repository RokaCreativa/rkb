import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

/**
 * @description Maneja las solicitudes GET para obtener la lista de zonas de despacho desde la base de datos.
 * @returns {NextResponse} JSON con la lista de zonas de despacho o un error en caso de fallo.
 */
export async function GET() {
  try {
    const zonasDespacho = await prisma.zonas_despacho.findMany();
    return NextResponse.json(zonasDespacho, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo zonas de despacho:", error);
    return NextResponse.json({ error: "Error obteniendo zonas de despacho" }, { status: 500 });
  }
}
