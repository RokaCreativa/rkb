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

##### 📄 `CategoryTable.tsx` (importado desde components/CategoryTable.tsx)

Una tabla especializada para mostrar categorías.

**¿Qué hace específicamente?**
- Muestra categorías en filas con columnas para nombre, imagen, orden, etc.
- Implementa funcionalidades como expandir/contraer filas
- Soporta arrastrar y soltar para reordenar
- Incluye acciones en línea (editar, eliminar, mostrar/ocultar)
- Separa visualmente categorías visibles y ocultas

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