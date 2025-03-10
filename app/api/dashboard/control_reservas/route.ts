import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

/**
 * Obtiene la lista de reservas desde la base de datos.
 * @returns {NextResponse} JSON con la lista de reservas o un mensaje de error.
 */
export async function GET() {
  try {
    const reservas = await prisma.control_reservas.findMany();
    return NextResponse.json(reservas, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo reservas:", error);
    return NextResponse.json({ error: "Error obteniendo reservas" }, { status: 500 });
  }
}
