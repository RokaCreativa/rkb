# Los Mandamientos de la Refactorización 📜 (COMPLETADOS)

> "Conocerás lo que existe antes de crear algo nuevo"
> "Utilizarás componentes compartidos siempre que sea posible"
> "No duplicarás interfaces, tipos o componentes que ya existen"
> "Al cambiar funcionalidad, no tocarás la estética ni los estilos"
> "Garantizarás que todo funcione perfectamente en móviles y tabletas"

## 📢 IMPORTANTE: REFACTORIZACIÓN COMPLETADA

**La refactorización del dashboard ha sido completada exitosamente.** Se ha implementado una estructura orientada a dominios que mejora significativamente la organización y mantenibilidad del código. Para obtener la documentación más actualizada sobre la nueva estructura, consulta el archivo `app/dashboard-v2/README.md`.

**ACTUALIZACIÓN (10/04/2025)**: Se ha completado una limpieza exhaustiva eliminando carpetas que no seguían el patrón DDD (`shared`, `infrastructure`, `features`, `stores`) y moviendo todos los archivos a sus ubicaciones correctas. La estructura ahora sigue estrictamente el diseño orientado a dominios.

**ACTUALIZACIÓN (11/04/2025)**: Se han corregido problemas de importación en varios componentes (TopNavbar, CategoryTable, EditSectionModal, EditProductModal) para asegurar que siguen correctamente el patrón DDD. Se actualizaron las importaciones para que todas utilicen rutas absolutas siguiendo la estructura establecida.

## 🌟 Resumen del Proyecto RokaMenu

RokaMenu es una aplicación web para la gestión de menús digitales de restaurantes y otros negocios:

- Cada cliente (restaurante) tiene su propio menú digital accesible mediante un código QR personalizado
- Los clientes pueden gestionar completamente sus menús a través del dashboard (categorías, secciones, productos)
- Los usuarios finales pueden ver los menús en sus dispositivos móviles, tablets u ordenadores
- Soporte multilingüe que permitirá traducción automática de los menús (en desarrollo)
- Sistema de gestión completo con arrastrar y soltar para reorganizar elementos
- Personalización visual específica para cada tipo de elemento (categorías, secciones, productos)

## 🎯 Objetivo Principal (LOGRADO)

- ✅ Mantener EXACTAMENTE la misma funcionalidad
- ✅ Aplicar patrones modernos SIN sobre-ingenierizar
- ✅ Implementar arquitectura limpia
- ✅ Verificar la estructura existente antes de crear cualquier componente nuevo
- ✅ Mantener total separación de responsabilidades

## 🚫 MANDAMIENTO SUPREMO: RESPETARÁS LA REFACTORIZACIÓN REALIZADA

Los siguientes principios ya han sido implementados en la nueva estructura:

- ✅ No hay duplicados de componentes o hooks existentes
- ✅ Separación clara de responsabilidades
- ✅ No hay interfaces, tipos o componentes duplicados
- ✅ La estructura de carpetas establecida se mantiene:
  - Componentes principales en `dashboard-v2/components/core/`
  - Componentes de dominio en `dashboard-v2/components/domain/` (categorías, secciones, productos)
  - Modales en `dashboard-v2/components/modals/`
  - Componentes de vista en `dashboard-v2/components/views/`
  - Componentes de UI en `dashboard-v2/components/ui/`
  - Hooks principales en `dashboard-v2/hooks/core/`
  - Hooks de dominio en `dashboard-v2/hooks/domain/` (categoría, sección, producto)
  - Hooks de UI en `dashboard-v2/hooks/ui/`
  - Estados de UI en `dashboard-v2/hooks/ui/state/`
  - Tipos en `dashboard-v2/types/` organizados por dominio, API y UI
  - Utilidades en `dashboard-v2/utils/`
  - Servicios en `dashboard-v2/services/`
  - Constantes en `dashboard-v2/constants/`

## 🔍 MANDAMIENTO DE PUREZA FUNCIONAL: SEPARARÁS FUNCIONALIDAD DE ESTÉTICA

Este principio ha sido implementado completamente:

- ✅ La lógica de negocio está separada de los aspectos visuales
- ✅ Los estilos se mantienen consistentes y separados de la lógica
- ✅ Los cambios funcionales no afectan la apariencia visual
- ✅ Se utilizan componentes existentes con sus estilos actuales
- ✅ La lógica y la presentación están claramente separadas en cada componente

## 📋 MANDAMIENTO CRÍTICO: CONOCERÁS LA ESTRUCTURA ANTES DE CREAR

Para futuros desarrollos, recuerda estos principios fundamentales:

- **SIEMPRE VERIFICARÁS** lo que ya existe antes de crear cualquier nuevo componente o archivo
- **NUNCA crearás** un componente o hook si ya existe uno con la misma funcionalidad
- **Consultarás la documentación** regularmente para evitar duplicidades
- **Utilizarás herramientas de búsqueda** para explorar exhaustivamente antes de crear

La nueva estructura de archivos ya se encuentra implementada:

```
app/dashboard-v2/
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
│   ├── ui/                 # Tipos para componentes de UI
│   ├── index.ts            # Exportaciones centralizadas
│   └── type-adapters.ts    # Adaptadores para conversión de tipos
└── utils/                  # Utilidades y helpers
```

## 📋 MANDAMIENTO DE VERIFICACIÓN ESTRUCTURAL

Este principio debe seguirse para todas las futuras adiciones al dashboard:

- **SIEMPRE VERIFICARÁS** la estructura existente antes de crear algo nuevo
- Seguirás el procedimiento de verificación documentado:
  1. **Consultar documentación actualizada** para entender el contexto
  2. **Explorar directorios relevantes** usando herramientas apropiadas
  3. **Buscar elementos similares** antes de crear nuevos
  4. **Comprobar hooks y utilidades disponibles** antes de crear nuevos
  5. **Validar ubicación y nomenclatura** para mantener coherencia

## 📁 MANDAMIENTO DE UBICACIÓN CORRECTA: NUNCA PONDRÁS ARCHIVOS EN EL LUGAR EQUIVOCADO

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

## 🧩 MANDAMIENTO DE REUTILIZACIÓN: UTILIZARÁS EL SISTEMA DE COMPONENTES COMPARTIDOS

La nueva estructura implementa un sistema de componentes compartidos que:

- ✅ Centraliza la gestión de componentes reutilizables
- ✅ Proporciona una interfaz unificada para elementos comunes
- ✅ Mantiene la coherencia visual y de comportamiento en toda la aplicación
- ✅ Facilita la actualización y mantenimiento centralizados

### Sistema de Componentes Grid

Para los componentes de grid (tablas de categorías, secciones, productos) se ha implementado un sistema especializado:

- **GridIcon**: Componente centralizado para gestionar todos los íconos del sistema
- **useGridIcons**: Hook para acceder y gestionar los íconos de manera programática
- **Identidad Visual por Tipo**:
  - Categorías: Esquema de color indigo
  - Secciones: Esquema de color teal
  - Productos: Esquema de color yellow

Para cambiar un ícono en toda la aplicación, simplemente se modifica en el archivo `constants/iconConfig.ts`.

## 📊 MANDAMIENTO DE ESTRUCTURA DE DATOS: RESPETARÁS EL MODELO DE DATOS

Se ha implementado un modelo de datos jerárquico claramente definido:

```
Cliente
  └── Categoría
       └── Sección
            └── Producto
```

Con tipos específicos para cada entidad y sus relaciones:

- **Cliente** (`Client`): Representa al restaurante o negocio

  ```typescript
  interface Client {
    id: number; // Identificador único del cliente
    name: string; // Nombre del negocio
    main_logo: string | null; // Logo principal del negocio
    // ... otras propiedades
  }
  ```

- **Categoría** (`Category`): Grupo principal de elementos del menú

  ```typescript
  interface Category {
    category_id: number; // Identificador único de la categoría
    name: string; // Nombre de la categoría
    image: string | null; // Imagen representativa (opcional)
    status: number; // Estado (1: visible, 0: oculta)
    display_order: number; // Orden de visualización
    client_id: number; // Cliente al que pertenece
    // ... otras propiedades
  }
  ```

- **Sección** (`Section`): Subdivisión de categoría

  ```typescript
  interface Section {
    section_id: number; // Identificador único de la sección
    name: string; // Nombre de la sección
    image: string | null; // Imagen representativa
    category_id: number; // Categoría a la que pertenece
    client_id: number; // Cliente al que pertenece
    display_order: number; // Orden de visualización
    status: number; // Estado (1: visible, 0: oculta)
    // ... otras propiedades
  }
  ```

- **Producto** (`Product`): Elemento individual del menú
  ```typescript
  interface Product {
    product_id: number; // Identificador único del producto
    name: string; // Nombre del producto
    image: string | null; // Imagen del producto
    status: number; // Estado (1: visible, 0: oculto)
    price: string; // Precio del producto
    section_id: number; // Sección a la que pertenece
    client_id: number; // Cliente al que pertenece
    display_order: number; // Orden de visualización
    // ... otras propiedades
  }
  ```

## 🎨 MANDAMIENTO DE ESTILOS Y COHERENCIA VISUAL

La refactorización ha mantenido la coherencia visual:

- ✅ Estilos consistentes por tipo de entidad
- ✅ Identidad de color específica para cada tipo (categorías, secciones, productos)
- ✅ Clases CSS organizadas y documentadas

## 🔄 MANDAMIENTO DE ACTUALIZACIÓN: ACTUALIZARÁS LOS MANDAMIENTOS CUANDO SEA NECESARIO

Cuando se realicen cambios importantes en la estructura, funcionalidad o patrones:

- ✅ Se actualizará este documento para reflejar los cambios
- ✅ Se asegurará que los nuevos cambios funcionen correctamente antes de actualizar los mandamientos
- ✅ Se documentará cualquier nuevo componente, hook o utilidad compartida
- ✅ Se mantendrá la lista de mandamientos actualizada y relevante

La última actualización de este documento es del **10 de abril de 2025**.

## 🚀 PRÓXIMOS PASOS

Con la refactorización completada, ahora es posible:

1. **Ampliar funcionalidades**: Añadir nuevas características manteniendo la nueva arquitectura
2. **Mejorar rendimiento**: Optimizar componentes y operaciones específicas
3. **Extender tipos**: Refinar el sistema de tipos para mayor seguridad y autocompletado
4. **Añadir tests**: Implementar pruebas unitarias y de integración
5. **Implementar multilenguaje**: Desarrollar el sistema de traducción automática para los menús

## 📚 RECURSOS Y REFERENCIAS

Para obtener información detallada sobre la nueva estructura:

- `app/dashboard-v2/README.md` - Documentación principal sobre la nueva estructura
- `docs/dashboard-v2-estructura-y-mandamientos.md` - Mandamientos actualizados
- `docs/archive/dashboard-v2-modelo-datos.md` - Detalles completos del modelo de datos
- `docs/archive/sistema-componentes-compartidos.md` - Documentación del sistema de componentes compartidos

> "Un proyecto ordenado es un proyecto mantenible"
> "Conocer la estructura es el primer paso para respetarla"

## 📱 MANDAMIENTO DE RESPONSIVIDAD: GARANTIZARÁS EXPERIENCIA PERFECTA EN MÚLTIPLES DISPOSITIVOS

Este mandamiento es FUNDAMENTAL y no puede ser ignorado bajo ninguna circunstancia. La aplicación DEBE funcionar perfectamente en todos los dispositivos:

- ✅ **SIEMPRE probarás** cualquier cambio en múltiples tamaños de pantalla:

  - Móviles: 320px - 480px
  - Tabletas: 481px - 1024px
  - Escritorio: 1025px y superior

- ✅ **NUNCA implementarás** estilos que funcionen solo en escritorio
- ✅ **SIEMPRE utilizarás** unidades relativas (rem, em, %, vh/vw) en lugar de píxeles fijos
- ✅ **SIEMPRE seguirás** el enfoque "mobile-first" para el desarrollo de CSS
- ✅ **SIEMPRE implementarás** controles adaptados para interacción táctil:
  - Áreas de toque suficientemente grandes (mínimo 44px × 44px)
  - Acciones de arrastrar y soltar optimizadas para pantallas táctiles
  - Menús y controles adaptados para diferentes tamaños de pantalla

### Patrones de Diseño Responsivo Obligatorios

1. **Layout Fluido**: Todos los contenedores principales deben usar porcentajes o unidades flexibles
2. **CSS Grid y Flexbox**: Utiliza estas tecnologías para crear layouts responsivos
3. **Media Queries**: Define puntos de quiebre consistentes para adaptarse a diferentes dispositivos:

   ```css
   /* Móvil (por defecto) */
   .component {
     ...;
   }

   /* Tablet */
   @media (min-width: 481px) {
     ...;
   }

   /* Desktop */
   @media (min-width: 1025px) {
     ...;
   }
   ```

4. **Imágenes Responsivas**: Utiliza `srcset` y `sizes` para cargar imágenes apropiadas según el dispositivo
5. **Componentes Adaptables**: Cada componente debe modificar su presentación según el espacio disponible

### Consideraciones Específicas para la UI de RokaMenu

- **Tablas y Grids**: Deben adaptarse en móviles mostrando información crítica y permitiendo ver detalles adicionales mediante expansión
- **Controles de Arrastrar y Soltar**: Deben funcionar con gestos táctiles, con controles alternativos cuando sea necesario
- **Menús Expandibles**: En móviles, los menús laterales deben ocultarse y ser accesibles mediante un botón de hamburguesa
- **Formularios**: Deben reorganizarse verticalmente en pantallas pequeñas, con controles de tamaño adecuado para entrada táctil
- **Modales y Popups**: Deben redimensionarse apropiadamente, nunca excediendo los límites de la pantalla del dispositivo

### Reglas Técnicas para Garantizar Responsividad

1. **Meta Viewport Correcto**: Siempre debe estar presente en todas las páginas
   ```html
   <meta
     name="viewport"
     content="width=device-width, initial-scale=1.0, maximum-scale=5.0"
   />
   ```
2. **Testing Obligatorio**: Cada nueva característica o cambio DEBE ser probado en:
   - Al menos 2 tamaños de móvil diferentes
   - Al menos 1 tamaño de tableta
   - Escritorio estándar
3. **Herramientas de Desarrollo**: Utiliza constantemente las herramientas de emulación de dispositivo del navegador
4. **Optimización de Rendimiento**: La carga y rendimiento en dispositivos móviles debe ser prioritaria

La violación de este mandamiento es considerada CRÍTICA, ya que la mayoría de los usuarios finales accederán a los menús desde dispositivos móviles. Una experiencia deficiente en estos dispositivos impacta directamente en la satisfacción del cliente y el valor del producto.
