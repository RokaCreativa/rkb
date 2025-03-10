import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

/**
 * @description Maneja las solicitudes GET para obtener la lista de secciones desde la base de datos.
 * @returns {NextResponse} JSON con la lista de secciones o un error en caso de fallo.
 */
export async function GET() {
  try {
    const secciones = await prisma.secciones.findMany();
    return NextResponse.json(secciones, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo secciones:", error);
    return NextResponse.json({ error: "Error obteniendo secciones" }, { status: 500 });
  }
}
