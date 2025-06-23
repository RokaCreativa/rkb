// 🎯 FASE 8: HOOK DE PERMISOS CENTRALIZADO
// PORQUÉ: Centraliza todas las validaciones de permisos en un solo lugar
// CONEXIÓN: Componentes UI → este hook → validaciones antes de acciones
// PATRÓN V0.DEV: Hook reactivo que se actualiza con cambios de sesión
// PROBLEMA RESUELTO: Evita duplicar lógica de permisos en cada componente

import { useSession } from 'next-auth/react';
import { useMemo } from 'react';
import { 
  Permission, 
  Role, 
  UserPermissions, 
  PermissionValidation,
  ROLE_PERMISSIONS,
  MoveValidation 
} from '../../types/domain/permissions';
import { useDashboardStore } from '../../stores/dashboardStore';

// 🎯 HOOK PRINCIPAL DE PERMISOS
// PORQUÉ: Proporciona validaciones reactivas basadas en la sesión actual
// CONEXIÓN: Todos los componentes que necesiten validar permisos
export const usePermissions = (): PermissionValidation & { userPermissions: UserPermissions | null } => {
  const { data: session } = useSession();
  const client = useDashboardStore(state => state.client);

  // 🧭 MIGA DE PAN: Cálculo reactivo de permisos del usuario
  // PORQUÉ: Se recalcula automáticamente cuando cambia la sesión o cliente
  // CONEXIÓN: session.user → roles en BD → permisos calculados
  const userPermissions = useMemo((): UserPermissions | null => {
    if (!session?.user || !client) return null;

    // 🎯 LÓGICA DE DETERMINACIÓN DE ROL
    // PORQUÉ: Por ahora todos son 'admin', pero preparado para roles dinámicos
    // FUTURO: Consultar BD para obtener rol real del usuario
    const role: Role = 'admin'; // TODO: Obtener de BD
    
    return {
      role,
      permissions: ROLE_PERMISSIONS[role],
      clientId: client.client_id,
      userId: session.user.id || session.user.email || 'unknown'
    };
  }, [session, client]);

  // 🎯 VALIDACIONES DE PERMISOS
  // PORQUÉ: Funciones puras que validan permisos específicos
  // CONEXIÓN: Botones/acciones UI → estas funciones → habilitar/deshabilitar
  const validations = useMemo((): PermissionValidation => {
    if (!userPermissions) {
      // Sin permisos: todo denegado
      return {
        canEdit: () => false,
        canDelete: () => false,
        canCreate: () => false,
        canMove: () => false,
        hasPermission: () => false
      };
    }

    return {
      // 🔧 VALIDACIÓN DE EDICIÓN
      // PORQUÉ: Verifica si puede editar un elemento específico
      // CONEXIÓN: Botones de editar → esta función → mostrar/ocultar
      canEdit: (targetId: number) => {
        return userPermissions.permissions.some(p => 
          p.includes('.edit') || p === 'system.admin'
        );
      },

      // 🗑️ VALIDACIÓN DE ELIMINACIÓN
      // PORQUÉ: Verifica si puede eliminar un elemento específico
      // CONEXIÓN: Botones de eliminar → esta función → confirmar acción
      canDelete: (targetId: number) => {
        return userPermissions.permissions.some(p => 
          p.includes('.delete') || p === 'system.admin'
        );
      },

      // ➕ VALIDACIÓN DE CREACIÓN
      // PORQUÉ: Verifica si puede crear elementos en un contenedor
      // CONEXIÓN: FAB/botones crear → esta función → mostrar modal
      canCreate: (parentId?: number) => {
        return userPermissions.permissions.some(p => 
          p.includes('.create') || p === 'system.admin'
        );
      },

      // 🔄 VALIDACIÓN DE MOVIMIENTO
      // PORQUÉ: Verifica si puede mover elementos entre contenedores
      // CONEXIÓN: Modal de movimiento → esta función → validar destino
      canMove: (itemId: number, destinationId: number) => {
        return userPermissions.permissions.includes('products.move') || 
               userPermissions.permissions.includes('system.admin');
      },

      // ✅ VALIDACIÓN GENÉRICA DE PERMISO
      // PORQUÉ: Verifica si tiene un permiso específico
      // CONEXIÓN: Cualquier validación custom → esta función
      hasPermission: (permission: Permission) => {
        return userPermissions.permissions.includes(permission) ||
               userPermissions.permissions.includes('system.admin');
      }
    };
  }, [userPermissions]);

  return {
    ...validations,
    userPermissions
  };
};

// 🎯 HOOK DE VALIDACIONES DE MOVIMIENTO
// PORQUÉ: Validaciones específicas para el modal de movimiento
// CONEXIÓN: Modal de movimiento → este hook → validar destinos válidos
export const useMoveValidations = (): MoveValidation => {
  const categories = useDashboardStore(state => state.categories);
  const sections = useDashboardStore(state => state.sections);

  return useMemo((): MoveValidation => ({
    // 🔍 VALIDACIÓN DE DESTINO VÁLIDO
    // PORQUÉ: Previene movimientos inválidos en la jerarquía
    // REGLAS: Producto → Categoría/Sección, Sección → Categoría
    isValidDestination: (sourceType, destinationType) => {
      if (sourceType === 'product') {
        return destinationType === 'category' || destinationType === 'section';
      }
      if (sourceType === 'section') {
        return destinationType === 'category';
      }
      return false; // Categorías no se pueden mover
    },

    // 🎯 VALIDACIÓN ESPECÍFICA: PRODUCTO → CATEGORÍA
    // PORQUÉ: Verifica que la categoría destino exista y esté activa
    // CONEXIÓN: Modal movimiento → lista de categorías válidas
    canMoveToCategory: (productId, categoryId) => {
      const category = categories.find(c => c.category_id === categoryId);
      return category ? category.status === true : false;
    },

    // 🎯 VALIDACIÓN ESPECÍFICA: PRODUCTO → SECCIÓN
    // PORQUÉ: Verifica que la sección destino exista y esté activa
    // CONEXIÓN: Modal movimiento → lista de secciones válidas
    canMoveToSection: (productId, sectionId) => {
      // Buscar la sección en todas las categorías
      for (const categorySections of Object.values(sections)) {
        const section = categorySections.find(s => s.section_id === sectionId);
        if (section) {
          return section.status === true;
        }
      }
      return false;
    }
  }), [categories, sections]);
};

// 🎯 HOOK DE FEEDBACK VISUAL PARA PERMISOS
// PORQUÉ: Proporciona mensajes y estilos para acciones denegadas
// CONEXIÓN: Componentes UI → este hook → mostrar feedback apropiado
export const usePermissionFeedback = () => {
  const { hasPermission } = usePermissions();

  return {
    // 🚫 MENSAJE DE PERMISO DENEGADO
    // PORQUÉ: Mensaje consistente para todas las acciones denegadas
    getDeniedMessage: (action: string) => {
      return `No tienes permisos para ${action}. Contacta al administrador.`;
    },

    // 🎨 ESTILOS PARA ELEMENTOS DESHABILITADOS
    // PORQUÉ: Feedback visual consistente para elementos sin permisos
    getDisabledStyles: (permission: Permission) => {
      const hasAccess = hasPermission(permission);
      return {
        opacity: hasAccess ? 1 : 0.5,
        cursor: hasAccess ? 'pointer' : 'not-allowed',
        pointerEvents: hasAccess ? 'auto' : 'none' as const
      };
    },

    // ⚠️ VALIDACIÓN CON TOAST
    // PORQUÉ: Muestra toast automático si no tiene permisos
    // CONEXIÓN: Acciones → esta función → toast + return false si denegado
    validateWithToast: (permission: Permission, action: string) => {
      if (!hasPermission(permission)) {
        // toast.error(getDeniedMessage(action)); // Descomentado cuando se implemente
        return false;
      }
      return true;
    }
  };
}; 