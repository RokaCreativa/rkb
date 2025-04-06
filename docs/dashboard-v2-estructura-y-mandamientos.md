# 📋 ESTRUCTURA Y MANDAMIENTOS DEL DASHBOARD V2 (ACTUALIZADO)

> "Conocerás lo que existe antes de crear algo nuevo"
> "No duplicarás lo que ya está creado"
> "Separarás la función de la estética"

## 📢 ACTUALIZACIÓN IMPORTANTE

**La estructura del proyecto ha sido completamente refactorizada siguiendo un diseño orientado a dominio (Domain-Driven Design).** La nueva estructura organiza el código por áreas funcionales en lugar de por tipos de archivos, mejorando significativamente la mantenibilidad y comprensión del código.

**ACTUALIZACIÓN (10/04/2025)**: Se ha completado una limpieza exhaustiva eliminando carpetas que no seguían el patrón DDD (`shared`, `infrastructure`, `features`, `stores`) y moviendo todos los archivos a sus ubicaciones correctas. La estructura ahora sigue estrictamente el diseño orientado a dominios.

**ACTUALIZACIÓN (11/04/2025)**: Se han corregido problemas de importación en los componentes de vistas, componentes core y modales para asegurar que sigan correctamente el patrón DDD. Se corrigieron:

- Importación incorrecta en TopNavbar.tsx (CustomizationModal)
- Importación incorrecta en CategoryTable.tsx (SectionList)
- Importación incorrecta en EditSectionModal.tsx (useSectionManagement)
- Importación incorrecta en EditProductModal.tsx (useProductManagement)
- Corrección de tipos implícitos en CategoryTable.tsx

**Consulta el archivo `app/dashboard-v2/README.md` para obtener la documentación más actualizada sobre la nueva estructura.**

## 🔍 MANDAMIENTOS DE DESARROLLO Y REFACTORIZACIÓN

### 📌 Mandamiento Principal de Verificación Estructural

Este mandamiento establece la obligación absoluta de verificar la estructura existente del proyecto antes de crear cualquier nuevo componente, hook, utilidad o archivo. Su propósito es prevenir duplicidades accidentales, mantener la coherencia arquitectónica y asegurar que todo desarrollo se alinee con los patrones establecidos.

#### 📑 Reglas Esenciales

1. **SIEMPRE VERIFICARÁS** la estructura existente antes de crear nuevos elementos
2. **NUNCA CREARÁS** duplicados por desconocimiento de lo que ya existe
3. **CONSULTARÁS** regularmente la documentación de estructura
4. **EXPLORARÁS** el código base utilizando herramientas de búsqueda
5. **DOCUMENTARÁS** cualquier adición a la estructura
6. **VERIFICARÁS** que no existan archivos o interfaces con propósitos similares en ubicaciones diferentes

#### 🔄 Regla Anti-Duplicidad

Es **ESTRICTAMENTE PROHIBIDO** crear:

- Componentes duplicados con el mismo nombre en diferentes ubicaciones
- Interfaces duplicadas o similares para los mismos propósitos
- Hooks con funcionalidades similares en diferentes ubicaciones
- Utilidades que duplican funcionalidad existente

### 📌 Mandamiento de Ubicación Correcta

Este mandamiento es crítico para mantener la estructura limpia y evitar confusión:

- ✅ **NUNCA coloques** archivos en la raíz de `components/` o `hooks/`
- ✅ **SIEMPRE coloca** cada archivo en su subdirectorio específico:
  - Hooks principales → `hooks/core/`
  - Hooks de UI → `hooks/ui/`
  - Estados globales → `hooks/ui/state/`
  - Hooks específicos de dominio → `hooks/domain/category/`, `hooks/domain/section/` o `hooks/domain/product/`
  - Componentes principales → `components/core/`
  - Componentes específicos de dominio → `components/domain/categories/`, `components/domain/sections/` o `components/domain/products/`
  - Modales → `components/modals/`
  - Componentes de UI → `components/ui/`
  - Componentes de vistas → `components/views/`
- ✅ **NUNCA crees** carpetas que no sigan el patrón establecido
- ✅ **NUNCA crees** estructuras paralelas como `shared/`, `infrastructure/`, `features/` o `stores/`

La violación de este mandamiento genera:

- Duplicidad de archivos
- Confusión sobre qué versión es la correcta
- Dificultad para encontrar los archivos adecuados
- Mayor complejidad para mantener el código

#### 📋 Procedimiento de Verificación

Antes de crear cualquier elemento nuevo, seguirás este procedimiento:

1. **Consultar documentación**:

   - Revisar el archivo `app/dashboard-v2/README.md` para entender la estructura completa
   - Examinar modelos de datos y optimizaciones

2. **Explorar directorios relacionados**:

   - Explorar las carpetas relevantes
   - Verificar qué archivos y componentes ya existen
   - Entender la organización y convenciones de nomenclatura
   - **Buscar archivos con nombres similares o propósitos similares**

3. **Buscar elementos similares**:

   - Buscar componentes o utilidades similares
   - Verificar si ya existe algún elemento que pueda ser reutilizado o adaptado
   - Examinar cómo están implementados los elementos similares

4. **Comprobar hooks existentes**:

   - Revisar `hooks/domain/`, `hooks/core/` y `hooks/ui/` en busca de hooks que puedan ser reutilizados
   - Entender la separación entre hooks por dominio
   - Verificar si la funcionalidad necesaria ya está implementada en algún hook

5. **Validar nomenclatura y ubicación**:
   - Asegurar que el nombre del nuevo elemento sigue las convenciones establecidas
   - Verificar que la ubicación propuesta es coherente con la estructura
   - Confirmar que respeta la separación de responsabilidades

### 📌 Mandamiento de Separación de Funcionalidad

> "Separarás la función de la estética, y la lógica de negocio de la presentación"

La separación de responsabilidades es fundamental para mantener un código mantenible y escalable:

1. **Cada hook debe tener una única responsabilidad**
2. **La lógica de negocio debe estar en hooks, no en componentes**
3. **Los componentes deben centrarse en la presentación**
4. **Utiliza adaptadores para convertir entre diferentes sistemas de tipos**

## 🚀 ESTRUCTURA DE ARCHIVOS Y CARPETAS DEL DASHBOARD V2 (ACTUALIZADA)

La nueva estructura sigue un diseño orientado a dominio:

```
dashboard-v2/
├── components/             # Componentes de la UI
│   ├── core/               # Componentes principales y organizadores
│   ├── domain/             # Componentes específicos de dominio
│   │   ├── categories/     # Componentes específicos para categorías
│   │   ├── sections/       # Componentes específicos para secciones
│   │   └── products/       # Componentes específicos para productos
│   ├── modals/             # Modales (creación, edición, eliminación)
│   ├── ui/                 # Componentes de UI reutilizables
│   │   ├── Button/         # Componentes de botones
│   │   ├── Form/           # Componentes de formularios
│   │   ├── Modal/          # Componentes base para modales
│   │   ├── Table/          # Componentes de tablas
│   │   └── grid/           # Componentes específicos para grids
│   └── views/              # Vistas principales de la aplicación
├── constants/              # Constantes y configuraciones
├── hooks/                  # Hooks personalizados para la lógica
│   ├── core/               # Hooks principales (fachadas, coordinación)
│   ├── domain/             # Hooks específicos de dominio
│   │   ├── category/       # Hooks para gestión de categorías
│   │   ├── section/        # Hooks para gestión de secciones
│   │   └── product/        # Hooks para gestión de productos
│   └── ui/                 # Hooks relacionados con la UI
│       └── state/          # Estados globales (stores)
├── services/               # Servicios de API y externos
├── types/                  # Definiciones de tipos
│   ├── domain/             # Tipos específicos de dominio
│   │   ├── category.ts     # Tipos para categorías
│   │   ├── section.ts      # Tipos para secciones
│   │   └── product.ts      # Tipos para productos
│   ├── ui/                 # Tipos para componentes de UI
│   │   ├── common.ts       # Tipos compartidos de UI
│   │   └── modals.ts       # Tipos para modales
│   ├── type-adapters.ts    # Adaptadores para conversión de tipos
│   └── index.ts            # Exportaciones centralizadas
└── utils/                  # Utilidades y helpers
```

### 🔍 Elementos Clave de la Nueva Estructura

#### 📁 Organización por Dominios

Cada dominio de negocio (categorías, secciones, productos) tiene su propia carpeta dedicada para componentes, hooks y tipos.

#### 📁 Separación de Lógica y Presentación

- **hooks/domain/**: Contiene toda la lógica de negocio específica por dominio
- **hooks/core/**: Contiene hooks integradores como useDashboardState que actúa como fachada
- **hooks/ui/**: Contiene hooks específicos para la interfaz de usuario
- **hooks/ui/state/**: Contiene estados globales de la aplicación

#### 📁 Sistema de Tipos por Dominio

Cada dominio tiene sus propios tipos definidos en carpetas específicas:

- **types/domain/category.ts**: Tipos específicos para categorías
- **types/domain/section.ts**: Tipos específicos para secciones
- **types/domain/product.ts**: Tipos específicos para productos

### 🧩 Patrón Facade

El hook principal `useDashboardState` actúa como una fachada, integrando los hooks de dominio específicos y proporcionando una interfaz unificada para los componentes.

### 🔄 Flujo de Datos

El flujo de datos en el dashboard-v2 sigue el siguiente patrón:

1. Los **hooks de gestión** (`useCategoryManagement`, `useSectionManagement`, `useProductManagement`) se encargan de las operaciones CRUD para las entidades.
2. El **hook principal** `useDashboardState` coordina todos los hooks de gestión y proporciona un punto único de acceso a las funciones y estados.
3. Los **componentes de vista** utilizan `useDashboardState` para acceder a los datos y funciones necesarias.
4. Los **componentes individuales** reciben datos y callbacks a través de props.
5. Las **acciones del usuario** desencadenan operaciones que actualizan tanto el estado local como el backend a través de llamadas API.

### 🧩 Sistema de Componentes Grid

Para los componentes de grid (tablas de categorías, secciones, productos) se ha implementado un sistema especializado:

- **GridIcon**: Componente centralizado para gestionar todos los íconos del sistema
- **useGridIcons**: Hook para acceder y gestionar los íconos de manera programática
- **Identidad Visual por Tipo**:
  - Categorías: Esquema de color indigo
  - Secciones: Esquema de color teal
  - Productos: Esquema de color yellow

Para cambiar un ícono en toda la aplicación, simplemente se modifica en el archivo `constants/iconConfig.ts`.

## 📢 RECORDATORIO CRÍTICO

**NUNCA** asumas que conoces la estructura completa. **SIEMPRE** verifica antes de crear. La documentación y exploración son pasos obligatorios que no pueden ser omitidos bajo ninguna circunstancia.

**IMPORTANTE (10/04/2025)**: Se han eliminado todas las carpetas que no seguían el patrón DDD (`shared`, `infrastructure`, `features`, `stores`) y se han movido todos los archivos a sus ubicaciones correctas. La estructura ahora sigue estrictamente el diseño orientado a dominios.

> "Un minuto de verificación ahorra horas de corrección y refactorización"
