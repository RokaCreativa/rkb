# Plan de Implementación para Optimización de RokaMenu

Este documento presenta un plan paso a paso para implementar las optimizaciones identificadas en el análisis de componentes de RokaMenu.

## Tabla de Contenidos
1. [Fase 1: Limpieza de Componentes Duplicados](#fase-1-limpieza-de-componentes-duplicados)
2. [Fase 2: Reorganización de Modales](#fase-2-reorganización-de-modales)
3. [Fase 3: Extracción de Lógica del Dashboard](#fase-3-extracción-de-lógica-del-dashboard)
4. [Fase 4: Optimización de Rendimiento](#fase-4-optimización-de-rendimiento)
5. [Testing y Validación](#testing-y-validación)

## Fase 1: Limpieza de Componentes Duplicados

### 1.1 Componentes de Tabla

#### Tareas:

1. **Verificar la versión actualizada de cada tabla**
   ```bash
   # Comparar las versiones
   diff components/CategoryTable.tsx components/tables/CategoryTable.tsx
   diff components/SectionTable.tsx components/tables/SectionTable.tsx
   diff components/ProductTable.tsx app/dashboard/components/ProductTable.tsx
   ```

2. **Actualizar el archivo de índice de tablas**
   ```typescript
   // En app/dashboard/components/tables/index.ts
   import CategoryTable from '@/components/CategoryTable';
   import SectionTable from '@/components/SectionTable';
   import ProductTable from '@/components/ProductTable';
   
   export {
     CategoryTable,
     SectionTable,
     ProductTable
   };
   ```

3. **Eliminar componentes duplicados**
   ```bash
   # Eliminar versiones duplicadas después de verificar
   rm components/tables/CategoryTable.tsx
   rm components/tables/SectionTable.tsx
   ```

4. **Verificar componente wrapper ProductTable**
   - Determinar si el wrapper en `app/dashboard/components/ProductTable.tsx` añade funcionalidad significativa
   - Si es necesario, integrar esta funcionalidad en el componente principal
   - Si no es necesario, eliminar el wrapper y utilizar directamente el componente principal

### 1.2 Componentes No Utilizados

#### Tareas:

1. **Eliminar archivos de respaldo**
   ```bash
   rm components/modals/DeleteConfirmationModal.tsx.bak
   # Y otros archivos .bak identificados
   ```

2. **Eliminar carpetas vacías**
   ```bash
   rmdir components/previews
   ```

3. **Verificar duplicidad de providers de sesión**
   ```bash
   # Comparar ambos archivos
   diff components/providers/session-provider.tsx components/SessionProvider.tsx
   
   # Unificar en un solo provider
   # Actualizar importaciones en la aplicación
   ```

4. **Verificar duplicidad de CategoryForm**
   ```bash
   # Comparar ambos archivos
   diff components/CategoryForm.tsx components/forms/CategoryForm.tsx
   
   # Unificar en un solo componente
   # Actualizar importaciones en la aplicación
   ```

## Fase 2: Reorganización de Modales

### 2.1 Unificación de BaseModal

#### Tareas:

1. **Elegir la implementación más robusta**
   - Comparar `/components/modals/BaseModal.tsx` y `/app/dashboard/components/modals/BaseModal.tsx`
   - Elegir el que proporcione la API más flexible y limpia

2. **Crear un nuevo componente BaseModal unificado**
   ```typescript
   // En components/ui/BaseModal.tsx o components/modals/BaseModal.tsx
   // Implementar la versión elegida con mejoras adicionales
   ```

3. **Actualizar todas las importaciones**
   ```bash
   # Buscar todos los archivos que importan ambas versiones
   grep -r "import.*BaseModal" .
   
   # Actualizar importaciones en cada archivo encontrado
   ```

### 2.2 Consolidación de Modales Específicos

#### Tareas:

1. **Analizar modales específicos del dashboard**
   - Revisar cada modal en `/app/dashboard/components/`
   - Determinar qué lógica es específica del dashboard vs componentes genéricos

2. **Crear modales genéricos reutilizables**
   ```typescript
   // En components/modals/
   // Implementar versiones genéricas
   ```

3. **Separar la lógica de negocio**
   - Extraer la lógica de negocio a hooks personalizados
   - Mantener los modales como componentes de presentación

## Fase 3: Extracción de Lógica del Dashboard

### 3.1 Custom Hooks para Gestión de Estado

#### Tareas:

1. **Crear hook para gestión de categorías**
   ```typescript
   // En app/hooks/useCategories.ts
   import { useState, useEffect } from 'react';
   
   export function useCategories() {
     const [categories, setCategories] = useState([]);
     const [isLoading, setIsLoading] = useState(false);
     // Implementar métodos para cargar, crear, actualizar y eliminar categorías
     // ...
     
     return {
       categories,
       isLoading,
       // Exportar métodos y estado
     };
   }
   ```

2. **Crear hook para gestión de secciones**
   ```typescript
   // En app/hooks/useSections.ts
   // Similar a useCategories pero para secciones
   ```

3. **Crear hook para gestión de productos**
   ```typescript
   // En app/hooks/useProducts.ts
   // Similar a useCategories pero para productos
   ```

4. **Crear hook para gestión de UI**
   ```typescript
   // En app/hooks/useDashboardUI.ts
   // Manejar estados como:
   // - Expansión de categorías y secciones
   // - Modales abiertos
   // - Navegación entre vistas
   ```

### 3.2 Refactorización del Dashboard Principal

#### Tareas:

1. **Utilizar las vistas existentes**
   ```typescript
   // En app/dashboard/page.tsx
   import { CategoriesView, SectionsView, ProductsView } from './components/views';
   
   // Simplificar el componente principal utilizando estas vistas
   // Pasar sólo los datos y callbacks necesarios
   ```

2. **Implementar un sistema de navegación mejorado**
   ```typescript
   // Utilizar react-router u otra solución para manejar rutas anidadas
   // O crear un sistema de navegación basado en estado
   ```

3. **Extraer manejadores de eventos**
   ```typescript
   // Mover manejadores de eventos a archivos separados o hooks
   // Ejemplo: lib/handlers/categoryEventHandlers.ts
   ```

## Fase 4: Optimización de Rendimiento

### 4.1 Memorización de Componentes

#### Tareas:

1. **Identificar componentes aptos para memorización**
   - Componentes sin dependencias frecuentemente cambiantes
   - Componentes renderizados repetidamente (como filas de tabla)

2. **Aplicar React.memo**
   ```typescript
   // En componentes/ui/TableRow.tsx (ejemplo)
   import React from 'react';
   
   function TableRow({ data }) {
     // Implementación del componente
   }
   
   export default React.memo(TableRow);
   ```

### 4.2 Carga Diferida

#### Tareas:

1. **Identificar componentes grandes**
   - Modales complejos
   - Vistas completas

2. **Implementar lazy loading**
   ```typescript
   // En app/dashboard/page.tsx
   import React, { lazy, Suspense } from 'react';
   
   const NewCategoryModal = lazy(() => import('./components/NewCategoryModal'));
   
   // Uso con Suspense
   <Suspense fallback={<div>Cargando...</div>}>
     {isNewCategoryModalOpen && (
       <NewCategoryModal
         isOpen={isNewCategoryModalOpen}
         onClose={() => setIsNewCategoryModalOpen(false)}
         // ...props
       />
     )}
   </Suspense>
   ```

### 4.3 Virtualización para Listas Largas

#### Tareas:

1. **Implementar virtualización para tablas grandes**
   ```bash
   # Instalar react-window
   npm install react-window
   ```

   ```typescript
   // En componentes de tabla (ejemplo)
   import { FixedSizeList } from 'react-window';
   
   // Implementar virtualización para listas grandes
   ```

## Testing y Validación

### 5.1 Pruebas de Componentes

#### Tareas:

1. **Crear pruebas para componentes clave**
   ```typescript
   // En __tests__/components/CategoryTable.test.tsx
   import { render, screen } from '@testing-library/react';
   import CategoryTable from '@/components/CategoryTable';
   
   describe('CategoryTable', () => {
     test('renders correctly with data', () => {
       // Implementar prueba
     });
     
     // Más pruebas
   });
   ```

2. **Probar hooks personalizados**
   ```typescript
   // En __tests__/hooks/useCategories.test.ts
   import { renderHook, act } from '@testing-library/react-hooks';
   import { useCategories } from '@/app/hooks/useCategories';
   
   describe('useCategories', () => {
     test('loads categories correctly', async () => {
       // Implementar prueba
     });
     
     // Más pruebas
   });
   ```

### 5.2 Validación de Rendimiento

#### Tareas:

1. **Medir rendimiento antes y después**
   - Tiempo de carga inicial
   - Tiempo hasta interactivo
   - Tamaño del bundle

2. **Implementar pruebas de carga**
   - Probar con gran cantidad de datos
   - Medir la respuesta UI

## Implementación Paso a Paso

Se recomienda implementar este plan de optimización de manera incremental:

1. Comenzar con la limpieza de componentes duplicados y no utilizados
2. Luego proceder con la extracción de lógica a hooks personalizados
3. Implementar la optimización de rendimiento
4. Finalmente, reorganizar los modales

Este enfoque minimiza los riesgos y permite validar las mejoras en cada etapa del proceso.

---

**Nota**: Es fundamental hacer un seguimiento riguroso de los cambios y mantener versiones de respaldo durante la implementación. Se recomienda crear ramas de git específicas para cada fase y realizar pruebas exhaustivas antes de implementar en producción. 