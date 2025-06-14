// 🎯 FASE 8: COMPONENTE GUARD DE PERMISOS
// PORQUÉ: Envuelve elementos UI para mostrar/ocultar según permisos
// CONEXIÓN: Botones/acciones → este componente → validación → renderizado condicional
// PATRÓN V0.DEV: Higher-Order Component para validaciones declarativas
// PROBLEMA RESUELTO: Evita duplicar lógica de permisos en cada botón/acción

import React from 'react';
import { usePermissions, usePermissionFeedback } from '../../hooks/core/usePermissions';
import { Permission } from '../../types/domain/permissions';

interface PermissionGuardProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showDisabled?: boolean;
  action?: string;
}

// 🎯 COMPONENTE PRINCIPAL DE GUARD
// PORQUÉ: Renderiza condicionalmente basado en permisos del usuario
// CASOS DE USO: Botones, enlaces, secciones completas que requieren permisos
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  children,
  fallback = null,
  showDisabled = false,
  action = 'realizar esta acción'
}) => {
  const { hasPermission } = usePermissions();
  const { getDisabledStyles, getDeniedMessage } = usePermissionFeedback();

  // 🔒 VALIDACIÓN DE PERMISO
  // PORQUÉ: Determina si el usuario puede ver/usar el elemento
  const canAccess = hasPermission(permission);

  // 🚫 SIN PERMISOS: Mostrar fallback o nada
  if (!canAccess) {
    if (showDisabled) {
      // 🎨 MOSTRAR DESHABILITADO CON ESTILOS
      // PORQUÉ: Feedback visual de que la acción existe pero no está disponible
      return (
        <div 
          style={getDisabledStyles(permission)}
          title={getDeniedMessage(action)}
          className="relative"
        >
          {children}
          {/* Overlay invisible para prevenir clicks */}
          <div className="absolute inset-0 cursor-not-allowed" />
        </div>
      );
    }
    
    return <>{fallback}</>;
  }

  // ✅ CON PERMISOS: Renderizar normalmente
  return <>{children}</>;
};

// 🎯 HOOK PARA VALIDACIÓN RÁPIDA EN COMPONENTES
// PORQUÉ: Permite validaciones inline sin envolver en componente
// CONEXIÓN: Componentes → este hook → validación booleana
export const usePermissionCheck = (permission: Permission) => {
  const { hasPermission } = usePermissions();
  return hasPermission(permission);
};

// 🎯 COMPONENTE ESPECIALIZADO PARA BOTONES
// PORQUÉ: Wrapper específico para botones con validaciones automáticas
// CARACTERÍSTICAS: Deshabilita automáticamente + tooltip + estilos
interface PermissionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  permission: Permission;
  action?: string;
  children: React.ReactNode;
}

export const PermissionButton: React.FC<PermissionButtonProps> = ({
  permission,
  action = 'usar este botón',
  children,
  disabled: externalDisabled = false,
  className = '',
  ...buttonProps
}) => {
  const { hasPermission } = usePermissions();
  const { getDeniedMessage } = usePermissionFeedback();

  const canAccess = hasPermission(permission);
  const isDisabled = externalDisabled || !canAccess;

  return (
    <button
      {...buttonProps}
      disabled={isDisabled}
      className={`
        ${className}
        ${!canAccess ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      title={!canAccess ? getDeniedMessage(action) : buttonProps.title}
    >
      {children}
    </button>
  );
};

// 🎯 COMPONENTE PARA SECCIONES COMPLETAS
// PORQUÉ: Oculta secciones enteras basado en permisos
// CASOS DE USO: Paneles de administración, configuraciones avanzadas
interface PermissionSectionProps {
  permissions: Permission[];
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionSection: React.FC<PermissionSectionProps> = ({
  permissions,
  requireAll = false,
  children,
  fallback = null
}) => {
  const { hasPermission } = usePermissions();

  // 🔍 VALIDACIÓN MÚLTIPLE
  // PORQUÉ: Permite validar múltiples permisos con lógica AND/OR
  const hasAccess = requireAll
    ? permissions.every(permission => hasPermission(permission))
    : permissions.some(permission => hasPermission(permission));

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}; 