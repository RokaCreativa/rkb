import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

/**
 * Maneja las solicitudes GET para obtener la lista de compañías.
 * 
 * @returns {NextResponse} JSON con la lista de compañías o un error en caso de fallo.
 */
export async function GET() {
  try {
    const companias = await prisma.compania.findMany();
    return NextResponse.json(companias, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo compañías:", error);
    return NextResponse.json({ error: "Error obteniendo compañías" }, { status: 500 });
  }
}
