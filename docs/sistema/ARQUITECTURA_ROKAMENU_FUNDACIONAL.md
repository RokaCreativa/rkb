# 🏗️ ARQUITECTURA FUNDACIONAL ROKAMENU - DOCUMENTACIÓN MAESTRA

> **🎯 FUENTE DE VERDAD ABSOLUTA:** Este documento contiene la arquitectura base de toda la aplicación RokaMenu, compilada desde las memorias técnicas de ambos sistemas de IA (Cursor + ByteRover MCP).

---

## 📊 **STACK TECNOLÓGICO PRINCIPAL**

```typescript
// Stack Core
- Frontend: Next.js 15 + React 19
- State Management: Zustand + Immer
- Database: MySQL + Prisma ORM
- Styling: Tailwind CSS + Shadcn/UI
- Authentication: NextAuth.js
- Language: TypeScript
```

---

## 🏛️ **ARQUITECTURA GENERAL**

### **📱 PATRÓN MOBILE-FIRST DIFERENCIADO**

```typescript
// Estructura de Vistas Principales
app/dashboard-v2/
├── page.tsx                    // Punto de entrada
├── DashboardClient.tsx         // Orquestador principal
├── DynamicView.tsx            // Switch desktop/mobile
├── views/
│   ├── MobileView.tsx         // Navegación drill-down
│   └── DashboardView.tsx      // Master-detail 3 columnas
```

**🎯 Principio Arquitectónico:**

- **Desktop:** Master-Detail con 3 columnas (Categorías | Secciones | Productos)
- **Mobile:** Drill-Down con navegación contextual secuencial
- **Lógica Compartida:** Hooks y stores reutilizados entre ambas vistas

---

## 🗃️ **ARQUITECTURA HÍBRIDA DE DATOS**

### **🎭 ENTIDADES VIRTUALES EN BASE DE DATOS**

```sql
-- Campos Críticos para Arquitectura Híbrida
categories.is_virtual_category: BOOLEAN  -- Categorías fantasma
sections.is_virtual: BOOLEAN             -- Secciones fantasma
categories_display_order: INT            -- Orden contextual Grid 1
sections_display_order: INT              -- Orden contextual Grid 2
products_display_order: INT              -- Orden contextual Grid 3
```

### **🏗️ ENTIDADES FANTASMA ESPECÍFICAS**

```typescript
// IDs de Entidades Virtuales en Producción
const VIRTUAL_ENTITIES = {
  category: {
    id: 159,
    is_virtual_category: true,
    purpose: "Agrupa productos globales",
  },
  sections: {
    global: { id: 308, is_virtual: true, purpose: "Productos globales" },
    local_1: { id: 309, is_virtual: true, purpose: "Productos locales tipo A" },
    local_2: { id: 310, is_virtual: true, purpose: "Productos locales tipo B" },
  },
};
```

---

## 📊 **SISTEMA DE 3 GRIDS - ARQUITECTURA MASTER-DETAIL**

### **🎯 GRID 1: CATEGORÍAS + PRODUCTOS GLOBALES**

```typescript
// Propósito: Lista mixta de categorías reales + productos directos globales
// Ubicación: CategoryGridView.tsx
// Ordenación: categories_display_order

interface Grid1Item {
  // Categoría Real
  category_id: number;
  name: string;
  categories_display_order: number;
  is_virtual_category: false;

  // O Producto Global
  product_id: number;
  name: string;
  categories_display_order: number;
  category_id: 159; // Virtual category ID
  section_id: 308; // Virtual section ID
}

// Lógica de Derivación en DashboardView.tsx
const grid1Items = useMemo(() => {
  const virtualCategory = categories.find((c) => c.is_virtual_category);
  const virtualSection = virtualSectionsForCategory.find((s) => s.is_virtual);
  const globalProducts = products[virtualSection.section_id] || [];
  const realCategories = categories.filter((c) => !c.is_virtual_category);

  return [...realCategories, ...globalProducts].sort(
    (a, b) =>
      (a.categories_display_order ?? 999) - (b.categories_display_order ?? 999)
  );
}, [categories, sections, products]);
```

### **🎯 GRID 2: SECCIONES + PRODUCTOS LOCALES**

```typescript
// Propósito: Lista mixta contextual a categoría seleccionada
// Ubicación: SectionGridView.tsx
// Ordenación: sections_display_order

interface Grid2Item {
  // Sección Real
  section_id: number;
  name: string;
  sections_display_order: number;
  category_id: number; // Categoría padre seleccionada
  is_virtual: false;

  // O Producto Local
  product_id: number;
  name: string;
  sections_display_order: number;
  category_id: number; // Categoría padre (NO virtual)
  section_id: null; // Sin sección asignada
}

// Lógica de Derivación en DashboardView.tsx
const sectionsAndLocalProducts = useMemo(() => {
  if (!selectedCategoryId) return [];

  const sectionsForCategory = sections[selectedCategoryId] || [];
  const realSections = sectionsForCategory.filter((s) => !s.is_virtual);

  const allProductsFlat = Object.values(products).flat();
  const localDirectProducts = allProductsFlat.filter(
    (p) => p.category_id === selectedCategoryId && !p.section_id
  );

  return [...realSections, ...localDirectProducts].sort(
    (a, b) =>
      (a.sections_display_order ?? 999) - (b.sections_display_order ?? 999)
  );
}, [selectedCategoryId, sections, products]);
```

### **🎯 GRID 3: PRODUCTOS NORMALES**

```typescript
// Propósito: Lista simple de productos de sección seleccionada
// Ubicación: ProductGridView.tsx
// Ordenación: products_display_order

interface Grid3Item {
  product_id: number;
  name: string;
  products_display_order: number;
  section_id: number; // Sección padre seleccionada (NO virtual)
  category_id: number; // Derivado de la sección
}

// Lógica de Derivación en DashboardView.tsx
const grid3Items = useMemo(() => {
  if (!selectedSectionId) return [];
  const productList = products[selectedSectionId] || [];

  return [...productList].sort(
    (a, b) =>
      (a.products_display_order ?? 999) - (b.products_display_order ?? 999)
  );
}, [selectedSectionId, products]);
```

---

## 🔄 **SISTEMA DE REORDENAMIENTO UNIVERSAL**

### **🎯 FUNCIÓN MAESTRA: moveItem()**

```typescript
// Ubicación: dashboardStore.ts
// Propósito: Reordenamiento inmutable universal para los 3 grids

interface MoveItemParams {
  context: "category" | "section" | "product";
  direction: "up" | "down";
  item: Category | Section | Product;
}

const moveItem = async ({ context, direction, item }: MoveItemParams) => {
  // 🔒 Control de concurrencia global
  if (get().isMoving) return;
  set({ isMoving: true });

  try {
    // 🔍 Detección contextual automática
    const { list, contextId, orderField } = getContextualData(context, item);

    // 🎯 Intercambio inmutable de posiciones
    const reorderedItems = performImmutableSwap(
      list,
      item,
      direction,
      orderField
    );

    // 🔄 Actualización Zustand con Immer
    updateStateByContext(context, contextId, reorderedItems);

    // 📡 Sincronización API con payload específico
    await syncWithAPI(context, reorderedItems, orderField);
  } finally {
    set({ isMoving: false });
  }
};
```

### **🎯 CAMPOS DE ORDENACIÓN CONTEXTUALES**

```typescript
// Mapeo Grid → Campo de Ordenación
const ORDER_FIELD_MAPPING = {
  1: "categories_display_order", // Grid 1: Categorías + Productos Globales
  2: "sections_display_order", // Grid 2: Secciones + Productos Locales
  3: "products_display_order", // Grid 3: Productos Normales
};

// APIs de Reordenamiento Específicas
const API_ENDPOINTS = {
  category: "/api/categories/reorder",
  section: "/api/sections/reorder",
  product: "/api/products/reorder",
};
```

---

## 🏪 **GESTIÓN DE ESTADO GLOBAL - ZUSTAND**

### **🎯 STORE PRINCIPAL: dashboardStore.ts**

```typescript
// Estructura del Estado Global
interface DashboardState {
  // Datos Core
  client: Client | null;
  categories: Category[];
  sections: Record<string, Section[]>; // Key: categoryId
  products: Record<string, Product[]>; // Key: sectionId | "cat-{categoryId}"

  // Estados de UI
  selectedCategoryId: number | null;
  selectedSectionId: number | null;
  isReorderMode: boolean;
  isMoving: boolean; // Control de concurrencia global

  // Estados de Carga
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
}

// Acciones Críticas
interface DashboardActions {
  // Navegación
  setSelectedCategoryId: (id: number | null) => Promise<void>;
  setSelectedSectionId: (id: number | null) => void;

  // CRUD Operations
  createCategory: (data: Partial<Category>, imageFile?: File) => Promise<void>;
  updateCategory: (
    id: number,
    data: Partial<Category>,
    imageFile?: File
  ) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;

  // Reordenamiento Universal
  moveItem: (params: MoveItemParams) => Promise<void>;
  toggleReorderMode: () => void;
}
```

---

## 🎨 **ARQUITECTURA DE COMPONENTES**

### **🎯 SEPARACIÓN ESTRICTA: MANDAMIENTO #7**

```typescript
// Patrón Arquitectónico: Orquestador + Componentes Tontos

// 🧠 ORQUESTADOR MAESTRO
// DashboardView.tsx - Deriva datos del store y pasa props
const DashboardView = () => {
  const storeData = useDashboardStore();
  const derivedData = useMemo(() => processData(storeData), [storeData]);

  return (
    <>
      <CategoryGridView items={derivedData.grid1} onAction={handleAction} />
      <SectionGridView items={derivedData.grid2} onAction={handleAction} />
      <ProductGridView items={derivedData.grid3} onAction={handleAction} />
    </>
  );
};

// 🎭 COMPONENTES TONTOS
// CategoryGridView.tsx - Solo renderiza y emite eventos
const CategoryGridView = ({ items, onAction }) => {
  return items.map((item) => (
    <GenericRow
      data={item}
      onClick={() => onAction("select", item)}
      onEdit={() => onAction("edit", item)}
    />
  ));
};
```

### **🎯 COMPONENTES REUTILIZABLES**

```typescript
// Componentes UI Genéricos
/components/ui/
├── Button/
│   ├── Button.tsx              // Botón base con variantes
│   └── ActionIcon.tsx          // Iconos de acción (editar, eliminar, etc.)
├── Table/
│   └── GenericRow.tsx          // Fila genérica para todos los grids
├── Modal/
│   ├── EditModals.tsx          // Modales de edición unificados
│   └── DeleteConfirmationModal.tsx
└── Form/
    └── ImageUpload.tsx         // Subida de imágenes unificada
```

---

## 📱 **VISTA MÓVIL - NAVEGACIÓN DRILL-DOWN**

### **🎯 PATRÓN DE NAVEGACIÓN SECUENCIAL**

```typescript
// MobileView.tsx - Estados de navegación
type MobileViewState =
  | "categories" // Lista de categorías
  | "sections" // Secciones de categoría seleccionada
  | "products"; // Productos de sección seleccionada

const MobileView = () => {
  const [currentView, setCurrentView] = useState<MobileViewState>("categories");
  const [navigationStack, setNavigationStack] = useState<NavigationItem[]>([]);

  // Navegación contextual con breadcrumbs
  const navigateTo = (view: MobileViewState, item?: any) => {
    setNavigationStack((prev) => [...prev, { view: currentView, item }]);
    setCurrentView(view);
  };

  const navigateBack = () => {
    const previous = navigationStack.pop();
    setCurrentView(previous?.view || "categories");
  };
};
```

---

## 🚨 **REGLAS CRÍTICAS DE ARQUITECTURA**

### **⚠️ MANDAMIENTOS INNEGOCIABLES**

```typescript
// 🚨 REGLA #1: Separación de Ordenación y Status
❌ PROHIBIDO: Mezclar `status` con lógica de ordenación
✅ CORRECTO: Usar solo campos contextuales (*_display_order)

// 🚨 REGLA #2: Optimistic Updates Sin Re-fetch
❌ PROHIBIDO: Re-fetch después de optimistic update en reordenamiento
✅ CORRECTO: Confiar en optimistic update hasta sincronización API

// 🚨 REGLA #3: Validación con Lista Completa
❌ PROHIBIDO: Validar límites con lista visual parcial
✅ CORRECTO: Usar lista completa en memoria para validaciones

// 🚨 REGLA #4: Inmutabilidad Estricta
❌ PROHIBIDO: Mutación in-place en arrays/objetos de Zustand
✅ CORRECTO: Siempre crear nuevas referencias con spread operator

// 🚨 REGLA #5: Un Solo set() por Operación
❌ PROHIBIDO: Múltiples set() que creen estados intermedios
✅ CORRECTO: Una sola actualización atómica del estado
```

### **🎯 BEST PRACTICES TÉCNICAS**

```typescript
// ✅ Patrón Selector Atómico + useMemo
const rawData = useDashboardStore((state) => state.categories);
const derivedData = useMemo(() => processData(rawData), [rawData]);

// ✅ Control de Concurrencia Global
const isMoving = useDashboardStore((state) => state.isMoving);
if (isMoving) return; // Prevenir acciones concurrentes

// ✅ Comentarios Contextuales Obligatorios
/**
 * 🧭 MIGA DE PAN CONTEXTUAL: [Función]
 * 📍 UBICACIÓN: [archivo] → [función] → línea [número]
 * 🎯 PORQUÉ: [justificación técnica]
 * 🔄 FLUJO: [paso a paso del flujo de datos]
 * 🔗 CONEXIONES: [dependencias directas]
 * 🚨 PROBLEMAS RESUELTOS: [bugs históricos + fechas]
 */
```

---

## 🔧 **PROBLEMAS CONOCIDOS Y SOLUCIONES**

### **🚨 PROBLEMA: Performance Asimétrica en Grids**

```typescript
// Métricas Detectadas
Grid 1 (Categorías): 11ms, 47ms, 49ms → SÚPER RÁPIDO ✅
Grid 2 (Secciones):  422ms, 70ms      → MÁS LENTO ❌
Grid 3 (Productos):  135ms, 66ms      → MÁS LENTO ❌

// Causa Probable: Re-renders innecesarios por dependencias de estado
// Solución Aplicada: Eliminación de doble ordenación y unificación de control de movimiento
```

### **🚨 PROBLEMA: Doble Ordenación Conflictiva**

```typescript
// ❌ ANTES: DashboardView ordenaba + Grids re-ordenaban
const sortedInDashboard = items.sort(byDisplayOrder);
const sortedInGrid = useMemo(() => [...items].sort(byDisplayOrder), [items]);

// ✅ DESPUÉS: Solo DashboardView ordena
const sortedInDashboard = items.sort(byDisplayOrder);
// Grid confía en datos ya ordenados
```

---

## 📊 **MÉTRICAS Y MONITORING**

### **🎯 KPIs de Performance**

```typescript
// Tiempos de Renderizado Objetivo
Grid 1: < 50ms   // Lista mixta categorías + productos globales
Grid 2: < 100ms  // Lista mixta secciones + productos locales
Grid 3: < 75ms   // Lista simple productos normales

// Métricas de Reordenamiento
API Response Time: < 200ms
Optimistic Update: < 50ms
Visual Feedback: Inmediato (disabled state)
```

---

## 🔮 **EVOLUCIÓN FUTURA**

### **🎯 Roadmap Arquitectónico**

```typescript
// Próximas Mejoras Identificadas
1. Migración a @dnd-kit/core para drag & drop avanzado
2. Implementación de React.memo estratégico para performance
3. Lazy loading de grids con virtualización
4. Cache inteligente con React Query/SWR
5. Optimización de bundle con code splitting por vista
```

---

## 📝 **PROTOCOLO DE MODIFICACIONES**

### **🚨 MANDAMIENTO SUPREMO**

```typescript
// ANTES DE MODIFICAR CUALQUIER ARCHIVO:
// 1. 🧠 LEE TODO EL ARCHIVO COMPLETO
// 2. 🔍 BUSCA patrones similares y dependencias
// 3. 📝 DOCUMENTA la revisión completa
// 4. ⚠️ IDENTIFICA todas las "minas activas"
// 5. ✅ SOLO ENTONCES modifica

// PROHIBIDO CORREGIR SIN LEER TODO EL ARCHIVO
```

---

**🎯 ESTE DOCUMENTO ES LA FUENTE DE VERDAD ABSOLUTA DE ROKAMENU**
**📅 Última Actualización:** 2025-01-25  
**🔄 Versión:** 1.0 - Arquitectura Fundacional Completa
