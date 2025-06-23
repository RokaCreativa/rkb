// 🎯 FASE 8: MIDDLEWARE DE VALIDACIÓN DE PERMISOS EN SERVIDOR
// PORQUÉ: Validaciones de seguridad en el backend para prevenir ataques
// CONEXIÓN: APIs → este middleware → validación → operación o error 403
// PATRÓN V0.DEV: Doble validación (cliente + servidor) para máxima seguridad
// PROBLEMA RESUELTO: Evita que usuarios modifiquen cliente para saltarse validaciones

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Permission, Role, ROLE_PERMISSIONS } from '../types/domain/permissions';

// 🎯 INTERFACE PARA CONTEXTO DE VALIDACIÓN
// PORQUÉ: Estructura los datos necesarios para validar permisos
interface ValidationContext {
  userId: string;
  clientId: number;
  role: Role;
  permissions: Permission[];
}

// 🎯 FUNCIÓN PARA OBTENER CONTEXTO DEL USUARIO
// PORQUÉ: Extrae información de sesión y determina permisos
// CONEXIÓN: Sesión NextAuth → roles en BD → permisos calculados
export const getUserValidationContext = async (request: NextRequest): Promise<ValidationContext | null> => {
  try {
    // 🔍 OBTENER SESIÓN DEL USUARIO
    // PORQUÉ: Necesaria para identificar al usuario y sus permisos
    const session = await getServerSession();
    
    if (!session?.user) {
      return null;
    }

    // 🎯 EXTRAER CLIENT_ID DE LA REQUEST
    // PORQUÉ: Las operaciones están limitadas al cliente del usuario
    const url = new URL(request.url);
    const clientId = url.searchParams.get('client_id') || 
                     url.pathname.match(/\/api\/client\/(\d+)/)?.[1] ||
                     '3'; // Default para desarrollo

    // 🎯 DETERMINAR ROL DEL USUARIO
    // PORQUÉ: Por ahora todos son admin, pero preparado para roles dinámicos
    // FUTURO: Consultar BD para obtener rol real del usuario por cliente
    const role: Role = 'admin'; // TODO: Obtener de BD

    return {
      userId: session.user.id || session.user.email || 'unknown',
      clientId: parseInt(clientId),
      role,
      permissions: ROLE_PERMISSIONS[role]
    };
  } catch (error) {
    console.error('Error getting user validation context:', error);
    return null;
  }
};

// 🎯 FUNCIÓN DE VALIDACIÓN DE PERMISO ESPECÍFICO
// PORQUÉ: Valida si el usuario tiene un permiso específico
// CONEXIÓN: APIs → esta función → true/false → continuar/error 403
export const validatePermission = (context: ValidationContext | null, permission: Permission): boolean => {
  if (!context) return false;
  
  // 🔒 VALIDACIÓN DE PERMISO
  // PORQUÉ: Verifica si el permiso está en la lista del usuario
  return context.permissions.includes(permission) || 
         context.permissions.includes('system.admin');
};

// 🎯 MIDDLEWARE PARA OPERACIONES CRUD
// PORQUÉ: Wrapper que valida permisos antes de ejecutar operaciones
// PATRÓN: Higher-Order Function que envuelve handlers de API
export const withPermissionValidation = (
  permission: Permission,
  handler: (request: NextRequest, context: ValidationContext) => Promise<NextResponse>
) => {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // 🔍 OBTENER CONTEXTO DE VALIDACIÓN
      const context = await getUserValidationContext(request);
      
      if (!context) {
        return NextResponse.json(
          { error: 'No autorizado. Sesión requerida.' },
          { status: 401 }
        );
      }

      // 🔒 VALIDAR PERMISO ESPECÍFICO
      if (!validatePermission(context, permission)) {
        return NextResponse.json(
          { 
            error: `No tienes permisos para: ${permission}`,
            required_permission: permission,
            user_role: context.role
          },
          { status: 403 }
        );
      }

      // ✅ PERMISO VÁLIDO: Ejecutar handler
      return await handler(request, context);
      
    } catch (error) {
      console.error('Permission validation error:', error);
      return NextResponse.json(
        { error: 'Error interno de validación de permisos' },
        { status: 500 }
      );
    }
  };
};

// 🎯 VALIDACIONES ESPECÍFICAS POR OPERACIÓN
// PORQUÉ: Funciones especializadas para diferentes tipos de operaciones

// 🔧 VALIDACIÓN PARA OPERACIONES DE CREACIÓN
export const validateCreateOperation = (context: ValidationContext | null, entityType: 'categories' | 'sections' | 'products'): boolean => {
  return validatePermission(context, `${entityType}.create` as Permission);
};

// ✏️ VALIDACIÓN PARA OPERACIONES DE EDICIÓN
export const validateEditOperation = (context: ValidationContext | null, entityType: 'categories' | 'sections' | 'products'): boolean => {
  return validatePermission(context, `${entityType}.edit` as Permission);
};

// 🗑️ VALIDACIÓN PARA OPERACIONES DE ELIMINACIÓN
export const validateDeleteOperation = (context: ValidationContext | null, entityType: 'categories' | 'sections' | 'products'): boolean => {
  return validatePermission(context, `${entityType}.delete` as Permission);
};

// 👁️ VALIDACIÓN PARA CAMBIOS DE VISIBILIDAD
export const validateVisibilityOperation = (context: ValidationContext | null, entityType: 'categories' | 'sections' | 'products'): boolean => {
  return validatePermission(context, `${entityType}.visibility` as Permission);
};

// 🔄 VALIDACIÓN PARA OPERACIONES DE MOVIMIENTO
export const validateMoveOperation = (context: ValidationContext | null): boolean => {
  return validatePermission(context, 'products.move');
};

// 🎯 HELPER PARA RESPUESTAS DE ERROR CONSISTENTES
// PORQUÉ: Estandariza las respuestas de error de permisos
export const createPermissionErrorResponse = (permission: Permission, userRole?: Role) => {
  return NextResponse.json(
    {
      error: 'Permisos insuficientes',
      message: `Se requiere el permiso: ${permission}`,
      required_permission: permission,
      user_role: userRole,
      suggestion: 'Contacta al administrador para obtener los permisos necesarios'
    },
    { status: 403 }
  );
};

// 🎯 VALIDACIÓN DE INTEGRIDAD DE DATOS
// PORQUÉ: Valida que los datos de la request sean válidos y seguros
export const validateRequestIntegrity = (request: NextRequest, requiredFields: string[]): boolean => {
  // TODO: Implementar validaciones de integridad
  // - Sanitización de inputs
  // - Validación de tipos de datos
  // - Prevención de inyecciones
  return true;
};

// 🎯 RATE LIMITING POR USUARIO
// PORQUÉ: Previene abuso de APIs por parte de usuarios
export const validateRateLimit = (context: ValidationContext | null): boolean => {
  // TODO: Implementar rate limiting
  // - Límites por usuario
  // - Límites por operación
  // - Cache de intentos
  return true;
}; 