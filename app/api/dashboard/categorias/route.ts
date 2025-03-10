import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

/**
 * Maneja las solicitudes GET para obtener la lista de categorías.
 * 
 * @returns {NextResponse} JSON con la lista de categorías o un error en caso de fallo.
 */
export async function GET() {
  try {
    const categorias = await prisma.categorias.findMany();
    return NextResponse.json(categorias, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo categorías:", error);
    return NextResponse.json({ error: "Error obteniendo categorías" }, { status: 500 });
  }
}
