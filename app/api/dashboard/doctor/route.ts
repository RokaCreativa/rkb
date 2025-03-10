import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

/**
 * Obtiene la lista de doctores desde la base de datos.
 * @returns {NextResponse} JSON con la lista de doctores o un mensaje de error.
 */
export async function GET() {
  try {
    const doctores = await prisma.doctor.findMany();
    return NextResponse.json(doctores, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo doctores:", error);
    return NextResponse.json({ error: "Error obteniendo doctores" }, { status: 500 });
  }
}
