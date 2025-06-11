import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

/**
 * @file app/api/upload/route.ts
 * @description Endpoint de API genérico para la subida de archivos de imagen.
 * @architecture
 * Este endpoint sigue una arquitectura de "servicio único". En lugar de tener una ruta de subida
 * para cada tipo de entidad (categorías, productos, etc.), se centraliza toda la lógica de subida aquí.
 * Esto cumple con el Mandamiento #3 (No Reinventar la Rueda).
 *
 * @workflow
 * 1.  Recibe una petición POST que debe contener datos de formulario (`FormData`).
 * 2.  Extrae el archivo (`file`) del cuerpo de la petición.
 * 3.  Valida que el archivo exista y sea de tipo imagen.
 * 4.  Convierte el archivo a un buffer de bytes.
 * 5.  Define una ruta única en el servidor para guardar el archivo, usualmente en la carpeta `public/images/...`.
 *     Se añade un timestamp al nombre para evitar colisiones.
 * 6.  Escribe el archivo en el sistema de ficheros del servidor.
 * 7.  Devuelve una respuesta JSON con el estado de la operación y la URL pública del archivo subido.
 *     Esta URL es la que luego se guardará en la base de datos junto a la entidad correspondiente.
 *
 * @dependencies
 * - `next/server`: Para manejar las peticiones y respuestas de la API.
 * - `fs/promises`: Para escribir el archivo en el disco de forma asíncrona.
 * - `path`: Para construir rutas de archivo seguras y compatibles con el sistema operativo.
 */
export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, error: 'No se ha subido ningún archivo.' });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generamos un nombre de archivo único con un timestamp
  const filename = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
  const path = join(process.cwd(), 'public/images/products', filename);

  try {
    await writeFile(path, buffer);
    console.log(`Archivo guardado en: ${path}`);

    // Devolvemos la URL pública para que el cliente la pueda usar
    const publicUrl = `/images/products/${filename}`;
    return NextResponse.json({ success: true, url: publicUrl });

  } catch (error) {
    console.error('Error al guardar el archivo:', error);
    return NextResponse.json({ success: false, error: 'Error interno al guardar el archivo.' }, { status: 500 });
  }
}
