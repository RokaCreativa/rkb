import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

/**
 * @description Maneja las solicitudes GET para obtener la lista de países desde la base de datos.
 * @returns {NextResponse} JSON con la lista de países o un error en caso de fallo.
 */
export async function GET() {
  try {
    const paises = await prisma.paises.findMany();
    return NextResponse.json(paises, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo países:", error);
    return NextResponse.json({ error: "Error obteniendo países" }, { status: 500 });
  }
}
