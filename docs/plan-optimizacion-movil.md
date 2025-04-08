# Plan Maestro para Optimización Móvil y Refactorización - RokaMenu

> "Garantizarás experiencia perfecta en múltiples dispositivos"
> "Separarás la función de la estética"
> "No duplicarás lo que ya está creado"
> "Conocerás lo que existe antes de crear algo nuevo"

## 📋 Resumen Ejecutivo

Este plan establece una hoja de ruta completa para garantizar que RokaMenu funcione perfectamente en dispositivos móviles y tabletas, brindando una experiencia fluida y consistente en todos los tamaños de pantalla. Además, incluye mejoras estructurales críticas que beneficiarán a toda la aplicación siguiendo los principios de Domain-Driven Design (DDD).

**Objetivos principales**:

1. Garantizar que todas las funcionalidades del Dashboard V2 funcionen perfectamente en dispositivos móviles y tabletas.
2. Refactorizar la estructura del código para eliminar duplicaciones y mejorar la mantenibilidad.
3. Preparar el sistema para futuras mejoras como internacionalización y optimizaciones de rendimiento.

## 🔍 Estado Actual y Diagnóstico

La aplicación RokaMenu actualmente presenta las siguientes características y deficiencias:

### ✅ Componentes optimizados:

- Arrastrar y soltar funciona en categorías y secciones
- CRUD básico funciona en todos los dispositivos
- Arrastrar y soltar para productos optimizado con mejoras táctiles
- Áreas de toque ampliadas para mejor experiencia táctil
- Visualización de tablas adaptada para dispositivos móviles
- Modales adaptados adecuadamente a pantallas pequeñas
- Sistema de migas de pan (breadcrumbs) optimizado para móviles
- Estructura basada en Domain-Driven Design (DDD)
- Separación clara entre componentes de dominio, UI y hooks
- Sistema robusto de adaptadores de tipos

### ❌ Problemas pendientes de solución:

- Diseño desborda el ancho en pantallas pequeñas
- Tablas muestran demasiadas columnas en móviles
- Layout no es suficientemente compacto para dispositivos móviles
- Jerarquía visual confusa en pantallas pequeñas
- Indicadores de estado poco visibles en móviles
- Densidad de información excesiva en pantallas pequeñas
- Inconsistencias en operaciones CRUD y actualización de UI
- Manejo inconsistente de errores en operaciones CRUD
- Modales duplicados que incumplen el mandamiento anti-duplicidad
- Flujo de actualización de estado después de operaciones CRUD ineficiente

### 📝 Problemas estructurales identificados:

- Duplicación de modales (DeleteCategoryModal.tsx y DeleteCategoryConfirmation.tsx)
- Inconsistencia en el manejo de Drag and Drop (extracción de IDs compleja)
- Estilos dispersos y repetidos en diferentes archivos
- Código duplicado en hooks de dominio
- Textos hardcodeados (problema para futura internacionalización)
- Falta de patrón consistente en componentes de lista para diferentes dominios
- Conversiones manuales de tipos en componentes en lugar de usar los adaptadores centralizados
- Ausencia de pruebas automatizadas para funcionalidad crítica

## 📱 Lista de Comprobación de Optimización Móvil (Actualizada)

### 1. Operaciones Arrastrar y Soltar (Drag and Drop)

- [x] Diagnosticar problemas con drag and drop de productos
- [x] Corregir extracción de IDs en `useDragAndDrop.ts`
- [x] Estandarizar formato de droppableId entre ProductList y SectionList
- [x] Implementar mejoras para feedback táctil (indicador visual más grande)
- [x] Optimizar áreas de toque para drag handles (mínimo 44px × 44px)
- [ ] Verificar funcionamiento en navegadores móviles populares
- [ ] Estandarizar formato de droppableId en todos los componentes de lista
- [ ] Refactorizar useDragAndDrop.ts para simplificar lógica de extracción de IDs

### 2. Tablas y Visualización de Datos

- [x] Adaptar tablas para vista móvil (modo responsive)
- [x] Implementar visualización compacta para móviles
- [x] Asegurar que todas las acciones sean accesibles en pantallas pequeñas
- [ ] Optimizar tamaños de imagen para carga rápida en conexiones móviles
- [ ] Añadir carga progresiva para mejorar rendimiento en móviles
- [ ] Reducir el ancho de las tablas y contenedores para evitar desbordamiento
- [ ] Ocultar o combinar columnas menos importantes en móvil
- [ ] Convertir filas de tabla en tarjetas verticales para dispositivos móviles
- [ ] Desarrollar un layout alternativo específico para móviles
- [ ] Mejorar la jerarquía visual con mayor contraste entre elementos
- [ ] Implementar un diseño colapsable para secciones y categorías

### 3. Navegación y Estructura

- [ ] Implementar menú colapsable adaptado a móviles
- [x] Mejorar sistema de migas de pan (breadcrumbs) para móviles
- [x] Asegurar que los modales se ajusten correctamente a pantallas pequeñas
- [ ] Añadir gestos táctiles para navegación (deslizar entre vistas)
- [ ] Optimizar espaciado y márgenes para interfaces táctiles
- [ ] Añadir botones flotantes para acciones principales
- [ ] Implementar gestos de deslizamiento para acciones comunes
- [ ] Mejorar la visibilidad de los indicadores de estado

### 4. Operaciones CRUD (Crear, Leer, Actualizar, Eliminar)

- [ ] Verificar que todos los formularios sean utilizables en móviles
- [ ] Optimizar subida de imágenes para conexiones móviles
- [x] Asegurar que los botones de acción tengan tamaño adecuado (mínimo 44px)
- [ ] Implementar autoguardado para prevenir pérdida de datos en móviles
- [ ] Añadir validación instantánea en formularios para móviles
- [ ] Corregir el ciclo de actualización del estado tras operaciones CRUD
- [ ] Implementar un sistema consistente de manejo de errores
- [ ] Crear un hook genérico para modales CRUD que siga el patrón DDD
- [ ] Revisar hooks de dominio: useCategoryManagement.ts, useSectionManagement.ts, useProductManagement.ts

### 5. Refactorización y Optimización Estructural

- [ ] Unificar modales duplicados: DeleteCategoryModal.tsx, DeleteSectionModal.tsx, DeleteProductModal.tsx
- [ ] Extraer y centralizar estilos repetidos en los archivos CSS apropiados
- [ ] Revisar hooks de dominio para identificar lógica común y extraerla a un hook base
- [ ] Optimizar adaptadores de tipos y eliminar conversiones manuales en componentes
- [ ] Centralizar todos los estilos de tablas y drag-and-drop en grids.css
- [ ] Reducir re-renderizados con React.memo, useCallback y useMemo
- [ ] Implementar estrategias de caching para mejorar rendimiento

### 6. Rendimiento y Optimización

- [ ] Implementar carga diferida (lazy loading) para mejorar tiempo de carga
- [ ] Optimizar uso de JavaScript para dispositivos de baja potencia
- [ ] Añadir almacenamiento en caché para datos frecuentes
- [ ] Implementar precarga inteligente para vista anticipada
- [ ] Optimizar animaciones para rendimiento en dispositivos móviles
- [ ] Implementar estrategias para reducir tamaño de bundle
- [ ] Optimizar las llamadas API con SWR o React Query

### 7. Internacionalización (Preparación)

- [ ] Crear un sistema básico de i18n
- [ ] Extraer textos hardcodeados a archivos de traducción
- [ ] Preparar archivos de traducción para español e inglés
- [ ] Reemplazar textos fijos con llamadas a funciones de traducción

### 8. Pruebas y Verificación

- [ ] Probar en múltiples tamaños de pantalla (320px, 375px, 425px, 768px)
- [ ] Verificar en diferentes sistemas operativos móviles (iOS, Android)
- [ ] Probar con diferentes velocidades de conexión (3G, 4G, WiFi)
- [ ] Verificar funcionalidad con entrada táctil vs. ratón
- [ ] Implementar pruebas automatizadas específicas para móviles
- [ ] Crear pruebas unitarias para hooks críticos
- [ ] Añadir pruebas de integración para operaciones CRUD

## 🛠️ Plan de Refactorización Estructural

Esta sección detalla las mejoras estructurales necesarias para todo el proyecto, no solo para la optimización móvil. Estas mejoras son fundamentales para mantener la calidad del código, reducir la duplicación y facilitar futuras actualizaciones.

### 1. Componentes Modales

**Objetivo**: Eliminar duplicación y establecer una jerarquía clara

#### Estructura base de modales:

- Mantener BaseModal.tsx, FormModal.tsx y ConfirmationModal.tsx como componentes base
- Eliminar duplicados: DeleteProductConfirmation.tsx, DeleteSectionConfirmation.tsx, DeleteCategoryConfirmation.tsx

#### Estandarizar modales por dominio:

- Unificar DeleteCategoryModal.tsx y DeleteCategoryConfirmation.tsx
- Unificar DeleteSectionModal.tsx y DeleteSectionConfirmation.tsx
- Unificar DeleteProductModal.tsx y DeleteProductConfirmation.tsx

**Solución propuesta**:

```tsx
// Componente genérico BaseConfirmationModal
function BaseConfirmationModal<T>({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText,
  cancelButtonText,
  item,
  isLoading,
  entityName,
}) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="py-4">
        <p className="text-sm text-gray-500">{message}</p>
      </div>
      <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
        <Button
          type="danger"
          onClick={() => onConfirm(item)}
          disabled={isLoading}
          className="w-full sm:w-auto sm:ml-3"
        >
          {confirmButtonText}
        </Button>
        <Button
          type="secondary"
          onClick={onClose}
          className="mt-3 sm:mt-0 w-full sm:w-auto"
        >
          {cancelButtonText}
        </Button>
      </div>
    </BaseModal>
  );
}

// Implementaciones específicas por dominio
export function DeleteCategoryModal({
  isOpen,
  onClose,
  category,
  onDeleteSuccess,
}) {
  // Lógica específica para categorías
  return (
    <BaseConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Eliminar Categoría"
      message={`¿Estás seguro de que deseas eliminar la categoría "${category?.name}"?`}
      confirmButtonText="Eliminar"
      cancelButtonText="Cancelar"
      item={category}
      isLoading={isDeleting}
      entityName="categoría"
    />
  );
}
```

### 2. Hooks de Drag and Drop

**Objetivo**: Simplificar y hacer más robusto el sistema de arrastrar y soltar

#### Refactorizar useDragAndDrop.ts:

- Estandarizar el formato del droppableId para todos los dominios
- Simplificar la extracción de IDs con una función robusta
- Añadir validación y mejores logs de diagnóstico

#### Estandarizar en componentes de lista:

- Asegurar que ProductList.tsx, SectionList.tsx y CategoryList.tsx usan el mismo patrón
- Garantizar que todos generen IDs consistentes para droppableId

**Solución propuesta**:

```tsx
// Utilidad para estandarizar IDs
export const formatDroppableId = {
  // Formatos estandarizados y consistentes
  category: (id) => `categories-${id}`,
  section: (categoryId) => `sections-category-${categoryId}`,
  product: (sectionId) => `products-section-${sectionId}`,

  // Extractores seguros de IDs
  extractCategoryId: (droppableId) => {
    const matches = droppableId.match(/^categories-(\d+)$/);
    return matches ? parseInt(matches[1], 10) : null;
  },

  extractCategoryIdFromSection: (droppableId) => {
    const matches = droppableId.match(/^sections-category-(\d+)$/);
    return matches ? parseInt(matches[1], 10) : null;
  },

  extractSectionId: (droppableId) => {
    const matches = droppableId.match(/^products-section-(\d+)$/);
    return matches ? parseInt(matches[1], 10) : null;
  },
};
```

### 3. Estilos y CSS

**Objetivo**: Centralizar todos los estilos y eliminar duplicaciones

#### Mejorar organización en /styles:

- Mantener grids.css como único lugar para estilos de tablas y drag-and-drop
- Revisar si hay estilos incrustados en componentes que deban extraerse

**Solución propuesta**:

```css
/* Archivo centralizado para estilos de tablas y drag-and-drop */
/* app/dashboard-v2/styles/grids.css */

/* Estilos compartidos para todas las tablas */
.grid-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

/* Estilos de drag-and-drop por dominio */
/* Categorías */
.category-dragging {
  background-color: #e0e7ff !important; /* indigo-100 */
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid #6366f1; /* indigo-500 */
}

/* Secciones */
.section-dragging {
  background-color: #ccfbf1 !important; /* teal-100 */
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid #14b8a6; /* teal-500 */
}

/* Productos */
.product-dragging {
  background-color: #fef3c7 !important; /* amber-100 */
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid #f59e0b; /* amber-500 */
}

/* Media queries para dispositivos móviles */
@media (max-width: 640px) {
  /* Estilos responsivos para tablas */
  .grid-table thead {
    display: none;
  }

  .grid-table tr {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  /* ... más estilos móviles ... */
}
```

### 4. Limpieza de Código Duplicado

**Objetivo**: Eliminar código repetido en hooks y componentes

#### Revisar hooks de dominio:

- Identificar patrones comunes en useCategoryManagement.ts, useSectionManagement.ts y useProductManagement.ts
- Extraer lógica común a un hook base

**Solución propuesta**:

```tsx
// Hook base genérico para gestión de entidades
export function useEntityManagement<
  T extends { id: number | string }
>(options: {
  entityName: string;
  fetchEntities: () => Promise<T[]>;
  createEntity: (data: Omit<T, "id">) => Promise<T>;
  updateEntity: (id: number | string, data: Partial<T>) => Promise<T>;
  deleteEntity: (id: number | string) => Promise<void>;
}) {
  const [entities, setEntities] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Implementación de métodos CRUD genéricos
  // ...

  return {
    entities,
    isLoading,
    error,
    fetchEntities,
    createEntity,
    updateEntity,
    deleteEntity,
  };
}

// Implementación específica para categorías
export function useCategoryManagement() {
  return useEntityManagement({
    entityName: "categoría",
    fetchEntities: () => categoryService.fetchCategories(),
    createEntity: (data) => categoryService.createCategory(data),
    updateEntity: (id, data) => categoryService.updateCategory(id, data),
    deleteEntity: (id) => categoryService.deleteCategory(id),
  });
}
```

### 5. Preparación para Multi-Idioma

**Objetivo**: Preparar la aplicación para soportar múltiples idiomas

#### Implementar sistema de i18n:

- Crear archivo i18n.ts con la configuración básica
- Preparar archivos de traducción para español e inglés

**Solución propuesta**:

```tsx
// Configuración básica de i18n
// app/dashboard-v2/i18n/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import esTranslation from './es.json';
import enTranslation from './en.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: {
        translation: esTranslation
      },
      en: {
        translation: enTranslation
      }
    },
    lng: 'es',
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

// Archivo de traducción español
// app/dashboard-v2/i18n/es.json
{
  "common": {
    "add": "Añadir",
    "edit": "Editar",
    "delete": "Eliminar",
    "save": "Guardar",
    "cancel": "Cancelar",
    "confirm": "Confirmar"
  },
  "categories": {
    "title": "Categorías",
    "addNew": "Añadir categoría",
    "deleteConfirm": "¿Estás seguro de que deseas eliminar la categoría \"{{name}}\"?"
  }
  // ...
}
```

## 📅 Plan de Trabajo Actualizado

1. **Fase 1: Corrección de Arrastrar y Soltar (COMPLETADO)**

   - ✅ Solucionar bugs existentes
   - ✅ Implementar mejoras táctiles para drag handles
   - ✅ Verificar funcionamiento en todos los dispositivos

2. **Fase 2: Adaptación Responsive de Tablas (COMPLETADO)**

   - ✅ Implementar diseño responsive para tablas
   - ✅ Optimizar visualización de datos en pantallas pequeñas
   - ✅ Mejorar la accesibilidad de acciones en tablas

3. **Fase 3: Optimización de Navegación y UI (COMPLETADO)**

   - ✅ Adaptar modales para pantallas pequeñas
   - ✅ Optimizar sistema de migas de pan para móviles
   - ✅ Mejorar áreas táctiles en elementos interactivos

4. **Fase 4: Mejora de Visualización para Móviles (En progreso)**

   - ⏳ Reducir ancho de tablas y contenedores para prevenir desbordamiento
   - ⏳ Implementar tarjetas verticales para productos en móviles
   - ⏳ Mejorar jerarquía visual y contraste entre elementos
   - ⏳ Implementar diseño colapsable para secciones

5. **Fase 5: Correcciones de CRUD y Estado (Pendiente)**

   - ⏳ Corregir ciclo de actualización del estado tras operaciones CRUD
   - ⏳ Implementar sistema consistente de manejo de errores
   - ⏳ Crear hook genérico para modales CRUD

6. **Fase 6: Refactorización y Reducción de Duplicación (Pendiente)**

   - ⏳ Unificar modales duplicados (DeleteCategoryModal, DeleteSectionModal, etc.)
   - ⏳ Centralizar estilos repetidos en archivos CSS apropiados
   - ⏳ Extraer lógica común de hooks de dominio a hooks base
   - ⏳ Estandarizar formato de droppableId en todos los componentes de lista
   - ⏳ Refactorizar useDragAndDrop.ts para simplificar extracción de IDs

7. **Fase 7: Preparación para Internacionalización (Pendiente)**

   - ⏳ Implementar sistema básico de i18n
   - ⏳ Extraer textos hardcodeados a archivos de traducción
   - ⏳ Preparar archivos para español e inglés

8. **Fase 8: Optimización de Rendimiento (Pendiente)**

   - ⏳ Implementar React.memo en componentes de listas
   - ⏳ Optimizar hooks con useCallback y useMemo
   - ⏳ Implementar estrategias de caching para datos
   - ⏳ Optimizar llamadas API con SWR o React Query

9. **Fase 9: Pruebas y Documentación (Pendiente)**

   - ⏳ Implementar pruebas unitarias para hooks críticos
   - ⏳ Añadir pruebas de integración para operaciones CRUD
   - ⏳ Actualizar documentación con nueva arquitectura
   - ⏳ Documentar convenciones de código y patrones

## 🎯 Resultados Esperados

Al completar este plan, RokaMenu logrará:

- Funcionamiento perfecto de todas las operaciones CRUD en móviles y tabletas
- Experiencia fluida de arrastrar y soltar en todos los dispositivos
- Rendimiento optimizado incluso en dispositivos de gama media-baja
- Interfaz completamente responsive con excelente usabilidad en cualquier tamaño de pantalla
- Código más limpio y organizado, sin duplicaciones innecesarias
- Mejor mantenibilidad a largo plazo gracias a la refactorización
- Cumplimiento total de los mandamientos de estructura y organización del proyecto

## 📊 Métricas de Éxito

- Tiempo promedio para completar acciones CRUD en móviles < 5 segundos
- Tasa de éxito en operaciones de arrastrar y soltar en móviles > 95%
- Tiempo de carga inicial en 3G < 3 segundos
- Puntuación de Lighthouse para móviles > 85
- Satisfacción de usuario en dispositivos móviles > 4.5/5
- Reducción del código duplicado en un 80%
- Reducción de errores en operaciones CRUD en un 90%

## 📝 Próximos Pasos Inmediatos

1. Implementar un layout compacto específico para móviles
2. Desarrollar sistema de tarjetas verticales para productos en móvil
3. Unificar modales duplicados comenzando por DeleteCategoryModal.tsx
4. Refactorizar el hook useDragAndDrop.ts para simplificar la extracción de IDs
5. Estandarizar el formato de droppableId en todos los componentes de lista
6. Extraer textos hardcodeados a un sistema básico de i18n
7. Centralizar todos los estilos de tablas y drag-and-drop en grids.css

---

_Este plan cumple con los mandamientos esenciales establecidos en la documentación del proyecto: "Garantizarás experiencia perfecta en múltiples dispositivos", "Separarás la función de la estética", "No duplicarás lo que ya está creado" y "Conocerás lo que existe antes de crear algo nuevo", asegurando que RokaMenu ofrezca una experiencia de usuario óptima y mantenga un código limpio y bien organizado._
