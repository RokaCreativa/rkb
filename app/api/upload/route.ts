import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import fs from 'fs';

/**
 * @file app/api/upload/route.ts
 * @description Endpoint de API genérico y refactorizado para la subida de archivos.
 * @architecture
 * Este endpoint es la evolución del anterior. Ahora, acepta un campo `entityType`
 * en el FormData. Esto le permite determinar dinámicamente en qué subcarpeta de `public/images`
 * debe guardarse el archivo.
 *
 * @workflow
 * 1. Recibe una petición POST con `FormData`.
 * 2. Extrae el `file` y el `entityType` ('categories', 'sections', 'products').
 * 3. **Validación de Seguridad**: Comprueba que `entityType` sea uno de los valores permitidos
 *    para evitar ataques de Path Traversal. Si no es válido, rechaza la petición.
 * 4. Construye la ruta de guardado dinámicamente (ej: `public/images/sections/...`).
 * 5. Se asegura de que el directorio de destino exista.
 * 6. Guarda el archivo y devuelve la URL pública relativa y el nombre del archivo.
 *
 * @dependencies
 * - `next/server`, `fs/promises`, `path`, `fs`
 */

// Lista blanca de tipos de entidad para seguridad
const ALLOWED_ENTITY_TYPES = ['categories', 'sections', 'products'];

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;
        const entityType: string | null = data.get('entityType') as string;

        if (!file) {
            return NextResponse.json({ success: false, error: 'No se ha subido ningún archivo.' }, { status: 400 });
        }
        if (!entityType || !ALLOWED_ENTITY_TYPES.includes(entityType)) {
            return NextResponse.json({ success: false, error: 'Tipo de entidad no válido.' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Construye la ruta de destino dinámicamente
        const filename = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
        const destinationFolder = join(process.cwd(), 'public/images', entityType);
        const path = join(destinationFolder, filename);

        // El nombre del archivo que se guarda en la DB será solo el nombre de archivo.
        // La URL pública se construirá en el frontend.
        const publicUrl = `/images/${entityType}/${filename}`;

        // Asegurarse de que el directorio de destino exista
        if (!fs.existsSync(destinationFolder)) {
            fs.mkdirSync(destinationFolder, { recursive: true });
        }

        await writeFile(path, buffer);
        console.log(`Archivo guardado en: ${path}`);

        // Devolvemos tanto la URL completa como solo el nombre del archivo.
        // El store usará el `filename` para guardarlo en la DB.
        return NextResponse.json({ success: true, url: publicUrl, filename: filename });

    } catch (error) {
        console.error('Error en la API de subida:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor.';
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}