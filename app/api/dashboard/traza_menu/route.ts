import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

/**
 * @description Maneja las solicitudes GET para obtener la trazabilidad del menú desde la base de datos.
 * @returns {NextResponse} JSON con la trazabilidad o un error en caso de fallo.
 */
export async function GET() {
  try {
    const trazaMenu = await prisma.traza_menu.findMany();
    return NextResponse.json(trazaMenu, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo trazabilidad del menú:", error);
    return NextResponse.json({ error: "Error obteniendo trazabilidad del menú" }, { status: 500 });
  }
}
