# Estructura Detallada del Proyecto RokaMenu

## 📚 Índice

1. [Introducción para Principiantes](#introducción-para-principiantes)
2. [Mapa Visual del Proyecto](#mapa-visual-del-proyecto)
3. [Explicación Detallada de Carpetas](#explicación-detallada-de-carpetas)
4. [Componentes del Dashboard](#componentes-del-dashboard)
5. [Hooks Explicados](#hooks-explicados)
6. [Servicios y Comunicación con API](#servicios-y-comunicación-con-api)
7. [Contextos y Estado Global](#contextos-y-estado-global)
8. [Flujos de Trabajo Comunes](#flujos-de-trabajo-comunes)
9. [Guía de Solución de Problemas](#guía-de-solución-de-problemas)
10. [Glosario de Términos](#glosario-de-términos)

## 📘 Introducción para Principiantes

Si eres nuevo en el proyecto RokaMenu o incluso en el desarrollo web, este documento te ayudará a entender cómo está estructurada la aplicación y cómo funciona cada parte.

**¿Qué es RokaMenu?** Es una aplicación web para restaurantes que permite gestionar menús digitales a través de un panel de administración (dashboard).

**¿Cómo está construida?** Utiliza Next.js (un framework de React), TypeScript para tipado estático, y sigue una arquitectura modular donde cada parte tiene una responsabilidad específica.

**Conceptos clave que debes conocer:**
- **Componentes**: Piezas visuales reutilizables (botones, formularios, tablas)
- **Hooks**: Funciones especiales que añaden funcionalidad a los componentes
- **Servicios**: Código que maneja la comunicación con el servidor
- **Contextos**: Mecanismos para compartir datos entre componentes sin pasarlos manualmente

## 📊 Mapa Visual del Proyecto

```
RokaMenu
│
├── 📁 app/                    # Todo lo relacionado con páginas y rutas
│   ├── 📁 api/                # Funciones que manejan peticiones del servidor
│   ├── 📁 dashboard/          # Panel de administración principal
│   │   ├── 📁 components/     # Piezas visuales del dashboard
│   │   ├── 📁 context/        # Datos compartidos del dashboard
│   │   ├── 📄 page.tsx        # Página principal del dashboard
│   │   └── 📄 layout.tsx      # Estructura común para todo el dashboard
│   ├── 📁 hooks/              # Funciones especiales para la app
│   └── 📁 types/              # Definiciones de tipos de datos
│
├── 📁 components/             # Componentes reutilizables
│   ├── 📁 ui/                 # Componentes básicos (botones, inputs)
│   ├── 📁 forms/              # Formularios (crear/editar elementos)
│   ├── 📁 modals/             # Ventanas emergentes (confirmación, formularios)
│   └── 📁 tables/             # Tablas de datos
│
├── 📁 lib/                    # Código de utilidad
│   ├── 📁 hooks/              # Funciones especiales reutilizables
│   ├── 📁 services/           # Comunicación con APIs
│   └── 📁 utils/              # Funciones auxiliares
│
└── 📁 public/                 # Archivos estáticos (imágenes, iconos)
```

## 📂 Explicación Detallada de Carpetas

### 📁 `app/dashboard/`

Esta carpeta contiene todo lo relacionado con el panel de administración donde los restaurantes gestionan sus menús.

#### 📄 `app/dashboard/page.tsx`

Es como la "página principal" del dashboard. Este archivo:
- Contiene 1500+ líneas de código (es grande porque gestiona muchas funcionalidades)
- Muestra todas las categorías, secciones y productos del menú
- Maneja acciones como crear, editar o eliminar elementos
- Controla la navegación entre diferentes vistas
- Gestiona modales para confirmaciones y formularios

**¿Qué hace este archivo en concreto?** Cuando entras al dashboard, este archivo es el responsable de mostrar todos los datos organizados, permitirte modificarlos, y actualizar la vista cuando hay cambios.

#### 📄 `app/dashboard/layout.tsx`

Este archivo define la estructura común para todas las páginas del dashboard. Piensa en él como el "esqueleto" que contiene:
- La barra de navegación superior
- El sistema de gestión de estado global (DashboardProvider)
- Estructura visual común (colores de fondo, espaciado)

**¿Por qué es importante?** Gracias a este archivo, no necesitamos repetir estos elementos en cada página, manteniendo el código más limpio y fácil de mantener.

### 📁 `app/dashboard/components/`

Esta carpeta contiene los "bloques de LEGO" con los que construimos el dashboard, organizados por función:

#### 📁 `app/dashboard/components/views/`

Contiene los componentes principales para cada tipo de vista.

##### 📄 `CategoriesView.tsx`

Este archivo muestra todas las categorías del menú (como "Entrantes", "Platos Principales", "Postres").

**¿Qué hace específicamente?**
- Muestra una lista de categorías con sus nombres e imágenes
- Permite arrastrar y soltar para reordenarlas
- Incluye botones para crear, editar y eliminar categorías
- Maneja la expansión/contracción de categorías para ver secciones
- Implementa la funcionalidad para mostrar/ocultar categorías

**Ejemplo de uso:**
```tsx
<CategoriesView 
  categories={categories}
  expandedCategories={expandedCategories}
  onCategoryClick={handleCategoryClick}
  onNewCategory={handleCreateCategory}
  onEditCategory={handleEditCategory}
  onDeleteCategory={handleDeleteCategory}
/>
```

##### 📄 `SectionsView.tsx`

Similar a CategoriesView, pero para secciones dentro de una categoría (como "Pizzas", "Pastas" dentro de "Platos Principales").

**¿Qué hace específicamente?**
- Muestra las secciones de una categoría seleccionada
- Incluye un botón para volver a la vista de categorías
- Permite crear, editar y eliminar secciones
- Soporta arrastrar y soltar para reordenar

##### 📄 `ProductsView.tsx`

Muestra los productos individuales dentro de una sección (como "Pizza Margarita", "Pizza Pepperoni").

**¿Qué hace específicamente?**
- Muestra productos con nombres, precios e imágenes
- Permite crear, editar y eliminar productos
- Incluye opciones para mostrar/ocultar productos
- Muestra detalles adicionales como alergenos e ingredientes

#### 📁 `app/dashboard/components/actions/`

Contiene componentes específicos para acciones como crear, editar o eliminar.

##### 📄 `CategoryActions.tsx`

Este archivo define los botones y controles para acciones relacionadas con categorías.

**¿Qué hace específicamente?**
- Muestra un botón "Nueva Categoría" que abre el modal de creación
- Incluye opciones adicionales como filtrar o ordenar categorías
- Tiene una presentación visual coherente con el estilo de la aplicación

**Ejemplo de uso:**
```tsx
<CategoryActions onNewCategory={() => setIsNewCategoryModalOpen(true)} />
```

##### 📄 `SectionActions.tsx` y `ProductActions.tsx`

Similares a CategoryActions, pero para secciones y productos respectivamente.

#### 📁 `app/dashboard/components/modals/`

Contiene los componentes de ventanas emergentes (modales) para interacciones como confirmaciones y formularios.

##### 📄 `BaseModal.tsx`

Es el componente base para todos los modales, proporciona la estructura común.

**¿Qué hace específicamente?**
- Maneja la apertura/cierre con animaciones
- Gestiona el fondo oscurecido detrás del modal
- Implementa cierre al hacer clic fuera o presionar Escape
- Proporciona una estructura visual coherente

##### 📄 `DeleteCategoryConfirmation.tsx`

Este es un modal especializado para confirmar la eliminación de categorías.

**¿Qué hace específicamente?**
- Muestra un mensaje de advertencia personalizado
- Incluye el nombre de la categoría a eliminar
- Tiene botones "Eliminar" y "Cancelar"
- Maneja la lógica de eliminación y actualización del estado
- Muestra un indicador de carga durante la eliminación

**Ejemplo de uso:**
```tsx
<DeleteCategoryConfirmation
  isOpen={isDeleteModalOpen}
  onClose={() => setIsDeleteModalOpen(false)}
  categoryId={categoryToDelete}
  categoryName="Bebidas"
  onDeleted={(id) => {
    // Actualizar el estado eliminando la categoría
    setCategories(prev => prev.filter(cat => cat.category_id !== id));
  }}
/>
```

##### 📄 `DeleteSectionConfirmation.tsx` y `DeleteProductConfirmation.tsx`

Similares a DeleteCategoryConfirmation pero para secciones y productos respectivamente.

##### 📄 `ConfirmationModal.tsx`

Un componente más genérico para diferentes tipos de confirmaciones.

**¿Qué hace específicamente?**
- Permite personalizar título, mensaje e iconos
- Soporta diferentes variantes (peligro, advertencia, información)
- Proporciona callbacks para confirmar o cancelar
- Gestiona estados de carga durante acciones

#### 📁 `app/dashboard/components/tables/`

Contiene componentes de tabla para mostrar datos organizados.

##### 📄 `index.ts`

Este es un "archivo barril" que simplifica las importaciones de los componentes de tabla.

**¿Qué hace específicamente?**
- Exporta los componentes CategoryTable, SectionTable y ProductTable
- Permite importarlos todos desde un único punto
- Simplifica la gestión de importaciones en otros archivos

**Ejemplo de uso:**
```tsx
import { CategoryTable, SectionTable } from '@/app/dashboard/components/tables';
```

##### 📄 `CategoryTable.tsx`

Este componente muestra una tabla de categorías con opciones para expandir/colapsar, editar, eliminar y cambiar la visibilidad. Además, soporta drag-and-drop para reordenar las categorías.

**Características principales:**
- Visualización de categorías en formato tabla
- Soporte para expandir/colapsar categorías
- Opciones para editar y eliminar categorías
- Toggle de visibilidad
- Reordenamiento mediante drag-and-drop
- **Nuevo:** Paginación opcional para grandes conjuntos de datos
- **Nuevo:** Manejo optimizado de la expansión de categorías con paginación

**Ejemplo de uso (versión básica):**
```tsx
<CategoryTable
  categories={categories}
  expandedCategories={expandedCategories}
  onCategoryClick={handleCategoryClick}
  onEditCategory={handleEditCategory}
  onDeleteCategory={handleDeleteCategory}
  onToggleVisibility={toggleCategoryVisibility}
  isUpdatingVisibility={isUpdatingVisibility}
  onReorderCategory={handleReorderCategory}
/>
```

**Ejemplo de uso (con paginación):**
```tsx
<CategoryTable
  categories={currentPageCategories} // Solo las categorías de la página actual
  expandedCategories={expandedCategories}
  onCategoryClick={handleCategoryClick}
  onEditCategory={handleEditCategory}
  onDeleteCategory={handleDeleteCategory}
  onToggleVisibility={toggleCategoryVisibility}
  isUpdatingVisibility={isUpdatingVisibility}
  onReorderCategory={handleReorderCategory}
  // Propiedades de paginación
  paginationEnabled={true}
  currentPage={currentPage}
  itemsPerPage={itemsPerPage}
  totalCategories={totalCategories}
  onPageChange={handlePageChange}
  onPageSizeChange={handlePageSizeChange}
/>
```

**Nota importante sobre la expansión con paginación:**
Para garantizar que la función de expansión funcione correctamente con la paginación, es esencial que:
1. Solo se pasen al componente las categorías de la página actual
2. La sección que muestra las categorías expandidas debe usar la misma lista filtrada
3. El componente ajusta automáticamente su visualización según si la paginación está habilitada o no

**Cómo se implementó la solución:**
```tsx
// En el dashboard (page.tsx)
const getCurrentPageCategories = () => {
  if (!categoryPagination.enabled) {
    return categories;
  }
  
  const startIndex = (categoryPagination.page - 1) * categoryPagination.limit;
  const endIndex = startIndex + categoryPagination.limit;
  return categories.slice(startIndex, endIndex);
};

// En la sección de categorías expandidas
{currentView === 'categories' && getCurrentPageCategories().map(category => {
  if (!expandedCategories[category.category_id]) return null;
  
  return (
    <div key={`category-${category.category_id}`}>
      {/* Contenido expandido */}
    </div>
  );
})}
```

Esta implementación garantiza que solo se puedan expandir las categorías que están visibles en la página actual.

### 📁 `app/dashboard/context/`

Contiene los componentes que gestionan el estado global compartido entre diferentes partes del dashboard.

#### 📄 `DashboardContext.tsx`

Este archivo define el contexto principal del dashboard que comparte datos entre componentes.

**¿Qué hace específicamente?**
- Almacena datos de categorías, secciones y productos
- Mantiene el estado de navegación (vista actual, elementos seleccionados)
- Gestiona estados de UI (carga, errores, expansión)
- Proporciona funciones para manipular estos datos
- Carga datos iniciales cuando se inicia la aplicación

**Ejemplo de uso:**
```tsx
const {
  categories,
  sections,
  selectedCategory,
  isLoading,
  navigateToCategory,
  toggleCategoryExpanded
} = useDashboard();
```

#### 📄 `index.ts`

Un archivo barril para simplificar importaciones relacionadas con el contexto.

**¿Qué hace específicamente?**
- Exporta DashboardContext, DashboardProvider y useDashboard
- Permite importarlos desde un único punto
- Simplifica la gestión de importaciones en otros archivos

## 🪝 Hooks Explicados

Los hooks son funciones especiales que añaden funcionalidad a los componentes de React. En nuestro proyecto tenemos varios tipos:

### 📁 `lib/hooks/ui/`

Hooks relacionados con la interfaz de usuario, independientes del dominio específico del negocio.

#### 📄 `useDragAndDrop.ts`

Este hook implementa la funcionalidad de arrastrar y soltar para listas.

**¿Qué hace específicamente?**
- Maneja eventos de inicio de arrastre, arrastre sobre y soltar
- Gestiona indicadores visuales durante el arrastre
- Calcula la posición final correcta para el elemento
- Proporciona callbacks para actualizar el estado después del reordenamiento
- Es genérico, por lo que funciona con cualquier tipo de dato

**Ejemplo de uso:**
```tsx
const { getDragHandlers } = useDragAndDrop<Category>((sourceIndex, destinationIndex) => {
  // Código para reordenar categorías
  const newCategories = [...categories];
  const [removed] = newCategories.splice(sourceIndex, 1);
  newCategories.splice(destinationIndex, 0, removed);
  setCategories(newCategories);
});

// Luego en el JSX:
<div {...getDragHandlers(index)}>Elemento arrastrable</div>
```

#### 📄 `useModalState.ts`

Este hook gestiona el estado de los modales (abierto/cerrado).

**¿Qué hace específicamente?**
- Proporciona un estado para controlar si un modal está abierto
- Ofrece funciones para abrir, cerrar y alternar el modal
- En la versión avanzada, soporta múltiples modales
- Gestiona el paso de datos al modal

**Ejemplo de uso:**
```tsx
const { isOpen, open, close } = useModalState();

// Luego en el JSX:
<button onClick={open}>Abrir Modal</button>
{isOpen && <Modal onClose={close}>Contenido del modal</Modal>}
```

#### 📄 `useLoadingState.ts`

Este hook gestiona estados de carga durante operaciones asíncronas.

**¿Qué hace específicamente?**
- Mantiene un estado para indicar si algo está cargando
- Proporciona una función para envolver operaciones asíncronas
- Maneja automáticamente el inicio y fin del estado de carga
- Gestiona errores durante la operación

**Ejemplo de uso:**
```tsx
const { isLoading, execute } = useLoadingState();

const handleSubmit = async () => {
  await execute(async () => {
    // Operación asíncrona, como guardar datos
    await saveData();
  });
};

// Luego en el JSX:
<button disabled={isLoading} onClick={handleSubmit}>
  {isLoading ? "Guardando..." : "Guardar"}
</button>
```

#### 📄 `useToastNotifications.ts`

Este hook proporciona una interfaz para mostrar notificaciones toast (mensajes temporales).

**¿Qué hace específicamente?**
- Ofrece funciones para mostrar diferentes tipos de notificaciones
- Gestiona la duración y animación de las notificaciones
- Permite personalizar el aspecto de las notificaciones
- Maneja la cola de notificaciones si se muestran varias

**Ejemplo de uso:**
```tsx
const { showSuccess, showError } = useToastNotifications();

const handleSave = async () => {
  try {
    await saveData();
    showSuccess("Datos guardados correctamente");
  } catch (error) {
    showError("Error al guardar los datos");
  }
};
```

### 📁 `lib/hooks/dashboard/`

Hooks específicos para la funcionalidad del dashboard.

#### 📄 `useDashboardService.ts`

Este hook proporciona acceso a los servicios de API del dashboard.

**¿Qué hace específicamente?**
- Ofrece funciones para operaciones CRUD (crear, leer, actualizar, eliminar)
- Gestiona estados de carga durante peticiones
- Maneja errores y muestra notificaciones apropiadas
- Encapsula la lógica de comunicación con la API

**Ejemplo de uso:**
```tsx
const {
  createCategory,
  updateCategory,
  deleteCategory,
  isLoading,
  error
} = useDashboardService();

const handleDeleteCategory = async (id) => {
  const success = await deleteCategory(id);
  if (success) {
    // Actualizar UI
  }
};
```

#### 📄 `useDashboardCategories.ts`

Este hook gestiona específicamente el estado y operaciones de categorías.

**¿Qué hace específicamente?**
- Mantiene el estado de las categorías
- Proporciona funciones para cargar, crear, actualizar y eliminar categorías
- Gestiona la reordenación de categorías
- Maneja la expansión/contracción de categorías

**Ejemplo de uso:**
```tsx
const {
  categories,
  expandedCategories,
  loadCategories,
  toggleCategoryExpanded,
  reorderCategories
} = useDashboardCategories();
```

#### 📄 `useDashboardModals.ts`

Este hook gestiona los diversos modales del dashboard.

**¿Qué hace específicamente?**
- Mantiene el estado de todos los modales (abierto/cerrado)
- Proporciona funciones para abrir y cerrar modales específicos
- Gestiona los datos relacionados con cada modal
- Maneja la coordinación entre modales

**Ejemplo de uso:**
```tsx
const {
  isCreateCategoryModalOpen,
  isEditCategoryModalOpen,
  isDeleteCategoryModalOpen,
  openCreateCategoryModal,
  openEditCategoryModal,
  openDeleteCategoryModal,
  closeAllModals
} = useDashboardModals();
```

## 🔄 Servicios y Comunicación con API

Los servicios son responsables de la comunicación con el servidor. Están ubicados en `lib/services/`.

### 📄 `api.ts`

Es el cliente base para todas las peticiones API.

**¿Qué hace específicamente?**
- Configura las peticiones HTTP con los encabezados correctos
- Maneja la autenticación de forma consistente
- Proporciona métodos para GET, POST, PUT, DELETE
- Gestiona el manejo de errores y respuestas

**Ejemplo de uso:**
```tsx
const api = new ApiClient();
const response = await api.get('/categories');
```

### 📄 `dashboardService.ts`

Contiene todas las operaciones específicas del dashboard.

**¿Qué hace específicamente?**
- Proporciona funciones específicas para cada operación
- Encapsula la lógica de construcción de URLs y cuerpos de petición
- Transforma datos entre el formato del cliente y el servidor
- Maneja la validación de datos antes de enviarlos

**Ejemplo de uso:**
```tsx
const result = await DashboardService.deleteCategory(123);
```

### 📄 `categoryService.ts`

Servicio especializado para operaciones con categorías.

**¿Qué hace específicamente?**
- Proporciona funciones para CRUD de categorías
- Maneja la subida de imágenes para categorías
- Gestiona la reordenación de categorías
- Implementa la lógica de visibilidad (mostrar/ocultar)

**Ejemplo de uso:**
```tsx
const newCategory = await CategoryService.create({
  name: "Postres",
  image: imageFile,
  status: 1
});
```

## 🌐 Contextos y Estado Global

Los contextos permiten compartir datos entre componentes sin pasarlos manualmente.

### 📄 `app/dashboard/context/DashboardContext.tsx`

**¿Qué hace específicamente?**
- Define el tipo de datos que se comparten (categorías, secciones, etc.)
- Crea un "contenedor" para esos datos (createContext)
- Proporciona un componente para envolver la aplicación (DashboardProvider)
- Ofrece un hook para acceder a los datos (useDashboard)
- Implementa la lógica para cargar y actualizar los datos

**Estructura interna:**
```tsx
// Creación del contexto
const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Proveedor del contexto
export const DashboardProvider: React.FC<{children: ReactNode}> = ({children}) => {
  // Estados y lógica
  const [categories, setCategories] = useState<Category[]>([]);
  // ... más estados y lógica
  
  // Valor del contexto
  const contextValue = {
    categories,
    setCategories,
    // ... más valores y funciones
  };
  
  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

// Hook para usar el contexto
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard debe usarse dentro de un DashboardProvider");
  }
  return context;
};
```

## 🔄 Flujos de Trabajo Comunes

### Creación de una nueva categoría

1. El usuario hace clic en el botón "Nueva Categoría" en `CategoryActions`
2. Esto llama a `onNewCategory` que abre el modal de creación
3. El usuario completa el formulario en el modal
4. Al enviar, se llama a `createCategory` del hook `useDashboardService`
5. Este hook llama a `DashboardService.createCategory`
6. El servicio hace una petición POST a `/api/categories`
7. Si es exitoso, se actualiza el estado en `DashboardContext`
8. Los componentes se re-renderizan para mostrar la nueva categoría

### Eliminar una categoría

1. El usuario hace clic en el botón de eliminar en `CategoryTable`
2. Esto llama a `onDeleteCategory` que abre el modal de confirmación
3. El modal `DeleteCategoryConfirmation` muestra un mensaje de advertencia
4. Si el usuario confirma, se llama a `deleteCategory` del hook `useDashboardService`
5. Este hook llama a `DashboardService.deleteCategory`
6. El servicio hace una petición DELETE a `/api/categories/{id}`
7. Si es exitoso, se llama a `onDeleted` que actualiza el estado
8. La categoría desaparece de la vista

## 🔧 Guía de Solución de Problemas

### Problema: Un componente no muestra los datos más recientes

**Posible causa**: El componente no está suscrito al contexto correctamente.

**Solución**: Asegúrate de que el componente usa el hook `useDashboard` y está dentro de un `DashboardProvider`.

```tsx
// Incorrecto
const MyComponent = () => {
  // Aquí faltan los datos del contexto
  return <div>...</div>;
};

// Correcto
const MyComponent = () => {
  const { categories } = useDashboard();
  return <div>{categories.map(c => c.name)}</div>;
};
```

### Problema: El arrastrar y soltar no funciona

**Posible causa**: La implementación del hook `useDragAndDrop` no está correcta.

**Solución**: Verifica que los eventos de arrastre están correctamente configurados:

```tsx
// Correcto
const { getDragHandlers } = useDragAndDrop<Category>(handleReorder);

return (
  <div {...getDragHandlers(index)} draggable>
    {category.name}
  </div>
);
```

## 📝 Glosario de Términos

- **Componente**: Pieza reutilizable de interfaz en React (como un botón, formulario, etc.)
- **Hook**: Función especial que añade funcionalidad a los componentes de React
- **Props**: Datos que se pasan a un componente desde su padre
- **Estado**: Datos que son propios de un componente y pueden cambiar con el tiempo
- **Contexto**: Mecanismo para compartir datos entre componentes sin pasarlos manualmente
- **Callback**: Función que se pasa como propiedad a un componente
- **Modal**: Ventana emergente que aparece sobre el contenido principal
- **API**: Conjunto de funciones que permiten la comunicación con el servidor
- **CRUD**: Create, Read, Update, Delete (Crear, Leer, Actualizar, Eliminar)
- **JSX**: Sintaxis que permite mezclar HTML con JavaScript
- **TypeScript**: Versión de JavaScript con tipado estático
- **Next.js**: Framework basado en React que facilita la creación de aplicaciones web
- **React**: Biblioteca de JavaScript para construir interfaces de usuario
- **Toast**: Notificación temporal que aparece brevemente

# Detalles Técnicos del Proyecto RokaMenu

## Características Implementadas

### Gestión de Categorías
- Creación, edición y eliminación de categorías
- Control de visibilidad (activo/inactivo)
- Reordenamiento mediante drag & drop
- Vista previa de imagen

### Gestión de Secciones
- Creación, edición y eliminación de secciones dentro de categorías
- Control de visibilidad (activo/inactivo)
- Reordenamiento mediante drag & drop
- Vista previa de imagen

### Gestión de Productos
- Creación, edición y eliminación de productos dentro de secciones
- Control de visibilidad (activo/inactivo)
- Reordenamiento mediante drag & drop
- Vista previa de imagen
- Gestión de precio y descripción

## Estructura de la Base de Datos

### Tablas Principales
- `users` - Usuarios del sistema
- `clients` - Clientes (restaurantes)
- `categories` - Categorías del menú
- `sections` - Secciones dentro de categorías
- `products` - Productos individuales
- `products_sections` - Relación muchos a muchos entre productos y secciones

## Puntos de Mejora Pendientes

### Optimizaciones de Rendimiento
- Implementar carga lazy de imágenes
- Mejorar la gestión de estado para reducir re-renders

### Mejoras de UX
- Añadir confirmaciones para operaciones destructivas
- Mejorar el feedback durante operaciones asíncronas
- Implementar sistema de notificaciones más robusto

### Funcionalidades Pendientes
- Implementar vista previa del menú para el cliente
- Añadir estadísticas y analíticas
- Sistema de gestión de pedidos

## Gestión de Imágenes

### Estructura de Directorios
- `/images/categories/` - Imágenes de categorías
- `/images/sections/` - Imágenes de secciones
- `/images/products/` - Imágenes de productos

### Proceso de Subida
1. El archivo se envía mediante FormData desde el cliente
2. El servidor procesa y almacena la imagen en el directorio correspondiente
3. Se guarda la ruta relativa en la base de datos
4. Al recuperar, se construye la URL completa para el frontend

### Problemas Conocidos
- La duplicación de rutas en las imágenes ocurre cuando se concatena incorrectamente la ruta base con el nombre del archivo
- Solucionado mediante limpieza de prefijos existentes antes de añadir la ruta base

## APIs y Endpoints

### Categorías
- `GET /api/categories` - Listar todas las categorías
  - **Nuevo (28/03/2024)**: Soporta paginación opcional con parámetros `?page=1&limit=10`
  - Sin parámetros devuelve todas las categorías (comportamiento original)
  - Con parámetros devuelve `{ data: [...], meta: { total, page, limit, totalPages } }`
- `POST /api/categories` - Crear una categoría
- `PUT /api/categories` - Actualizar una categoría
- `DELETE /api/categories/{id}` - Eliminar una categoría

### Secciones
- `GET /api/sections?category_id={id}` - Listar secciones por categoría
- `POST /api/sections` - Crear una sección
- `PUT /api/sections` - Actualizar una sección
- `DELETE /api/sections/{id}` - Eliminar una sección

### Productos
- `GET /api/products?section_id={id}` - Listar productos por sección
- `GET /api/products/{id}` - Obtener detalles de un producto
- `POST /api/products` - Crear un producto
- `PUT /api/products` - Actualizar un producto
- `DELETE /api/products/{id}` - Eliminar un producto
- `POST /api/products/upload-image` - Subir imagen de producto

## Optimizaciones de Rendimiento Implementadas

### Paginación de Endpoints API

#### API de Categorías (/api/categories)
- Implementación completa de paginación opcional mediante parámetros `page` y `limit`.
- Ejemplo de solicitud: `/api/categories?page=1&limit=10`
- Formato de respuesta paginada:
  ```json
  {
    "items": [
      { /* categoría 1 */ },
      { /* categoría 2 */ },
      // ...
    ],
    "meta": {
      "total": 45,       // Total de categorías
      "page": 1,         // Página actual
      "limit": 10,       // Elementos por página
      "totalPages": 5    // Total de páginas
    }
  }
  ```
- Para mantener compatibilidad, las solicitudes sin parámetros de paginación reciben todas las categorías en el formato original:
  ```json
  [
    { /* categoría 1 */ },
    { /* categoría 2 */ },
    // ...
  ]
  ```

### Optimización de Carga Inicial (Planificada)

El análisis de rendimiento ha revelado que la carga inicial del dashboard realiza numerosas peticiones secuenciales:
1. Carga de datos del cliente
2. Carga de todas las categorías
3. Precarga de todas las secciones de cada categoría
4. Precarga de todos los productos de cada sección

Los logs muestran operaciones secuenciales extensas:
```
Iniciando precarga de datos para todas las categorías...
Precargando datos para 5 categorías activas
Precargando secciones para categoría Comidas...
Precargando productos para sección Tostas...
// ... y así sucesivamente
Precarga de datos completada.
```

Esta "precarga agresiva" genera tiempos de carga iniciales excesivos, especialmente para clientes con muchas categorías, secciones y productos.

#### Estrategia de Optimización Planificada:

1. **Implementación de carga bajo demanda**:
   ```typescript
   // Ejemplo futuro: Carga de secciones solo cuando se expande una categoría
   const handleCategoryExpand = async (categoryId: number) => {
     setExpandedCategories(prev => ({
       ...prev,
       [categoryId]: !prev[categoryId]
     }));
     
     // Cargar secciones solo si no están en caché y la categoría está expandida
     if (!sectionsByCategoryId[categoryId] && expandedCategories[categoryId]) {
       setLoadingSections(prev => ({ ...prev, [categoryId]: true }));
       try {
         const sections = await fetchSectionsForCategory(categoryId);
         setSectionsByCategoryId(prev => ({ ...prev, [categoryId]: sections }));
       } catch (error) {
         console.error(`Error al cargar secciones para categoría ${categoryId}:`, error);
       } finally {
         setLoadingSections(prev => ({ ...prev, [categoryId]: false }));
       }
     }
   };
   ```

2. **Sistema de caché con hooks personalizados**:
   ```typescript
   // Ejemplo futuro: Hook para gestionar caché de secciones
   const useSectionsCache = () => {
     const [cache, setCache] = useState<Record<number, Section[]>>({});
     const [isLoading, setIsLoading] = useState<Record<number, boolean>>({});
     
     const getSections = async (categoryId: number, forceRefresh = false) => {
       // Retornar desde caché si está disponible y no se fuerza actualización
       if (cache[categoryId] && !forceRefresh) return cache[categoryId];
       
       // Evitar múltiples solicitudes simultáneas para los mismos datos
       if (isLoading[categoryId]) return null;
       
       setIsLoading(prev => ({ ...prev, [categoryId]: true }));
       try {
         const sections = await fetchSectionsForCategory(categoryId);
         setCache(prev => ({ ...prev, [categoryId]: sections }));
         return sections;
       } catch (error) {
         console.error(`Error cargando secciones para categoría ${categoryId}:`, error);
         return null;
       } finally {
         setIsLoading(prev => ({ ...prev, [categoryId]: false }));
       }
     };
     
     // Método para invalidar entradas de caché específicas
     const invalidateCache = (categoryId?: number) => {
       if (categoryId) {
         setCache(prev => {
           const newCache = { ...prev };
           delete newCache[categoryId];
           return newCache;
         });
       } else {
         setCache({}); // Invalidar todo el caché
       }
     };
     
     return { 
       getSections, 
       cache, 
       isLoading, 
       invalidateCache 
     };
   };
   ```

3. **Componentes optimizados con carga condicional e indicadores visuales**:
   ```jsx
   // Ejemplo futuro: Componente de categoría con carga bajo demanda e indicador visual
   const CategoryItem = ({ category, isExpanded, onToggle }) => {
     const { getSections, isLoading } = useSectionsCache();
     const [sections, setSections] = useState([]);
     
     useEffect(() => {
       // Cargar secciones solo si la categoría está expandida
       if (isExpanded) {
         getSections(category.category_id).then(result => {
           if (result) setSections(result);
         });
       }
     }, [isExpanded, category.category_id]);
     
     return (
       <div className="category-container">
         <div 
           className="category-header" 
           onClick={onToggle}
         >
           <span>{category.name}</span>
           {isLoading[category.category_id] && (
             <Spinner size="sm" className="ml-2" />
           )}
           <ChevronIcon 
             className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
           />
         </div>
         
         {isExpanded && (
           <div className="category-sections">
             {sections.length > 0 ? (
               sections.map(section => (
                 <SectionItem 
                   key={section.section_id}
                   section={section}
                   withLazyLoadedProducts={true}
                 />
               ))
             ) : (
               <div className="empty-state">
                 {isLoading[category.category_id] 
                   ? "Cargando secciones..." 
                   : "No hay secciones en esta categoría"
                 }
               </div>
             )}
           </div>
         )}
       </div>
     );
   };
   ```

4. **Optimización de la experiencia inicial**:
   - Cargar inmediatamente solo datos esenciales (cliente, categorías)
   - Mostrar esqueletos de carga (skeletons) mientras se obtienen los datos iniciales
   - Implementar un sistema de priorización para cargar primero datos visibles
   - Diferir cargas secundarias hasta después de que la interfaz esté interactiva

#### Implementación gradual

La implementación se realizará en fases:

1. **Fase 1**: Refactorizar el código para separar controladores de eventos (completado)
2. **Fase 2**: Extraer componentes de vista a archivos separados
3. **Fase 3**: Implementar sistema de caché para categorías, secciones y productos
4. **Fase 4**: Reemplazar carga inicial agresiva por carga bajo demanda
5. **Fase 5**: Añadir indicadores visuales y mejorar la experiencia de usuario

Esta optimización dramática en la carga de datos complementará la paginación ya implementada, logrando tiempos de respuesta mucho menores y una experiencia más fluida.

## Buenas Prácticas de API

### Estructura de Respuestas

#### Respuestas Estándar (CRUD)
```typescript
// Éxito
{
  success: true,
  data: { /* datos relevantes */ }
}

// Error
{
  success: false,
  error: "Mensaje descriptivo del error"
}
```

#### Respuestas Paginadas
```typescript
{
  data: [ /* array de elementos */ ],
  meta: {
    total: 100,        // Total de elementos
    page: 2,           // Página actual
    limit: 10,         // Elementos por página
    totalPages: 10     // Total de páginas
  }
}
```

### Convenciones de Endpoints

1. **Consistencia de parámetros**: Usar siempre `id` como nombre de parámetro en rutas dinámicas
2. **Paginación**: Usar siempre `page` y `limit` como parámetros de consulta para paginación
3. **Filtrado**: Usar nombres descriptivos para parámetros de filtrado (ej: `category_id`)
4. **Errores**: Devolver siempre códigos HTTP apropiados junto con mensajes descriptivos

## Autenticación

Se usa NextAuth con los siguientes proveedores:
- Credenciales (email/password)

El flujo de autenticación incluye:
1. Login mediante formulario
2. Verificación de credenciales contra la base de datos
3. Creación de sesión y cookie de autenticación
4. Verificación de sesión en cada endpoint protegido 

## Componentes UI

### Componentes Generales

#### Pagination (components/ui/Pagination.tsx)
Componente genérico de paginación con soporte para cambio de página y tamaño de página.

```tsx
// Uso básico
<Pagination
  totalItems={100}
  itemsPerPage={10}
  currentPage={1}
  onPageChange={(page) => setPage(page)}
/>

// Con selector de tamaño de página
<Pagination
  totalItems={100}
  itemsPerPage={10}
  currentPage={1}
  onPageChange={(page) => setPage(page)}
  onPageSizeChange={(size) => setItemsPerPage(size)}
  pageSizeOptions={[10, 25, 50, 100]}
/>
```

**Props**:
- `totalItems`: Número total de elementos
- `itemsPerPage`: Elementos por página
- `currentPage`: Página actual (comenzando en 1)
- `onPageChange`: Función que se llama cuando se cambia de página
- `onPageSizeChange`: (opcional) Función que se llama cuando se cambia el tamaño de página
- `pageSizeOptions`: (opcional) Opciones de tamaño de página disponibles
- `maxPageButtons`: (opcional) Número máximo de botones de página a mostrar
- `disabled`: (opcional) Deshabilitar todos los botones
- `className`: (opcional) Clase CSS adicional

### Componentes de Tabla

#### CategoryTable (components/tables/CategoryTable.tsx)
Tabla para mostrar y gestionar categorías con soporte para paginación.

**Actualizado (28/03/2024)**: Ahora soporta paginación opcional a través de estas nuevas props:
- `paginationEnabled`: Activa/desactiva la paginación
- `currentPage`: Página actual
- `itemsPerPage`: Elementos por página
- `totalCategories`: Total de categorías (usado para metadatos de paginación)
- `onPageChange`: Función para cambiar de página
- `onPageSizeChange`: Función para cambiar el tamaño de página

La paginación está desactivada por defecto para mantener compatibilidad con el código existente.

```tsx
// Sin paginación (comportamiento original)
<CategoryTable
  categories={categories}
  expandedCategories={expandedCategories}
  onCategoryClick={handleCategoryClick}
/>

// Con paginación activada
<CategoryTable
  categories={categories}
  expandedCategories={expandedCategories}
  onCategoryClick={handleCategoryClick}
  
  paginationEnabled={true}
  currentPage={currentPage}
  itemsPerPage={itemsPerPage}
  totalCategories={totalCategories}
  onPageChange={handlePageChange}
  onPageSizeChange={handlePageSizeChange}
/>
```

#### Beneficios Implementados
1. **Rendimiento mejorado**: Reducción significativa de datos transferidos en cargas iniciales.
2. **Experiencia de usuario más fluida**: Carga más rápida de datos iniciales.
3. **Adopción gradual**: La paginación es opcional y puede activarse/desactivarse según se necesite.
4. **Interfaz intuitiva**: Controles claros y familiares para navegación entre páginas.
5. **Configurabilidad**: Soporte para diferentes tamaños de página según preferencias del usuario.

### Paginación en el Dashboard

#### UI de Paginación (implementado 28/03/2024)

Se han añadido nuevos componentes y funcionalidades para dar soporte a la paginación en la interfaz de usuario:

1. **Componente Pagination**:
   - Componente genérico y reutilizable para navegación entre páginas
   - Muestra información sobre el rango de elementos actuales
   - Soporta selector de tamaño de página
   - Diseño responsivo con soporte para móviles y escritorio

2. **Actualización de CategoryTable**:
   - Soporte para mostrar controles de paginación
   - Mantenimiento de funcionalidades existentes (expandir, reordenar, etc.)
   - La paginación es opcional y está desactivada por defecto

3. **Mejoras en la página de Dashboard**:
   - Botón para activar/desactivar paginación
   - Gestión de estado para opciones de paginación
   - Detección automática de respuestas paginadas vs. no paginadas

#### Flujo de Datos con Paginación

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   API con   │    │ DashboardSvc│    │ useDashboard│    │ Componentes │
│  Paginación │◄──►│ con soporte │◄──►│Categories con│◄──►│  UI con    │
│  Opcional   │    │ Paginación  │    │  Paginación │    │ Paginación  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

#### Beneficios Implementados
1. **Rendimiento mejorado**: Reducción significativa de datos transferidos en cargas iniciales.
2. **Experiencia de usuario más fluida**: Carga más rápida de datos iniciales.
3. **Adopción gradual**: La paginación es opcional y puede activarse/desactivarse según se necesite.
4. **Interfaz intuitiva**: Controles claros y familiares para navegación entre páginas.
5. **Configurabilidad**: Soporte para diferentes tamaños de página según preferencias del usuario. 