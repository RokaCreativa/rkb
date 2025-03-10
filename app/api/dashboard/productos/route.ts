// Importamos NextResponse para manejar las respuestas HTTP en Next.js 15
import { NextResponse } from "next/server";

// Importamos Prisma desde nuestra configuración global en `app/prisma/prisma.ts`
import prisma from "@/prisma/prisma";


/**
 * Maneja las solicitudes GET para obtener la lista de productos desde la base de datos.
 * 
 * @returns {NextResponse} Devuelve un JSON con la lista de productos o un error en caso de fallo.
 */
export async function GET() {
    try {
        // Consultamos la base de datos para obtener todos los productos
        const productos = await prisma.productos.findMany();

        // Retornamos la respuesta con código 200 y los datos en formato JSON
        return NextResponse.json(productos, { status: 200 });
    } catch (error) {
        // Si ocurre un error en la consulta, lo mostramos en la consola
        console.error("Error obteniendo productos:", error);

        // Devolvemos una respuesta con código 500 y un mensaje de error
        return NextResponse.json({ error: "Error obteniendo productos" }, { status: 500 });
    }
}
