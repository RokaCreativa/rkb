import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

/**
 * @description Maneja las solicitudes GET para obtener la lista de revistas desde la base de datos.
 * @returns {NextResponse} JSON con la lista de revistas o un error en caso de fallo.
 */
export async function GET() {
  try {
    const revistas = await prisma.revistas.findMany();
    return NextResponse.json(revistas, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo revistas:", error);
    return NextResponse.json({ error: "Error obteniendo revistas" }, { status: 500 });
  }
}
