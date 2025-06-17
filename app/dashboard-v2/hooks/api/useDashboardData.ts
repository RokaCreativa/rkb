import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/app/dashboard-v2/services/apiClient';
import { useClient } from '../core/useClient';
import type { Category, Product, Section } from '../../types';

/**
 * 🧭 MIGA DE PAN CONTEXTUAL: HOOK DE FETCHING DE DATOS INICIALES
 *
 * 📍 UBICACIÓN: app/dashboard-v2/hooks/api/useDashboardData.ts
 *
 * 🎯 PROPÓSITO:
 * Este hook tiene UNA SOLA RESPONSABILIDAD: obtener todos los datos iniciales necesarios
 * para el dashboard desde la API. Utiliza @tanstack/react-query para manejar el fetching,
 * la caché, y el estado de la petición (isLoading, isError, etc.).
 *
 * 🤔 DECISIONES DE ARQUITECTURA:
 * 1.  **Aislamiento del Fetching:** Toda la lógica de comunicación con la API para la carga
 *     inicial está encapsulada aquí. Ningún otro componente o hook necesita saber cómo se
 *     obtienen estos datos.
 * 2.  **React Query como Fuente de Verdad del Servidor:** Este hook es la puerta de entrada
 *     de los datos del servidor a la aplicación. React Query se encarga automáticamente de
 *     la caché, reintentos y mantener los datos frescos, cumpliendo con las mejores prácticas.
 * 3.  **Dependencia del `clientId`:** La query se activa (`enabled: !!clientId`) solo cuando
 *     tenemos un `clientId` válido, evitando peticiones innecesarias o erróneas al inicio.
 *
 * 🔄 FLUJO DE DATOS:
 * `useClient()` -> `clientId` -> `useQuery` -> Llama a `apiClient.getDashboardData(clientId)` -> Devuelve `data`, `isLoading`, etc.
 *
 * 🔗 CONEXIONES:
 * -   Consume: `useClient()` para obtener el `clientId`.
 * -   Utiliza: `apiClient` para realizar la llamada a la API.
 * -   Es consumido por: `useDashboardView.ts`, que es el orquestador principal de la UI.
 */

// Estructura de datos que esperamos de la API
export interface DashboardData {
    categoriesWithProductCount: Category[];
    sections: Section[];
    products: Product[];
    directProducts: Product[];
}

// Clave única para la query de React Query
const QUERY_KEY = ['dashboardData'];

export const useDashboardData = () => {
    const { client } = useClient();
    const clientId = client?.id;

    return useQuery<DashboardData>({
        queryKey: [...QUERY_KEY, clientId],
        queryFn: async () => {
            if (!clientId) {
                throw new Error('Client ID is required');
            }
            return apiClient.getDashboardData(clientId);
        },
        // La query solo se ejecutará si existe un clientId
        enabled: !!clientId,
        // Mantiene los datos como 'frescos' por 5 minutos
        staleTime: 1000 * 60 * 5,
        // Mantiene los datos en caché incluso si no hay componentes usándolos
        gcTime: 1000 * 60 * 10,
        // No reintenta la petición si falla la primera vez
        retry: false,
    });
}; 