/**
 * Servicio base para peticiones a la API
 * 
 * Proporciona métodos para realizar peticiones HTTP
 * con manejo de errores y transformación de datos.
 */

/**
 * Opciones para las peticiones fetch
 */
interface FetchOptions extends RequestInit {
  /** Parámetros de consulta (query string) */
  params?: Record<string, any>;
}

/**
 * Error personalizado para la API
 */
export class ApiError extends Error {
  status: number;
  data: any;
  
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Servicio para realizar peticiones a la API
 */
export const ApiService = {
  /**
   * URL base de la API
   */
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  
  /**
   * Token de autenticación (se actualiza al iniciar sesión)
   */
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  
  /**
   * Establece el token de autenticación
   * 
   * @param token - Token JWT o null para eliminar
   */
  setToken(token: string | null): void {
    this.token = token;
    
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  },
  
  /**
   * Construye la URL completa con parámetros
   * 
   * @param endpoint - Ruta del endpoint
   * @param params - Parámetros de consulta
   * @returns URL completa
   */
  buildUrl(endpoint: string, params?: Record<string, any>): string {
    // Asegurar que el endpoint comienza con /
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = new URL(`${this.baseUrl}${normalizedEndpoint}`);
    
    // Agregar parámetros de consulta si existen
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    return url.toString();
  },
  
  /**
   * Función principal para realizar peticiones HTTP
   * 
   * @param endpoint - Ruta del endpoint
   * @param options - Opciones para fetch
   * @returns Promesa con los datos de respuesta
   * @throws ApiError si la petición falla
   */
  async fetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    try {
      const { params, ...fetchOptions } = options;
      const url = this.buildUrl(endpoint, params);
      
      // Configurar headers por defecto
      const headers = new Headers(fetchOptions.headers);
      
      // Agregar Content-Type si no es FormData
      if (!fetchOptions.body || !(fetchOptions.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
      }
      
      // Agregar token de autenticación si existe
      if (this.token) {
        headers.set('Authorization', `Bearer ${this.token}`);
      }
      
      const response = await fetch(url, {
        method: 'GET',
        ...fetchOptions,
        headers
      });
      
      // Primero verificamos si la respuesta es un stream
      const contentType = response.headers.get('content-type');
      
      // Parsear la respuesta según el tipo
      let data: any;
      
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else if (contentType?.includes('text/')) {
        data = await response.text();
      } else {
        // Para otros tipos (binarios, etc)
        data = await response.blob();
      }
      
      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        throw new ApiError(
          data.message || `Error ${response.status}`,
          response.status,
          data
        );
      }
      
      return data;
    } catch (error) {
      // Si ya es un ApiError, relanzarlo
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Convertir otros errores a ApiError
      console.error('API request error:', error);
      throw new ApiError(
        (error as Error).message || 'Error de conexión',
        0,
        error
      );
    }
  },
  
  /**
   * Sube archivos mediante FormData
   * 
   * @param endpoint - Ruta del endpoint
   * @param formData - Datos del formulario
   * @param options - Opciones adicionales
   * @returns Promesa con los datos de respuesta
   */
  async uploadForm<T>(
    endpoint: string,
    formData: FormData,
    options: Omit<FetchOptions, 'body' | 'method'> = {}
  ): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // No incluir Content-Type para que el navegador establezca el boundary correcto
        ...options.headers
      },
      ...options
    });
  },
  
  /**
   * Realiza una petición GET
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.fetch<T>(endpoint, { params });
  },
  
  /**
   * Realiza una petición POST
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  },
  
  /**
   * Realiza una petición PUT
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
  },
  
  /**
   * Realiza una petición PATCH
   */
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    });
  },
  
  /**
   * Realiza una petición DELETE
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'DELETE'
    });
  }
}; 