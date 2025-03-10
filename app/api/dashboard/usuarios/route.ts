import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";

/**
 * Maneja las solicitudes GET para obtener la lista de usuarios.
 * 
 * @returns {NextResponse} JSON con la lista de usuarios o un error en caso de fallo.
 */
export async function GET() {
  try {
    const usuarios = await prisma.usuarios.findMany();
    return NextResponse.json(usuarios, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    return NextResponse.json({ error: "Error obteniendo usuarios" }, { status: 500 });
  }
}
