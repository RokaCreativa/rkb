// @/app/dashboard-v2/services/apiClient.ts

/**
 * 📜 Mandamiento #7: Separación Absoluta de Lógica y Presentación
 * -----------------------------------------------------------------
 * Este archivo es un ejemplo perfecto de este mandamiento. Abstrae
 * la complejidad de la comunicación de red, permitiendo que el
 * `dashboardStore` se centre en la lógica de negocio sin preocuparse
 * de cómo se construyen las peticiones HTTP.
 */

/**
 * 🧭 MIGA DE PAN CONTEXTUAL: Cliente de API Centralizado y Polimórfico
 *
 * 📍 UBICACIÓN: services/apiClient.ts → Servicio Central de Comunicación
 *
 * 🎯 PORQUÉ EXISTE:
 * Centraliza y estandariza toda la comunicación con el backend. Resuelve el problema
 * de lógica duplicada para manejar peticiones con y sin archivos, implementando
 * detección automática de Content-Type según el payload. Cumple Mandamiento #7
 * (Separación de Responsabilidades) y #3 (DRY).
 *
 * 🔄 FLUJO DE DATOS:
 * 1. dashboardStore action → apiClient(url, options) → ESTA FUNCIÓN
 * 2. Detección automática → imageFile present? FormData : JSON
 * 3. Headers dinámicos → Content-Type según tipo de payload
 * 4. fetch() → response handling → error/success parsing
 * 5. Return parsed data → store actualiza estado → UI re-render
 *
 * 🔗 CONEXIONES DIRECTAS:
 * - ENTRADA: dashboardStore.ts → TODAS las actions CRUD
 * - SALIDA: Backend APIs → /api/categories, /api/sections, /api/products
 * - MANEJO: FormData para uploads + JSON para data simple
 * - ERROR: Parsing automático de errores backend → toast messages
 *
 * 🚨 PROBLEMA RESUELTO (Bitácora #40 - Odisea de la Imagen):
 * - Antes: Lógica de upload duplicada en múltiples lugares
 * - Error: Content-Type manual causaba boundary issues en FormData
 * - Solución: Detección automática + browser-managed Content-Type
 * - Beneficio: Un solo lugar para toda comunicación API
 * - Fecha: 2025-01-12 - Centralización comunicación API
 *
 * 🎯 CASOS DE USO REALES:
 * - Crear categoría sin imagen → JSON payload → application/json
 * - Crear producto con imagen → FormData → multipart/form-data (auto)
 * - Actualizar datos simples → PATCH JSON → application/json
 * - Upload imagen + datos → POST FormData → multipart/form-data (auto)
 * - Eliminar ítem → DELETE sin body → response vacío manejado
 *
 * ⚠️ REGLAS DE NEGOCIO CRÍTICAS:
 * - imageFile presente → SIEMPRE FormData (nunca JSON)
 * - NO establecer Content-Type para FormData (browser auto-manage)
 * - SÍ establecer Content-Type: application/json para JSON
 * - Error handling → siempre parsear response.json() para mensajes
 * - DELETE responses → pueden estar vacíos (return {} as T)
 *
 * 🔗 DEPENDENCIAS CRÍTICAS:
 * - REQUIERE: fetch() API disponible (modern browsers)
 * - REQUIERE: Backend APIs que respondan JSON consistente
 * - REQUIERE: Error responses con structure {message: string}
 * - ROMPE SI: Backend no soporta multipart/form-data
 * - ROMPE SI: Error responses no son JSON parseables
 *
 * 📊 PERFORMANCE:
 * - Detección automática → sin overhead de configuración manual
 * - FormData streaming → eficiente para archivos grandes
 * - Error parsing → graceful fallback si JSON falla
 * - Response caching → delegado a fetch() nativo
 *
 * 📖 MANDAMIENTOS RELACIONADOS:
 * - Mandamiento #7 (Separación): Abstrae comunicación de lógica negocio
 * - Mandamiento #3 (DRY): Elimina duplicación de lógica fetch
 * - Mandamiento #6 (Consistencia): API calls uniformes en toda app
 * - Mandamiento #8 (Calidad): Error handling robusto y predecible
 */

interface ApiClientOptions<T> {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
    data?: Partial<T>;
    imageFile?: File | null;
}

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