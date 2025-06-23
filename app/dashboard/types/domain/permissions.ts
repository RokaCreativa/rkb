// 🎯 FASE 8: SISTEMA DE PERMISOS Y ROLES
// PORQUÉ: Implementa validaciones de seguridad para operaciones CRUD
// CONEXIÓN: dashboardStore.ts → validaciones antes de operaciones
// PATRÓN V0.DEV: Sistema de permisos granular con roles jerárquicos
// CASOS DE USO: Admin total, Editor limitado, Viewer solo lectura

export type Permission = 
  | 'categories.create'
  | 'categories.edit'
  | 'categories.delete'
  | 'categories.visibility'
  | 'sections.create'
  | 'sections.edit'
  | 'sections.delete'
  | 'sections.visibility'
  | 'products.create'
  | 'products.edit'
  | 'products.delete'
  | 'products.visibility'
  | 'products.move'
  | 'system.admin';

export type Role = 'admin' | 'editor' | 'viewer' | 'owner';

export interface UserPermissions {
  role: Role;
  permissions: Permission[];
  clientId: number;
  userId: string;
}

export interface PermissionValidation {
  canEdit: (targetId: number) => boolean;
  canDelete: (targetId: number) => boolean;
  canCreate: (parentId?: number) => boolean;
  canMove: (itemId: number, destinationId: number) => boolean;
  hasPermission: (permission: Permission) => boolean;
}

// 🎯 MAPA DE PERMISOS POR ROL
// PORQUÉ: Define qué puede hacer cada rol de forma clara
// CONEXIÓN: usePermissions() hook → validaciones en UI
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: [
    'categories.create', 'categories.edit', 'categories.delete', 'categories.visibility',
    'sections.create', 'sections.edit', 'sections.delete', 'sections.visibility',
    'products.create', 'products.edit', 'products.delete', 'products.visibility',
    'products.move', 'system.admin'
  ],
  admin: [
    'categories.create', 'categories.edit', 'categories.delete', 'categories.visibility',
    'sections.create', 'sections.edit', 'sections.delete', 'sections.visibility',
    'products.create', 'products.edit', 'products.delete', 'products.visibility',
    'products.move'
  ],
  editor: [
    'categories.edit', 'categories.visibility',
    'sections.create', 'sections.edit', 'sections.visibility',
    'products.create', 'products.edit', 'products.visibility',
    'products.move'
  ],
  viewer: []
};

// 🎯 VALIDACIONES DE INTEGRIDAD
// PORQUÉ: Previene movimientos inválidos en la jerarquía
// CONEXIÓN: Modal de movimiento → estas validaciones
export interface MoveValidation {
  isValidDestination: (sourceType: 'category' | 'section' | 'product', destinationType: 'category' | 'section') => boolean;
  canMoveToCategory: (productId: number, categoryId: number) => boolean;
  canMoveToSection: (productId: number, sectionId: number) => boolean;
} 