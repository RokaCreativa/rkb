import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

/**
 * @description Maneja las solicitudes GET para obtener la lista de monedas desde la base de datos.
 * @returns {NextResponse} JSON con la lista de monedas o un error en caso de fallo.
 */
export async function GET() {
  try {
    const monedas = await prisma.monedas.findMany();
    return NextResponse.json(monedas, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo monedas:", error);
    return NextResponse.json({ error: "Error obteniendo monedas" }, { status: 500 });
  }
}
