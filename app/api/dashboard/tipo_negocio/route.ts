import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

/**
 * @description Maneja las solicitudes GET para obtener la lista de tipos de negocio desde la base de datos.
 * @returns {NextResponse} JSON con la lista de tipos de negocio o un error en caso de fallo.
 */
export async function GET() {
  try {
    const tiposNegocio = await prisma.tipo_negocio.findMany();
    return NextResponse.json(tiposNegocio, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo tipos de negocio:", error);
    return NextResponse.json({ error: "Error obteniendo tipos de negocio" }, { status: 500 });
  }
}
