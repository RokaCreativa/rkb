// @/app/dashboard-v2/services/apiClient.ts

/**
 * 📜 Mandamiento #7: Separación Absoluta de Lógica y Presentación
 * -----------------------------------------------------------------
 * Este archivo es un ejemplo perfecto de este mandamiento. Abstrae
 * la complejidad de la comunicación de red, permitiendo que el
 * `dashboardStore` se centre en la lógica de negocio sin preocuparse
 * de cómo se construyen las peticiones HTTP.
 */

interface ApiClientOptions<T> {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
    data?: Partial<T>;
    imageFile?: File | null;
}

/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Cliente de API Centralizado
 *
 * 📍 UBICACIÓN: app/dashboard-v2/services/apiClient.ts
 *
 * 🎯 PORQUÉ EXISTE:
 * Para centralizar y estandarizar la forma en que la aplicación se comunica con el backend.
 * Resuelve el problema de la lógica duplicada para manejar peticiones con y sin archivos.
 *
 * 🔄 FLUJO DE LÓGICA:
 * 1. Recibe una URL, un método, datos (opcionales) y un archivo de imagen (opcional).
 * 2. DETERMINA EL TIPO DE CUERPO:
 *    - Si `imageFile` está presente, construye un `FormData` y añade los `data` y el `imageFile`.
 *      No establece `Content-Type` para que el navegador lo haga automáticamente con el boundary correcto.
 *    - Si no hay `imageFile`, construye un cuerpo JSON y establece `Content-Type: application/json`.
 * 3. Realiza la llamada `fetch` con las cabeceras y el cuerpo correctos.
 * 4. Maneja la respuesta: si no es `ok`, lanza un error con el mensaje del servidor.
 * 5. Si es `ok`, parsea la respuesta como JSON y la devuelve.
 *
 * 🔗 CONEXIONES:
 * - Es llamado por TODAS las acciones CRUD en `dashboardStore.ts`.
 *
 * 📖 MANDAMIENTOS RELACIONADOS:
 * - #3 (No te repitas - DRY): Elimina la lógica de fetch duplicada.
 * - #6 (Separación de Responsabilidades): Abstrae los detalles de la comunicación de red.
 */
export async function apiClient<T>(
    url: string,
    options: ApiClientOptions<any> = {}
): Promise<T> {
    const { method = 'GET', data, imageFile } = options;

    const headers: HeadersInit = {};
    let body: BodyInit | undefined;

    if (imageFile) {
        // --- Caso 1: Hay un archivo, usamos FormData ---
        const formData = new FormData();
        if (data) {
            for (const [key, value] of Object.entries(data)) {
                if (value !== undefined && value !== null) {
                    // Si el valor es un objeto (ej. 'data' en una petición compleja), lo stringify
                    if (typeof value === 'object') {
                        formData.append(key, JSON.stringify(value));
                    } else {
                        formData.append(key, String(value));
                    }
                }
            }
        }
        formData.append('image', imageFile);
        body = formData;
        // OJO: NO establecer Content-Type aquí. El navegador lo hará por nosotros.

    } else if (data) {
        // --- Caso 2: No hay archivo, usamos JSON ---
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(data);
    }

    const response = await fetch(url, {
        method,
        headers,
        body,
    });

    if (!response.ok) {
        // Intenta parsear el error del cuerpo de la respuesta
        const errorData = await response.json().catch(() => ({
            message: 'Error de red o respuesta no JSON',
        }));
        throw new Error(errorData.message || 'Ocurrió un error desconocido');
    }

    // Para métodos como DELETE que pueden no devolver cuerpo
    const responseText = await response.text();
    if (!responseText) {
        return {} as T;
    }

    return JSON.parse(responseText);
} 