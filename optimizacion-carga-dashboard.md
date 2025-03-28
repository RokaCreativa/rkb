# Optimización de la Carga Inicial del Dashboard

Este documento detalla estrategias específicas para optimizar la carga inicial del dashboard en RokaMenu, reduciendo el tiempo de carga y mejorando la experiencia del usuario.

## Resumen del Problema

El dashboard de RokaMenu actualmente tiene un tiempo de carga inicial excesivo debido a:

1. **Componentes grandes y monolíticos**
2. **Carga de datos no optimizada**
3. **Excesivos renderizados iniciales**
4. **Falta de estrategias de carga progresiva**

## Estrategias de Optimización

### 1. Dividir el Monolito del Dashboard

#### Análisis del Problema
- El archivo `app/dashboard/page.tsx` tiene más de 1800 líneas
- Importa muchos componentes que no son necesarios para la carga inicial
- Contiene lógica de negocio mezclada con UI

#### Solución Propuesta

1. **Migrar a una arquitectura basada en rutas anidadas**

```jsx
// app/dashboard/layout.tsx - Solo contiene la estructura común
export default function DashboardLayout({ children }) {
  return (
    <DashboardProvider>
      <TopNavbar />
      <main className="flex flex-grow">
        <Sidebar />
        <div className="flex-grow p-6">
          {children}
        </div>
      </main>
    </DashboardProvider>
  );
}

// app/dashboard/page.tsx - Solo contiene la vista principal (resumen)
export default function DashboardPage() {
  return <DashboardSummary />;
}

// app/dashboard/categories/page.tsx - Solo la vista de categorías
// app/dashboard/sections/page.tsx - Solo la vista de secciones
// app/dashboard/products/page.tsx - Solo la vista de productos
```

2. **Implementar un Context para compartir estado entre rutas**

```jsx
// app/dashboard/context/DashboardProvider.tsx
export const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  // Estados compartidos
  const [client, setClient] = useState(null);
  
  // Funciones compartidas
  const fetchClientData = useCallback(async () => {
    // Implementación
  }, []);
  
  useEffect(() => {
    fetchClientData();
  }, []);
  
  return (
    <DashboardContext.Provider value={{ 
      client, 
      setClient,
      // Más valores compartidos
    }}>
      {children}
    </DashboardContext.Provider>
  );
}
```

### 2. Optimizar la Carga de Datos Inicial

#### Análisis del Problema
- Se cargan todas las categorías, secciones y productos inmediatamente
- Los datos no son priorizados según lo que el usuario ve primero
- No se implementa prefetching o caching eficiente

#### Solución Propuesta

1. **Implementar una estrategia de carga por capas**

```jsx
// En un hook personalizado - useInitialData.js
export function useInitialData() {
  const [loadingPhase, setLoadingPhase] = useState('initial'); // 'initial', 'essential', 'complete'
  
  useEffect(() => {
    async function loadData() {
      // Fase 1: Datos críticos (cliente y estructura básica)
      setLoadingPhase('initial');
      await loadEssentialData();
      
      // Fase 2: Datos visibles inicialmente (solo categorías principales)
      setLoadingPhase('essential');
      await loadVisibleData();
      
      // Fase 3: Datos adicionales (resto de secciones y productos)
      setLoadingPhase('complete');
      loadRemainingData(); // No esperamos a que termine
    }
    
    loadData();
  }, []);
  
  return { loadingPhase };
}
```

2. **Utilizar SWR o React Query para caching y revalidación**

```jsx
// Instalar dependencia: npm install swr
import useSWR from 'swr';

function CategoriesView() {
  const { data: categories, error } = useSWR('/api/categories', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });
  
  if (error) return <ErrorComponent />;
  if (!categories) return <LoadingComponent />;
  
  return <CategoryList categories={categories} />;
}
```

3. **Fragmentar las API para cargas parciales**

```javascript
// api/dashboard/essential.js - Endpoint que devuelve solo datos críticos
export async function GET() {
  // Obtener cliente y metadatos básicos
}

// api/categories/minimal.js - Solo IDs, nombres y contadores
export async function GET() {
  // Obtener versión ligera de categorías
}
```

### 3. Implementar Component Splitting y Lazy Loading

#### Análisis del Problema
- Todos los componentes se cargan al inicio, incluso los no visibles
- Los modales se incluyen en el bundle inicial
- Los componentes pesados ralentizan la carga inicial

#### Solución Propuesta

1. **Aplicar React.lazy para componentes pesados**

```jsx
import React, { lazy, Suspense } from 'react';

// Modales
const NewCategoryModal = lazy(() => import('./components/NewCategoryModal'));
const EditCategoryModal = lazy(() => import('./components/EditCategoryModal'));
const DeleteConfirmationModal = lazy(() => import('./components/DeleteConfirmationModal'));

// Vistas secundarias
const SectionsView = lazy(() => import('./components/views/SectionsView'));
const ProductsView = lazy(() => import('./components/views/ProductsView'));
```

2. **Implementar Suspense con fallbacks ligeros**

```jsx
function Dashboard() {
  return (
    <>
      <CategoriesView /> {/* Cargado inmediatamente */}
      
      {currentView === 'sections' && (
        <Suspense fallback={<SectionsSkeleton />}>
          <SectionsView />
        </Suspense>
      )}
      
      {isNewCategoryModalOpen && (
        <Suspense fallback={<ModalSkeleton title="Nueva Categoría" />}>
          <NewCategoryModal isOpen={true} onClose={handleClose} />
        </Suspense>
      )}
    </>
  );
}
```

3. **Crear componentes skeleton para mejorar UX**

```jsx
function CategoryTableSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white w-full animate-pulse">
      <div className="h-12 bg-gray-100"></div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 border-t border-gray-100 flex px-4 py-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-100 rounded w-1/3"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 4. Optimizar Renderizado Inicial

#### Análisis del Problema
- Se realizan múltiples re-renderizados durante la carga
- Hay demasiados efectos secundarios encadenados
- No se aprovecha la memorización de componentes

#### Solución Propuesta

1. **Consolidar efectos secundarios**

```jsx
// Antes
useEffect(() => { fetchClient(); }, []);
useEffect(() => { if (client) fetchCategories(); }, [client]);
useEffect(() => { if (categories.length) fetchInitialSection(); }, [categories]);

// Después
useEffect(() => {
  async function loadInitialData() {
    const clientData = await fetchClient();
    const categories = await fetchCategories(clientData.id);
    if (categories.length) {
      await fetchInitialSection(categories[0].id);
    }
  }
  
  loadInitialData();
}, []);
```

2. **Memorizar componentes y valores derivados**

```jsx
// Memorizar componentes
const CategoryRow = React.memo(function CategoryRow({ category, onExpand }) {
  return (/* implementación */);
});

// Memorizar valores derivados
const visibleCategories = useMemo(() => 
  categories.filter(cat => cat.status === 1),
  [categories]
);
```

3. **Reducir el impacto de las operaciones síncronas costosas**

```jsx
// Usar useCallback para eventos
const handleCategoryClick = useCallback((id) => {
  setExpandedCategories(prev => ({
    ...prev,
    [id]: !prev[id]
  }));
  
  if (!sections[id]) {
    loadSections(id);
  }
}, [sections, loadSections]);
```

### 5. Implementar Code Splitting a Nivel de Rutas

#### Análisis del Problema
- Todo el código del dashboard se carga aunque solo se use una parte
- Funcionalidades específicas aumentan el tamaño del bundle principal

#### Solución Propuesta

1. **Reorganizar el código según rutas y funcionalidades**

```
/app
  /dashboard
    /categories
      page.tsx       # Solo código para categorías
      actions.tsx    # Acciones específicas de categorías
    /sections
      page.tsx       # Solo código para secciones
      actions.tsx    # Acciones específicas de secciones
    /products
      page.tsx       # Solo código para productos
      actions.tsx    # Acciones específicas de productos
    layout.tsx       # Estructura común compartida
    page.tsx         # Dashboard principal (resumen)
```

2. **Crear bundles específicos por funcionalidad**

```javascript
// next.config.js
module.exports = {
  webpack: (config, { isServer }) => {
    // Configuración para optimizar bundles por ruta
    return config;
  },
}
```

## Medición de Rendimiento

### Herramientas de Medición

1. **Lighthouse/Web Vitals**
   - First Contentful Paint (FCP)
   - Largest Contentful Paint (LCP)
   - Time to Interactive (TTI)

2. **Chrome DevTools Performance**
   - Timelines de carga
   - Cascadas de renderizado
   - Bottlenecks en JavaScript

3. **Instrumentación personalizada**
   ```javascript
   performance.mark('dashboard-start');
   
   // Al finalizar carga esencial
   performance.mark('dashboard-essential');
   performance.measure('essential-load', 'dashboard-start', 'dashboard-essential');
   
   // Al finalizar carga completa
   performance.mark('dashboard-complete');
   performance.measure('complete-load', 'dashboard-start', 'dashboard-complete');
   
   // Logging
   console.log(performance.getEntriesByType('measure'));
   ```

### Objetivos de Rendimiento

| Métrica | Estado Actual | Objetivo |
|---------|---------------|----------|
| First Contentful Paint | ~2.5s | <1s |
| Time to Interactive | ~4s | <2s |
| Tiempo hasta datos esenciales | ~3s | <1.5s |
| Tamaño del bundle JS | ~1.2MB | <500KB |

## Conclusión

La optimización de la carga inicial del dashboard debe enfocarse en cinco aspectos clave:

1. **Dividir el monolito** en componentes más pequeños y manejables
2. **Priorizar la carga de datos** para mostrar contenido útil lo antes posible
3. **Implementar lazy loading** para componentes no críticos
4. **Optimizar el renderizado** para evitar trabajo innecesario
5. **Estructurar el código por rutas** para aprovechar mejor el code splitting

Siguiendo estas estrategias, es posible reducir significativamente el tiempo de carga inicial y mejorar la experiencia del usuario en el dashboard.

---

**Nota importante**: Antes de implementar estos cambios, es crucial establecer métricas de rendimiento base para poder medir objetivamente las mejoras. Además, se recomienda implementar los cambios de forma gradual para minimizar riesgos. 